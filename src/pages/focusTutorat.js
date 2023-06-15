import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Link,
  Container,
} from '@mui/material';
import BorderedBoxWithLabel from '../components/borderedBox';

const focusTutorat = () => {
  return (
    <Container>
      <Grid container spacing={3} m={2}>
        {/* <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            FOCUS SUR LE TUTORAT
          </Typography>
        </Grid> */}
        <Grid item xs={12}>
          <BorderedBoxWithLabel label="Focus sur le tutorat">
            <Card sx={{ padding: 3, backgroundColor: '#F3f7f6' }}>
              <CardContent>
                <Typography variant="body1">Vous</Typography>
                <Typography variant="body1" paragraph>
                  ... êtes un étudiant en école d'ingénieur et souhaitez dédier
                  une ou deux heures de votre temps à un lycéen en risque de
                  décrochage dans les matières scientifiques?
                </Typography>
                <Typography variant="body1" paragraph>
                  ... avez expérimenté l'aide aux devoirs avec vos enfants et
                  pensez pouvoir assister un autre enfant ?
                </Typography>
                <Typography variant="body1" paragraph>
                  ... êtes un professionnel de l'éducation prêt à faire
                  bénéficier un élève de votre savoir-faire de manière
                  personnalisée ?
                </Typography>
                <Typography variant="body1" paragraph>
                  ... aimeriez donner de votre temps, maintenant que vous êtes à
                  la retraite, à un jeune issu d’un milieu socio-culturel peu
                  favorisé ?
                </Typography>
                <Typography variant="body1" paragraph>
                  ... cherchez à faire du mécénat de compétences, un stage
                  citoyen ou un service civique ?
                </Typography>
                <Typography variant="body1" paragraph>
                  ... êtes passionné de littérature et proposez d'aider un jeune
                  à préparer son bac de français ? 
                </Typography>
                <Typography variant="body1" paragraph>
                  ... avez envie de raconter une histoire deux fois par semaine
                  à distance à un enfant de grande section ou de CP dont
                  l’environnement est linguistiquement défavorisé ? 
                </Typography>
                <Typography variant="body1" paragraph>
                  ... souhaitez partager votre enthousiasme pour le savoir et la
                  connaissance avec des enfants qui n’ont pas la chance d’avoir
                  des « sachants » dans leur entourage ? 
                </Typography>
                <Typography variant="body1" paragraph>
                  ... donnez déjà des cours particuliers et souhaitez ajouter
                  une corde civique à votre arc citoyen ? 
                </Typography>
                {/* Add more bullet points here */}
                <Typography variant="body1" paragraph>
                  ... êtes disponible hors temps scolaire et, éventuellement,
                  pendant les vacances?
                </Typography>
                <Typography variant="body1" paragraph>
                  Rejoignez le réseau de "bénévolants" de l'association Séphora
                  Berrebi !
                </Typography>
                <Typography variant="body1" color="#05A4D0">
                  <b>Les bénéficiaires de tutorat</b>
                </Typography>
                <Typography variant="body1" paragraph>
                  Parmi les enfants et adolescents accompagnés, beaucoup ont des
                  lacunes, accumulées au fil des ans ou plus récemment pendant
                  le confinement, certains ont des troubles de l’apprentissage
                  pris en charge par ailleurs par des spécialistes, la plupart
                  sont issus de milieux peu favorisés, certains sont en risque
                  de décrochage scolaire, quelques-uns sont atteints d’une
                  maladie grave. Tous sont motivés!
                </Typography>
                <Typography variant="body1" color="#05A4D0">
                  <b>Comment se déroule le tutorat ?</b>
                </Typography>
                <Typography variant="body1" paragraph>
                  Chaque tuteur bénévole accompagne sur une année scolaire un
                  enfant ou un adolescent une à trois heures par semaine à
                  horaires réguliers dans une ou plusieurs matières définies.
                  Une fois votre candidature validée, l’association cherche,
                  parmi les demandes en attente, un ou plusieurs bénéficiaires
                  qui correspondent à vos souhaits (matière, niveau, horaire,
                  durée, lieu).
                </Typography>
                <Typography variant="body1" paragraph>
                  La séance est dispensée soit en présentiel, toujours dans le
                  même lieu, soit à distance via la plateforme de l’association.
                </Typography>
                <Typography variant="body1" paragraph>
                  Chaque bénévole reçoit une formation : à propos de la posture
                  du tuteur et le cas échéant, de la mise en place d’une
                  expérience de tutorat fluide à distance, mais aussi un partage
                  d’expérience régulier par une orthophoniste et un parcours par
                  une didacticienne en raisonnement logico-mathématique. Nous
                  n’envisageons pas l’accompagnement sans prise de hauteur et
                  réflexion sur l’acte de tutorat.
                </Typography>
                <Typography variant="body1" paragraph>
                  Des points réguliers permettent d’échanger sur les aspects
                  pédagogiques, logistiques ou techniques.
                </Typography>
                <Typography variant="body1" color="#05A4D0">
                  <b>Comment postuler ?</b>
                </Typography>
                <Typography variant="body1" paragraph>
                  Il suffit de choisir une mission parmi celles proposées puis
                  de se créer un compte : vous pouvez alors démarrer le
                  processus de candidature.
                </Typography>
                <Typography variant="body1" paragraph>
                  Postulez sans tarder, dites-nous vos motivations,
                  disponibilités hebdomadaires et compétences pédagogiques et
                  techniques (matières et niveaux). C’est une expérience
                  enrichissante, récompensée par les progrès accomplis grâce à
                  une approche individualisée. Patience, écoute active, sens de
                  la pédagogie, bienveillance et fluidité numérique le cas
                  échéant sont requis.
                </Typography>
                <Typography variant="body1">
                  <Link href="https://sephoraberrebi.org" target="_blank">
                    En savoir plus sur l'association Séphora Berrebi
                  </Link>
                </Typography>
                <Button
                  type="submit"
                  href="/missions"
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: 2 }}>
                  Postuler maintenant
                </Button>
              </CardContent>
            </Card>
          </BorderedBoxWithLabel>
        </Grid>
      </Grid>
    </Container>
  );
};

export default focusTutorat;
