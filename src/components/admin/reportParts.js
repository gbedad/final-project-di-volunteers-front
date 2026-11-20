// Pieces of the annual report, shared with the "Sorties" view of the
// analysis: figures, bars, sections, and the outings block
import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

export const fr = (n) =>
  n === null || n === undefined
    ? '—'
    : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
// "1er septembre 2026" (French ordinal on the first of the month)
export const frDate = (s) =>
  new Date(`${s}T12:00:00Z`)
    .toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^1 /, '1er ');
export const monthLabel = (m) =>
  new Date(`${m}-15T12:00:00Z`).toLocaleDateString('fr-FR', {
    month: 'long',
  });
// School years offered: the current one and the three before
export const years = () => {
  const now = new Date();
  const y = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return [0, 1, 2, 3].map((i) => `${y - i}-${y - i + 1}`);
};

export const Figure = ({ value, label, detail }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      variant="h4"
      color="primary"
      sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
      {value}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {label}
    </Typography>
    {detail && (
      <Typography variant="caption" color="text.secondary">
        {detail}
      </Typography>
    )}
  </Box>
);

// One row of a breakdown: label, value, bar to scale
export const Bars = ({ rows, valueKey = 'count', unit = '', total }) => {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  return (
    <Stack spacing={0.75}>
      {rows.map((r) => (
        <Box
          key={r.label}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 11rem) 1fr auto',
            gap: 1.5,
            alignItems: 'center',
          }}>
          <Typography variant="body2" noWrap title={r.label}>
            {r.label}
          </Typography>
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, height: 10 }}>
            <Box
              sx={{
                width: `${(r[valueKey] / max) * 100}%`,
                bgcolor: 'primary.main',
                height: '100%',
                borderRadius: 1,
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontVariantNumeric: 'tabular-nums',
              minWidth: 72,
              textAlign: 'right',
            }}>
            {fr(r[valueKey])}
            {unit}
            {total ? ` (${Math.round((r[valueKey] * 100) / total)} %)` : ''}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export const Section = ({ title, children, note }) => (
  <Paper
    variant="outlined"
    className="report-block"
    sx={{ p: 2.5, minWidth: 0 }}>
    <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
      {title}
    </Typography>
    {children}
    {note && (
      <Typography
        variant="caption"
        color="text.secondary"
        component="p"
        sx={{ mt: 1.5 }}>
        {note}
      </Typography>
    )}
  </Paper>
);

const plural = (n, one, many) => `${fr(n)} ${n > 1 ? many : one}`;

// Short summary of the cultural outings of the year (report, copied text)
export const outingSummary = (o) => {
  const f = o?.figures;
  if (!f || !f.outings) {
    const base = f?.coming
      ? `Activités culturelles : pas encore de sortie réalisée, ${plural(f.coming, 'sortie prévue', 'sorties prévues')}.`
      : 'Activités culturelles : aucune sortie sur la période.';
    return [base, sessionSummary(o?.sessions)].filter(Boolean).join(' ');
  }
  return [
    `Activités culturelles : ${plural(f.outings, 'sortie réalisée', 'sorties réalisées')}${f.coming ? ` (et ${fr(f.coming)} à venir)` : ''}, ${plural(f.registrations, 'participation', 'participations')} de ${plural(f.children, 'enfant', 'enfants différents')}${f.tutored ? `, dont ${fr(f.tutored)} suivis en tutorat` : ''}.`,
    f.attendance_rate !== null
      ? `Taux de présence : ${f.attendance_rate} % sur les sorties où la présence a été relevée.`
      : null,
    f.adults
      ? `${plural(f.adults, 'adulte accompagnateur', 'adultes accompagnateurs')}${f.volunteers ? `, dont ${plural(f.volunteers, 'bénévole', 'bénévoles')} de l'association` : ''}.`
      : null,
    f.child_hours
      ? `Environ ${fr(f.child_hours)} heures de sortie cumulées par les enfants.`
      : null,
    sessionSummary(o.sessions),
  ]
    .filter(Boolean)
    .join(' ');
};

// Preparation and return sessions, in the summary (after the outings)
const sessionSummary = (s) => {
  if (!s) return null;
  const { prep, debrief, bilans } = s;
  const parts = [
    prep.sessions
      ? `${plural(prep.sessions, 'séance préparatoire réalisée', 'séances préparatoires réalisées')} (${plural(prep.children, 'enfant', 'enfants différents')})`
      : null,
    debrief.sessions
      ? `${plural(debrief.sessions, 'séance de retour réalisée', 'séances de retour réalisées')} (${plural(debrief.children, 'enfant', 'enfants différents')})`
      : null,
    bilans.outings
      ? `un bilan rédigé pour ${fr(bilans.written)} sortie${bilans.written > 1 ? 's' : ''} sur ${fr(bilans.outings)}`
      : null,
  ].filter(Boolean);
  return parts.length ? `Séances préparatoires et bilans : ${parts.join(', ')}.` : null;
};

const euros = (n) =>
  `${Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`;

