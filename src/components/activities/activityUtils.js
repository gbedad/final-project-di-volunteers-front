// Shared values of the cultural activities pages
export const BASE_URL = process.env.REACT_APP_BASE_URL;

export const ACTIVITY_STATUSES = {
  brouillon: { label: 'Brouillon', color: 'default' },
  ouverte: { label: 'Inscriptions ouvertes', color: 'success' },
  complète: { label: 'Complète', color: 'warning' },
  passée: { label: 'Passée', color: 'default' },
  annulée: { label: 'Annulée', color: 'error' },
};
// Statuses the team sets (complète and passée are also computed)
export const EDITABLE_STATUSES = [
  'brouillon',
  'ouverte',
  'complète',
  'annulée',
];
export const KINDS = [
  'Musée',
  'Exposition',
  'Spectacle',
  'Concert',
  'Cinéma',
  'Visite',
  'Promenade',
  'Atelier',
  'Autre',
];
export const PAYMENT_METHODS = [
  { value: 'espèces', label: 'Espèces' },
  { value: 'chèque', label: 'Chèque' },
  { value: 'virement', label: 'Virement' },
  { value: 'carte', label: 'Carte' },
  { value: 'autre', label: 'Autre' },
];

export const today = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
export const frDate = (d, opts = {}) =>
  d
    ? new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        ...opts,
      })
    : 'Date à fixer';
export const euros = (n) =>
  n === null || n === undefined
    ? '—'
    : `${Number(n).toLocaleString('fr-FR', {
        minimumFractionDigits: Number(n) % 1 ? 2 : 0,
        maximumFractionDigits: 2,
      })} €`;
export const hours = (a) =>
  a.start_time ? `${a.start_time}${a.end_time ? `–${a.end_time}` : ''}` : '';

// A photo chosen by the team, made light enough for a card (JPEG, 900 px)
export const resizeImage = (file, max = 900) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas
          .getContext('2d')
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

// Text for the families' WhatsApp groups
export const familyMessage = (a) =>
  [
    `Sortie culturelle : ${a.title}`,
    `${frDate(a.date)}${hours(a) ? `, ${hours(a)}` : ''}`,
    a.meeting_point || a.place
      ? `Rendez-vous : ${a.meeting_point || a.place}${a.meeting_time ? ` à ${a.meeting_time}` : ''}`
      : null,
    a.meeting_point2
      ? `Ou : ${a.meeting_point2}${a.meeting_time2 ? ` à ${a.meeting_time2}` : ''}`
      : null,
    a.bring ? `À apporter : ${a.bring}` : null,
    a.place && a.meeting_point ? `Lieu : ${a.place}` : null,
    Number(a.fee) > 0
      ? `Participation aux frais : ${euros(a.fee)}`
      : 'Sortie gratuite pour les familles',
    'Merci de rendre l’autorisation de sortie signée avant le départ.',
  ]
    .filter(Boolean)
    .join('\n');

export const ATTENDANCES = [
  { value: 'présent', label: 'Présent', color: 'success' },
  { value: 'absent', label: 'Absent', color: 'error' },
  { value: 'excusé', label: 'Excusé', color: 'default' },
];
export const attendanceLabel = (v) =>
  ATTENDANCES.find((a) => a.value === v)?.label || '—';
export const WAYS = [
  { value: 'accompagné', label: 'Accompagné(e)' },
  { value: 'seul', label: 'Seul(e)' },
];
export const CONSENT_STATES = {
  'à demander': { label: 'Autorisation à demander', color: 'warning' },
  demandée: { label: 'Autorisation demandée', color: 'info' },
  signée: { label: 'Autorisation signée en ligne', color: 'success' },
  reçue: { label: 'Autorisation reçue (papier)', color: 'success' },
};
// "2 h 30" from minutes
export const durationText = (m) =>
  m
    ? `${Math.floor(m / 60)} h${m % 60 ? ` ${String(m % 60).padStart(2, '0')}` : ''}`
    : '—';
