import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import logoUrl from '../../assets/LogoASB.png';
import {
  BASE_URL,
  euros,
  frDate,
  hours,
  NO_FEE,
  pointText,
} from './activityUtils';
import { showPhone } from '../../js/phone';

// Portrait image (1080 × 1350), fit for WhatsApp, Instagram and an A4
// print; square (1080 × 1080) for the social networks
const W = 1080;
const PORTRAIT = 1350;
const SQUARE = 1080;

// What can be shown on a flyer, in the order of the checkboxes
export const FLYER_FIELDS = [
  { key: 'photo', label: 'Photo' },
  { key: 'quand', label: 'Date et heures' },
  { key: 'ou', label: 'Lieu' },
  { key: 'aller', label: 'Rendez-vous aller' },
  { key: 'retour', label: 'Rendez-vous retour' },
  { key: 'pour', label: 'Niveaux' },
  { key: 'inscription', label: 'Date limite' },
  { key: 'description', label: 'Description' },
  { key: 'presentation', label: 'Présentation ambassadeurs' },
  { key: 'participation', label: 'Participation' },
  { key: 'places', label: 'Places' },
  { key: 'organisateur', label: 'Responsable' },
  { key: 'cta', label: "Comment s'inscrire" },
];
// Flyers by destination; "familles" is the flyer as it was (same fields)
const CURRENT = [
  'photo',
  'quand',
  'ou',
  'aller',
  'pour',
  'inscription',
  'description',
  'participation',
  'places',
  'cta',
];
export const FLYER_TYPES = [
  {
    key: 'familles',
    label: 'Familles',
    height: PORTRAIT,
    fields: CURRENT,
    cta: 'Inscriptions auprès de l’association, sur le groupe WhatsApp de votre famille.',
  },
  {
    key: 'ambassadeurs',
    label: 'Ambassadeurs',
    height: PORTRAIT,
    fields: [
      ...CURRENT.filter((f) => f !== 'description'),
      'retour',
      'organisateur',
      'presentation',
    ],
    cta: 'Pour inscrire un enfant : contactez l’association Séphora Berrebi.',
  },
  {
    key: 'partenaires',
    label: 'Établissements et partenaires',
    height: PORTRAIT,
    fields: [
      'photo',
      'quand',
      'ou',
      'pour',
      'description',
      'organisateur',
      'cta',
    ],
    cta: 'Renseignements auprès de l’association Séphora Berrebi.',
  },
  {
    key: 'reseaux',
    label: 'Réseaux sociaux (carré)',
    height: SQUARE,
    fields: ['photo', 'quand', 'ou', 'pour', 'participation', 'cta'],
    cta: 'Inscriptions auprès de l’association.',
  },
];
// Ticking one unticks the other
const EXCLUSIVE = { description: 'presentation', presentation: 'description' };
// Fields and call to action of a destination: saved for the outing, else
// the destination's defaults (never both texts: the presentation wins)
const settingsOf = (a, type) => {
  const saved = a.flyer_settings?.[type.key];
  const fields = saved?.fields || type.fields;
  return {
    fields: fields.includes('presentation')
      ? fields.filter((f) => f !== 'description')
      : fields,
    cta: saved?.cta ?? type.cta,
  };
};
const TEAL = '#006064';
const TEAL_LIGHT = '#e0f2f1';
const PURPLE = '#8e24aa';
const INK = '#1d2b2b';
const FONT = 'Roboto, "Helvetica Neue", Arial, sans-serif';

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

// Lines of a text within a width (at most maxLines, the last one cut "…")
const wrap = (ctx, text, width, maxLines) => {
  const words = String(text || '')
    .split(/\s+/)
    .filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const tryLine = line ? `${line} ${w}` : w;
    if (ctx.measureText(tryLine).width <= width) line = tryLine;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > width && last.includes(' ')) {
      last = last.slice(0, last.lastIndexOf(' '));
    }
    kept[maxLines - 1] = `${last}…`;
    return kept;
  }
  return lines;
};

// "6ème à 3ème", "CM1, CM2", or nothing
const levelsText = (levels) => {
  if (!levels?.length) return '';
  if (levels.length > 3) return `${levels[0]} à ${levels[levels.length - 1]}`;
  return levels.join(', ');
};