// Key figures of the outings (analysis and report)
export const OutingFigures = ({ o }) => {
  const f = o.figures;
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
      }}>
      <Figure
        value={f.outings}
        label="sorties réalisées"
        detail={[
          f.coming ? `${f.coming} à venir` : null,
          f.cancelled
            ? `${f.cancelled} annulée${f.cancelled > 1 ? 's' : ''}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      />
      <Figure
        value={f.children}
        label="enfants différents"
        detail={`${f.registrations} participation${f.registrations > 1 ? 's' : ''}`}
      />
      <Figure
        value={f.tutored}
        label="suivis aussi en tutorat"
        detail={
          f.children
            ? `${Math.round((f.tutored * 100) / f.children)} % des enfants`
            : null
        }
      />
      <Figure
        value={f.attendance_rate === null ? '—' : `${f.attendance_rate} %`}
        label="taux de présence"
        detail={
          f.marked
            ? `${f.present} présent${f.present > 1 ? 's' : ''} sur ${f.marked} relevé${f.marked > 1 ? 's' : ''}`
            : 'présence pas encore relevée'
        }
      />
      <Figure
        value={f.adults}
        label="adultes accompagnateurs"
        detail={`dont ${f.volunteers} bénévole${f.volunteers > 1 ? 's' : ''} de l'association`}
      />
      <Figure
        value={fr(f.child_hours)}
        label="heures de sortie (enfants)"
        detail="durée de la sortie × enfants participants"
      />
      <Figure
        value={euros(f.spent)}
        label="dépenses"
        detail={`${euros(f.collected)} de participations reçues`}
      />
      <Figure
        value={f.cost_per_child === null ? '—' : euros(f.cost_per_child)}
        label="coût net par participation"
        detail="dépenses moins participations"
      />
    </Box>
  );
};

// Preparation and return sessions, and bilans: apart from the outings' figures
export const OutingSessionFigures = ({ o }) => {
  const s = o.sessions;
  if (!s) return null;
  const { prep, debrief, bilans } = s;
  const detail = (k) => {
    if (!k.sessions && !k.coming) return 'aucune séance pour l’instant';
    return [
      k.children ? plural(k.children, 'enfant', 'enfants différents') : 'aucun enfant saisi',
      k.attendance_rate === null ? null : `présence ${k.attendance_rate} %`,
      k.coming ? `${k.coming} à venir` : null,
    ]
      .filter(Boolean)
      .join(' · ');
  };
  return (
    <Box
      sx={{
        mt: 3,
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
      }}>
      <Figure
        value={prep.sessions}
        label="séances préparatoires"
        detail={detail(prep)}
      />
      <Figure
        value={debrief.sessions}
        label="séances de retour"
        detail={detail(debrief)}
      />
      <Figure
        value={`${bilans.written} / ${bilans.outings}`}
        label="bilans rédigés"
        detail="sorties réalisées avec un bilan"
      />
    </Box>
  );
};

// Master Classes of the year (figures read from the MCL application)
export const masterclassSummary = (m) => {
  const t = m?.totaux;
  if (!t || !t.editions) {
    return 'Master Classes : aucune édition sur la période.';
  }
  return [
    `Master Classes : ${plural(t.editions, 'édition', 'éditions')}, ${plural(t.eleves_total, 'élève inscrite', 'élèves inscrites')} (sur ${plural(t.candidatures_total, 'candidature reçue', 'candidatures reçues')} ; ${fr(t.eleves_via_etablissements)} via leur établissement, ${plural(t.eleves_candidatures_individuelles, 'candidature individuelle', 'candidatures individuelles')}), ${plural(t.etablissements, 'établissement', 'établissements')}, ${plural(t.ateliers, 'atelier', 'ateliers')}.`,
    t.satisfaction.note_moyenne !== null
      ? `Satisfaction : ${fr(t.satisfaction.note_moyenne)} / 5 en moyenne (${plural(t.satisfaction.reponses, 'réponse', 'réponses')}).`
      : null,
  ]
    .filter(Boolean)
    .join(' ');
};

// Key figures of the Master Classes (analysis and report)
export const MasterclassFigures = ({ m }) => {
  const t = m.totaux;
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
      }}>
      <Figure
        value={fr(t.eleves_total)}
        label="élèves inscrites"
        detail={`${fr(t.eleves_via_etablissements)} via leur établissement · ${plural(t.eleves_candidatures_individuelles, 'candidature individuelle', 'candidatures individuelles')}`}
      />
      <Figure
        value={fr(t.candidatures_total)}
        label="candidatures reçues"
        detail="refusées comprises"
      />
      <Figure value={fr(t.etablissements)} label="établissements" />
      <Figure
        value={t.satisfaction.note_moyenne === null ? '—' : `${fr(t.satisfaction.note_moyenne)} / 5`}
        label="satisfaction moyenne"
        detail={`${plural(t.satisfaction.reponses, 'réponse', 'réponses')}`}
      />
      <Figure value={fr(t.ateliers)} label="ateliers" />
    </Box>
  );
};

// Why a Master Classes block has no figures
export const masterclassUnavailable = (m) =>
  m?.status === 'not_configured'
    ? "Les chiffres des Master Classes ne sont pas connectés (MCL_URL et MCL_STATS_API_KEY)."
    : "Les chiffres des Master Classes sont momentanément indisponibles (le serveur de l'application peut être en veille).";
