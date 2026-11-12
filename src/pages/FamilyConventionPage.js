import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SignaturePad from '../components/application/SignaturePad';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Choice = ({ label, value, onChange, options }) => (
  <Box>
    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <ToggleButtonGroup
      exclusive
      fullWidth
      orientation="vertical"
      size="small"
      color="primary"
      value={value}
      onChange={(e, v) => v && onChange(v)}>
      {options.map(([v, text]) => (
        <ToggleButton
          key={v}
          value={v}
          sx={{
            textTransform: 'none',
            justifyContent: 'flex-start',
            textAlign: 'left',
          }}>
          {text}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Box>
);

const Line = ({ label, children }) =>
  children ? (
    <Typography variant="body2">
      <Typography component="span" variant="body2" color="text.secondary">
        {label} :{' '}
      </Typography>
      {children}
    </Typography>
  ) : null;

// The family convention, read, completed and signed by a legal guardian on
// their phone (personal link, no account)
const FamilyConventionPage = () => {
  const { token } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null);
  const [signature, setSignature] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [done, setDone] = useState(null);
  useEffect(() => {
    axios
      .get(`${BASE_URL}/convention-famille/${token}`)
      .then(({ data }) => {
        setPage(data);
        const p = data.prefill;
        setForm({
          nom_responsable: p.nom_responsable,
          relation: '',
          telephone: p.telephone,
          email: p.email,
          adresse: p.adresse,
          caution_mode: '',
          venir_seul: '',
          partir: '',
          accompagnants: '',
          engagements: {},
        });
      })
      .catch((err) =>
        setError(err.response?.data?.error || 'Page indisponible')
      );
  }, [token]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setValue = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const send = async () => {
    setBusy(true);
    setSendError(null);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/convention-famille/${token}`,
        { ...form, signature }
      );
      setDone(data);
    } catch (err) {
      setSendError(
        err.response?.data?.error || "La signature n'a pas pu être enregistrée"
      );
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">{error}</Alert>
      </Container>
    );
  }
  if (!page || !form) return <LinearProgress sx={{ mt: 4 }} />;
  const header = (
    <Box>
      <Typography variant="overline" color="text.secondary">
        Association Séphora Berrebi
      </Typography>
      <Typography variant="h5" component="h1">
        Convention d'engagement {page.year}
      </Typography>
      <Typography color="text.secondary">Pour {page.child}</Typography>
    </Box>
  );
  if (done || page.state === 'signée') {
    return (
      <Container maxWidth="sm" sx={{ mt: 3, mb: 6 }}>
        <Stack spacing={2}>
          {header}
          <Alert severity="success">
            Merci, la convention de {page.child} est signée par vous et par
            l'association.
            {done?.copy_sent
              ? ' Votre exemplaire vous a été envoyé par e-mail.'
              : ''}
          </Alert>
        </Stack>
      </Container>
    );
  }
  if (page.state !== 'envoyée') {
    return (
      <Container maxWidth="sm" sx={{ mt: 3 }}>
        <Stack spacing={2}>
          {header}
          <Alert severity="warning">
            Ce lien a expiré ou a été remplacé. Demandez-en un nouveau à
            l'association.
          </Alert>
        </Stack>
      </Container>
    );
  }
  const p = page.prefill;
  const ready =
    form.nom_responsable.trim() &&
    form.relation &&
    form.telephone.replace(/\D/g, '').length >= 9 &&
    form.adresse.trim().length >= 8 &&
    form.caution_mode &&
    form.venir_seul &&
    form.partir &&
    (form.partir !== 'accompagne' || form.accompagnants.trim()) &&
    page.engagements.every((e) => form.engagements[e.id]) &&
    signature;
  return (
    <Container maxWidth="sm" sx={{ mt: 3, mb: 6 }}>
      <Stack spacing={2.5}>
        {header}
        <Typography>
          Merci de vérifier les informations, de compléter ce qui manque, de
          cocher les engagements et de signer (environ 5 minutes). L'association
          contresigne aussitôt et vous recevez votre exemplaire.
        </Typography>
        <Link
          href={`${BASE_URL}/convention-famille/${token}/apercu`}
          target="_blank"
          rel="noreferrer">
          Lire la convention complète (PDF)
        </Link>

        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography fontWeight={600} sx={{ mb: 0.5 }}>
            L'enfant
          </Typography>
          <Line label="Nom">{p.nom_eleve}</Line>
          <Line label="Classe">{p.classe}</Line>
          <Line label="Établissement">{p.etablissement}</Line>
          <Line label="Quotient familial">{p.quotient_familial}</Line>
          <Line label="Tutorat souhaité">
            {[
              p.presentiel && 'en présentiel',
              p.distanciel && 'en distanciel',
              page.team.autre,
            ]
              .filter(Boolean)
              .join(', ')}
          </Line>
          <Line label="Lieu souhaité">{p.lieu}</Line>
          <Line label="Horaire souhaité">{p.horaire}</Line>
          <Line label="Participation aux frais">{page.team.participation}</Line>
          <Line label="Caution">{page.team.caution}</Line>
          <Line label="Obligations spécifiques">{page.team.obligations}</Line>
          <Typography variant="caption" color="text.secondary">
            Une erreur ? Signalez-la à l'association avant de signer.
          </Typography>
        </Paper>

        <Typography fontWeight={600}>Vous</Typography>
        <TextField
          label="Votre nom et prénom"
          value={form.nom_responsable}
          onChange={set('nom_responsable')}
        />
        <TextField
          select
          label="Vous êtes"
          value={form.relation}
          onChange={set('relation')}>
          {page.relations.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Votre adresse"
          value={form.adresse}
          onChange={set('adresse')}
        />
        <TextField
          label="Téléphone"
          value={form.telephone}
          onChange={set('telephone')}
          inputProps={{ inputMode: 'tel' }}
        />
        <TextField
          label="E-mail (pour recevoir votre exemplaire)"
          value={form.email}
          onChange={set('email')}
          inputProps={{ inputMode: 'email' }}
        />

        <Choice
          label="Je donne ma caution"
          value={form.caution_mode}
          onChange={setValue('caution_mode')}
          options={[
            ['especes', 'En espèces'],
            ['cheque', 'Par chèque'],
          ]}
        />
        <Choice
          label={`J'autorise ${page.child} à venir seul(e)`}
          value={form.venir_seul}
          onChange={setValue('venir_seul')}
          options={[
            ['oui', 'Oui'],
            ['non', 'Non'],
          ]}
        />
        <Choice
          label={`J'autorise ${page.child} à partir`}
          value={form.partir}
          onChange={setValue('partir')}
          options={[
            ['seul', 'Seul(e)'],
            ['accompagne', 'Accompagné(e) par des personnes que j’indique'],
            [
              'cherche',
              'Je n’autorise pas mon enfant à partir seul et je viens le chercher',
            ],
          ]}
        />
        {form.partir === 'accompagne' && (
          <TextField
            label="Accompagné(e) par (NOM Prénom, …)"
            value={form.accompagnants}
            onChange={set('accompagnants')}
          />
        )}

        <Typography fontWeight={600}>Vos engagements</Typography>
        <Stack spacing={1}>
          {page.engagements.map((e) => (
            <Paper key={e.id} variant="outlined" sx={{ p: 1 }}>
              <FormControlLabel
                sx={{ alignItems: 'flex-start', m: 0 }}
                control={
                  <Checkbox
                    checked={!!form.engagements[e.id]}
                    onChange={(ev) =>
                      setForm((f) => ({
                        ...f,
                        engagements: {
                          ...f.engagements,
                          [e.id]: ev.target.checked,
                        },
                      }))
                    }
                    sx={{ mt: -0.75 }}
                  />
                }
                label={<Typography variant="body2">{e.text}</Typography>}
              />
            </Paper>
          ))}
        </Stack>

        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Votre signature
          </Typography>
          <SignaturePad onChange={setSignature} />
        </Box>
        {sendError && <Alert severity="error">{sendError}</Alert>}
        <Button
          size="large"
          variant="contained"
          disabled={!ready || busy}
          onClick={send}>
          Signer la convention
        </Button>
        {!ready && (
          <Typography variant="caption" color="text.secondary">
            Votre nom, votre lien avec l'enfant, l'adresse, le téléphone, la
            caution, l'arrivée et le départ, toutes les cases et votre signature
            sont nécessaires.
          </Typography>
        )}
      </Stack>
    </Container>
  );
};

export default FamilyConventionPage;
