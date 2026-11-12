import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import logoUrl from '../../assets/LogoASB.png';
import { euros, frDate, hours } from './activityUtils';

// Portrait image, fit for WhatsApp, Instagram and an A4 print
const W = 1080;
const H = 1350;
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

export const drawFlyer = async (canvas, a, callToAction) => {
  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  const [photo, logo] = await Promise.all([
    loadImage(a.image),
    loadImage(logoUrl),
  ]);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Room for everything: the longer the description, the smaller the photo
  // band (between 260 and 520 px), the description shown whole up to 8 lines
  ctx.font = `800 76px ${FONT}`;
  const titleCount = wrap(ctx, a.title, W - 120, 2).length;
  const rows =
    1 +
    [a.place, a.meeting_point, a.levels?.length, a.deadline].filter(Boolean)
      .length;
  ctx.font = `400 30px ${FONT}`;
  const descAll = a.description ? wrap(ctx, a.description, W - 120, 8) : [];
  // Last line of description at most here (badges and footer below)
  const descLimit = H - 170 - 80 - 40;
  const above =
    90 +
    (titleCount - 1) * 86 +
    34 +
    44 +
    rows * 58 +
    30 +
    (Math.max(1, descAll.length) - 1) * 42;
  const top = Math.max(260, Math.min(520, descLimit - above));
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
  const lines = [
    [
      'Quand',
      `${frDate(a.date).replace(/^./, (c) => c.toUpperCase())}${hours(a) ? `, ${hours(a).replace('–', ' – ')}` : ''}`,
    ],
    a.place ? ['Où', a.place] : null,
    a.meeting_point ? ['Rendez-vous', a.meeting_point] : null,
    a.levels?.length ? ['Pour', `les élèves de ${levelsText(a.levels)}`] : null,
    a.deadline
      ? [
          'Inscription',
          `avant le ${new Date(`${a.deadline}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`,
        ]
      : null,
  ].filter(Boolean);
  const blockTop = y;
  const rowH = 58;
  ctx.fillStyle = TEAL_LIGHT;
  ctx.fillRect(40, blockTop - 8, W - 80, lines.length * rowH + 28);
  y = blockTop + 44;
  for (const [label, value] of lines) {
    ctx.fillStyle = TEAL;
    ctx.font = `700 28px ${FONT}`;
    ctx.fillText(label.toUpperCase(), 70, y);
    ctx.fillStyle = INK;
    ctx.font = `500 34px ${FONT}`;
    ctx.fillText(wrap(ctx, value, W - 400, 1)[0] || '', 330, y);
    y += rowH;
  }
  y += 30;

  // Footer and badges have fixed places at the bottom
  const footer = 170;
  const badgesY = H - footer - 80;
  // A few words of description, in the room left
  if (a.description) {
    ctx.fillStyle = '#3d4c4c';
    ctx.font = `400 30px ${FONT}`;
    const room = Math.max(1, Math.floor((badgesY - 40 - y) / 42) + 1);
    for (const l of wrap(ctx, a.description, W - 120, Math.min(8, room))) {
      ctx.fillText(l, 60, y);
      y += 42;
    }
  }
  y = badgesY;

  // Price and places, as two badges
  const badges = [
    Number(a.fee) > 0 ? `Participation ${euros(a.fee)}` : 'Gratuit',
    a.places ? `${a.places} places` : null,
  ].filter(Boolean);
  let x = 60;
  ctx.font = `700 32px ${FONT}`;
  for (const b of badges) {
    const w = ctx.measureText(b).width + 48;
    if (x + w > W - 60) break;
    ctx.fillStyle =
      b === 'Gratuit' || b.startsWith('Participation') ? PURPLE : TEAL;
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
  const cta = wrap(ctx, callToAction, W - x - 50, 2);
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

// The flyer of an activity: shown, downloaded, shared or printed
const FlyerDialog = ({ a, onClose }) => {
  const canvas = useRef(null);
  const [cta, setCta] = useState(
    'Inscriptions auprès de l’association, sur le groupe WhatsApp de votre famille.'
  );
  const draw = useCallback(() => {
    if (canvas.current) drawFlyer(canvas.current, a, cta);
  }, [a, cta]);
  useEffect(() => {
    const t = setTimeout(draw, 150);
    return () => clearTimeout(t);
  }, [draw]);

  const blob = () =>
    new Promise((resolve) => canvas.current.toBlob(resolve, 'image/png'));
  const download = () => {
    const link = document.createElement('a');
    link.download = fileName(a);
    link.href = canvas.current.toDataURL('image/png');
    link.click();
  };
  const share = async () => {
    try {
      const file = new File([await blob()], fileName(a), { type: 'image/png' });
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

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Flyer de l'activité</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box
            component="canvas"
            ref={canvas}
            sx={{
              width: '100%',
              height: 'auto',
              aspectRatio: `${W} / ${H}`,
              borderRadius: 1,
              boxShadow: 1,
            }}
          />
          <TextField
            size="small"
            label="Comment s'inscrire"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            multiline
            helperText="Titre, date et heures, lieu, point de rendez-vous, niveaux, date limite, description, participation, places et image : repris de l'onglet Infos."
          />
        </Stack>
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