// show: the fields ticked; H: the height (portrait or square)
export const drawFlyer = async (
  canvas,
  a,
  { show = CURRENT, cta: callToAction = '', height: H = PORTRAIT } = {}
) => {
  const on = (k) => show.includes(k);
  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  const [photo, logo] = await Promise.all([
    loadImage(on('photo') ? a.image : null),
    loadImage(logoUrl),
  ]);
  // Rows of the tinted block, as shown
  const both = (way) =>
    [1, 2, 3]
      .map((n) => pointText(a, way, n))
      .filter(Boolean)
      .join(' ou ');
  const lines = [
    on('quand')
      ? [
          'Quand',
          `${frDate(a.date).replace(/^./, (c) => c.toUpperCase())}${hours(a) ? `, ${hours(a).replace('–', ' – ')}` : ''}`,
        ]
      : null,
    on('ou') && a.place ? ['Où', a.place] : null,
    on('aller') && both('aller') ? ['Rendez-vous', both('aller')] : null,
    on('retour') && both('retour') ? ['Retour', both('retour')] : null,
    on('pour') && a.levels?.length
      ? ['Pour', `les élèves de ${levelsText(a.levels)}`]
      : null,
    on('inscription') && a.deadline
      ? [
          'Inscription',
          `avant le ${new Date(`${a.deadline}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`,
        ]
      : null,
    on('organisateur') && a.organizer
      ? [
          'Responsable',
          `${a.organizer}${a.organizer_phone ? ` · ${showPhone(a.organizer_phone)}` : ''}`,
        ]
      : null,
  ].filter(Boolean);
  // Description, and the detailed presentation for the ambassadors
  const description =
    [
      on('description') ? a.description : null,
      on('presentation') ? a.ambassador_brief : null,
    ]
      .filter(Boolean)
      .join(' ') || null;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Room for everything: the longer the description, the smaller the photo
  // band (between 260 and 520 px), the description shown whole up to 8 lines
  ctx.font = `800 76px ${FONT}`;
  const titleCount = wrap(ctx, a.title, W - 120, 2).length;
  // A long value (two meeting points) takes two lines
  ctx.font = `500 34px ${FONT}`;
  const valueLines = lines.map(([, v]) => wrap(ctx, v, W - 400, 2));
  const extra = valueLines.reduce((n, l) => n + l.length - 1, 0);
  const rows = lines.length;
  ctx.font = `400 30px ${FONT}`;
  const descAll = description ? wrap(ctx, description, W - 120, 12) : [];
  // Last line of description at most here (badges and footer below)
  const descLimit = H - 170 - 80 - 40;
  const above =
    90 +
    (titleCount - 1) * 86 +
    34 +
    44 +
    rows * 58 +
    extra * 40 +
    30 +
    (Math.max(1, descAll.length) - 1) * 42;
  const top = Math.max(
    180,
    Math.min(H === SQUARE ? 420 : 520, descLimit - above)
  );
  if (photo) {
    const ratio = Math.max(W / photo.width, top / photo.height);
    const w = photo.width * ratio;
    const h = photo.height * ratio;
    // Kept within its band
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, top);
    ctx.clip();
    ctx.drawImage(photo, (W - w) / 2, (top - h) / 2, w, h);
    ctx.restore();
  } else {
    const g = ctx.createLinearGradient(0, 0, W, top);
    g.addColorStop(0, TEAL);
    g.addColorStop(1, '#00838f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, top);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.font = `700 260px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText((a.kind || 'Sortie').toUpperCase(), W - 40, top - 60);
    ctx.textAlign = 'left';
  }
  // Ribbon "Sortie culturelle"
  ctx.fillStyle = PURPLE;
  ctx.fillRect(0, 56, 470, 76);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 38px ${FONT}`;
  ctx.fillText('SORTIE CULTURELLE', 60, 108);

  // Title
  let y = top + 90;
  ctx.fillStyle = INK;
  ctx.font = `800 76px ${FONT}`;
  const titleLines = wrap(ctx, a.title, W - 120, 2);
  titleLines.forEach((l, i) => ctx.fillText(l, 60, y + i * 86));
  y += (titleLines.length - 1) * 86 + 34;

  // When and where, in a tinted block
  const blockTop = y;
  const rowH = 58;
  if (lines.length) {
    ctx.fillStyle = TEAL_LIGHT;
    ctx.fillRect(
      40,
      blockTop - 8,
      W - 80,
      lines.length * rowH + extra * 40 + 28
    );
  }
  y = blockTop + 44;
  lines.forEach(([label], i) => {
    ctx.fillStyle = TEAL;
    ctx.font = `700 28px ${FONT}`;
    ctx.fillText(label.toUpperCase(), 70, y);
    ctx.fillStyle = INK;
    ctx.font = `500 34px ${FONT}`;
    valueLines[i].forEach((l, j) => ctx.fillText(l, 330, y + j * 40));
    y += rowH + (valueLines[i].length - 1) * 40;
  });
  y += 30;

  // Footer and badges have fixed places at the bottom
  const footer = 170;
  const badgesY = H - footer - 80;
  // A few words of description, in the room left
  if (description) {
    ctx.fillStyle = '#3d4c4c';
    ctx.font = `400 30px ${FONT}`;
    const room = Math.max(1, Math.floor((badgesY - 40 - y) / 42) + 1);
    for (const l of wrap(ctx, description, W - 120, Math.min(12, room))) {
      ctx.fillText(l, 60, y);
      y += 42;
    }
  }
  y = badgesY;

  // Price and places, as two badges
  const badges = [
    on('participation')
      ? Number(a.fee) > 0
        ? `Participation ${euros(a.fee)}`
        : NO_FEE
      : null,
    on('places') && a.places ? `${a.places} places` : null,
  ].filter(Boolean);
  let x = 60;
  ctx.font = `700 32px ${FONT}`;
  for (const b of badges) {
    const w = ctx.measureText(b).width + 48;
    if (x + w > W - 60) break;
    ctx.fillStyle =
      b === NO_FEE || b.startsWith('Participation') ? PURPLE : TEAL;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y - 10, w, 60, 30);
    else ctx.rect(x, y - 10, w, 60);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(b, x + 24, y + 31);
    x += w + 16;
  }

  // Footer: how to register, and the association
  ctx.fillStyle = TEAL;
  ctx.fillRect(0, H - footer, W, footer);
  if (logo) {
    const lh = 110;
    const lw = (logo.width / logo.height) * lh;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, H - footer + 30, lw + 20, lh);
    ctx.drawImage(logo, 50, H - footer + 30, lw, lh);
    x = 40 + lw + 50;
  } else x = 60;
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 34px ${FONT}`;
  const cta = on('cta') ? wrap(ctx, callToAction, W - x - 50, 2) : [];
  let fy = H - footer + (cta.length > 1 ? 70 : 92);
  for (const l of cta) {
    ctx.fillText(l, x, fy);
    fy += 44;
  }
  ctx.font = `400 26px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('Association Séphora Berrebi', x, H - 22);
};

const fileName = (a) =>
  `flyer-${String(a.title)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}.png`;

// The flyer of an activity, by destination: the fields to show are ticked
// (saved for the outing when the person can change it), then the image is
// downloaded, shared or printed
const FlyerDialog = ({ a, canEdit, onSaved, onClose }) => {
  const canvas = useRef(null);
  const [typeKey, setTypeKey] = useState('familles');
  const type = FLYER_TYPES.find((t) => t.key === typeKey);
  // Choices of every destination, as in the outing (or the defaults)
  const [settings, setSettings] = useState(() =>
    Object.fromEntries(FLYER_TYPES.map((t) => [t.key, settingsOf(a, t)]))
  );
  const current = settings[typeKey];
  const changed = useRef(false);
  const update = (patch) => {
    changed.current = true;
    setSettings((s) => ({ ...s, [typeKey]: { ...s[typeKey], ...patch } }));
  };
  const toggle = (key) =>
    update({
      fields: current.fields.includes(key)
        ? current.fields.filter((f) => f !== key)
        : // Description or presentation for the ambassadors: one of the two
          [...current.fields.filter((f) => f !== EXCLUSIVE[key]), key],
    });
  // Kept for the outing, a moment after the last change
  useEffect(() => {
    if (!canEdit || !changed.current) return undefined;
    const t = setTimeout(() => {
      axios
        .patch(`${BASE_URL}/admin/activites/${a.id}`, {
          flyer_settings: settings,
        })
        .then(({ data }) => onSaved?.(data))
        .catch(() =>
          toast.error('Choix du flyer non enregistrés', {
            position: 'bottom-left',
          })
        );
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const draw = useCallback(() => {
    if (canvas.current) {
      drawFlyer(canvas.current, a, {
        show: current.fields,
        cta: current.cta,
        height: type.height,
      });
    }
  }, [a, current, type.height]);
  useEffect(() => {
    const t = setTimeout(draw, 150);
    return () => clearTimeout(t);
  }, [draw]);

  const name = fileName(a).replace('.png', `-${typeKey}.png`);
  const blob = () =>
    new Promise((resolve) => canvas.current.toBlob(resolve, 'image/png'));
  const download = () => {
    const link = document.createElement('a');
    link.download = name;
    link.href = canvas.current.toDataURL('image/png');
    link.click();
  };
  const share = async () => {
    try {
      const file = new File([await blob()], name, { type: 'image/png' });
      await navigator.share({ files: [file], title: a.title });
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast.error('Partage impossible : téléchargez l’image', {
          position: 'bottom-left',
        });
      }
    }
  };
  const print = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      `<html><head><title>${a.title}</title><style>@page{size:A4;margin:10mm}body{margin:0;display:flex;justify-content:center}img{max-width:100%;max-height:100vh}</style></head><body><img src="${canvas.current.toDataURL('image/png')}" onload="window.print()"></body></html>`
    );
    w.document.close();
  };
  const canShare =
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({
      files: [new File([''], 'x.png', { type: 'image/png' })],
    });
  // A field ticked but empty in the outing: said under the checkbox
  const empty = {
    photo: !a.image,
    ou: !a.place,
    aller: !a.meeting_point,
    retour: !a.return_point,
    pour: !a.levels?.length,
    inscription: !a.deadline,
    description: !a.description,
    presentation: !a.ambassador_brief,
    places: !a.places,
    organisateur: !a.organizer,
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Flyer de l'activité</DialogTitle>
      <DialogContent>
        <Tabs
          value={typeKey}
          onChange={(e, v) => setTypeKey(v)}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          {FLYER_TYPES.map((t) => (
            <Tab key={t.key} value={t.key} label={t.label} />
          ))}
        </Tabs>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: '1fr 260px' },
            alignItems: 'start',
          }}>
          <Box
            component="canvas"
            ref={canvas}
            sx={{
              width: '100%',
              maxWidth: type.height === SQUARE ? 460 : 420,
              justifySelf: 'center',
              height: 'auto',
              aspectRatio: `${W} / ${type.height}`,
              borderRadius: 1,
              boxShadow: 1,
            }}
          />
          <Stack spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600}>
              À afficher
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: '1fr' },
                columnGap: 1,
              }}>
              {FLYER_FIELDS.map((f) => (
                <FormControlLabel
                  key={f.key}
                  sx={{ mr: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={current.fields.includes(f.key)}
                      onChange={() => toggle(f.key)}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      color={
                        empty[f.key] && current.fields.includes(f.key)
                          ? 'text.secondary'
                          : 'text.primary'
                      }>
                      {f.label}
                      {empty[f.key] && current.fields.includes(f.key)
                        ? ' (vide)'
                        : ''}
                    </Typography>
                  }
                />
              ))}
            </Box>
            {current.fields.includes('cta') && (
              <TextField
                size="small"
                label="Comment s'inscrire"
                value={current.cta}
                onChange={(e) => update({ cta: e.target.value })}
                multiline
              />
            )}
            <Typography variant="caption" color="text.secondary">
              Repris de l'onglet Infos.{' '}
              {canEdit
                ? 'Vos choix sont gardés pour cette sortie, pour chaque destination.'
                : 'Vos choix ne sont pas enregistrés (sortie en consultation).'}
            </Typography>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose}>Fermer</Button>
        <Button startIcon={<PrintIcon />} onClick={print}>
          Imprimer
        </Button>
        {canShare && (
          <Button startIcon={<ShareIcon />} onClick={share}>
            Partager
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={download}>
          Télécharger l'image
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlyerDialog;
