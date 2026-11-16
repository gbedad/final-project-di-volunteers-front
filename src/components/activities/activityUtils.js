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
// AssoConnect link: the usual means; the others are exceptional
export const PAYMENT_METHODS = [
  { value: 'assoconnect', label: 'Lien AssoConnect' },
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
// No participation for the outing: only the yearly membership, which a
// child taking part must have paid
export const NO_FEE = 'Cotisation annuelle à jour';

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

// Meeting points, there ('aller') and back ('retour'): "Nation à 09:30"
const POINT_KEYS = {
  aller: [
    ['meeting_point', 'meeting_time'],
    ['meeting_point2', 'meeting_time2'],
  ],
  retour: [
    ['return_point', 'return_time'],
    ['return_point2', 'return_time2'],
  ],
};
export const pointText = (a, way, n) => {
  const [p, t] = POINT_KEYS[way][n - 1] || [];
  return p && a[p] ? `${a[p]}${a[t] ? ` à ${a[t]}` : ''}` : null;
};
// Points of the outing, as choices (1 and 2 when given)
export const pointChoices = (a, way) =>
  [1, 2].map((n) => ({ n, text: pointText(a, way, n) })).filter((c) => c.text);
// The student's point: the one chosen, else point 1
export const studentPoint = (a, r, way) =>
  pointText(a, way, (way === 'aller' ? r.meeting_choice : r.return_choice) || 1);

// Text for the families' WhatsApp groups
export const familyMessage = (a) =>
  [
    `Sortie culturelle : ${a.title}`,
    `${frDate(a.date)}${hours(a) ? `, ${hours(a)}` : ''}`,
    pointText(a, 'aller', 1) || a.place
      ? `Rendez-vous aller : ${pointText(a, 'aller', 1) || a.place}`
      : null,
    pointText(a, 'aller', 2) ? `ou : ${pointText(a, 'aller', 2)}` : null,
    pointText(a, 'retour', 1)
      ? `Retour : ${pointText(a, 'retour', 1)}`
      : null,
    pointText(a, 'retour', 2) ? `ou : ${pointText(a, 'retour', 2)}` : null,
    a.bring ? `À apporter : ${a.bring}` : null,
    a.place && a.meeting_point ? `Lieu : ${a.place}` : null,
    Number(a.fee) > 0
      ? `Participation aux frais : ${euros(a.fee)}`
      : `Participation aux frais : ${NO_FEE.toLowerCase()}`,
    'Merci de rendre l’autorisation de sortie signée avant le départ.',
  ]
    .filter(Boolean)
    .join('\n');

// Page for the ambassadors who offer the outing: everything to present it
export const ambassadorText = (a) =>
  [
    `${a.title.toUpperCase()}`,
    `${frDate(a.date).replace(/^./, (c) => c.toUpperCase())}${hours(a) ? `, ${hours(a)}` : ''}`,
    a.place ? `Lieu : ${a.place}` : null,
    a.levels?.length ? `Pour : ${a.levels.join(', ')}` : null,
    pointText(a, 'aller', 1)
      ? `Rendez-vous aller : ${[pointText(a, 'aller', 1), pointText(a, 'aller', 2)].filter(Boolean).join(' ou ')}`
      : null,
    pointText(a, 'retour', 1)
      ? `Retour : ${[pointText(a, 'retour', 1), pointText(a, 'retour', 2)].filter(Boolean).join(' ou ')}`
      : null,
    Number(a.fee) > 0
      ? `Participation : ${euros(a.fee)} par enfant`
      : `Participation : ${NO_FEE.toLowerCase()}`,
    a.places ? `Places : ${a.places}` : null,
    a.deadline
      ? `Inscriptions jusqu'au ${new Date(`${a.deadline}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
      : null,
    a.organizer
      ? `Organisateur : ${a.organizer}${a.organizer_phone ? ` (${a.organizer_phone})` : ''}`
      : null,
    '',
    a.ambassador_brief || a.description || '',
    a.link ? `\nEn savoir plus : ${a.link}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n')
    .trim();

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
