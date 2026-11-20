// What a volunteer does for the association (same list as the server,
// services/engagements.js): tutoring, and/or going with the children on
// the outings. The volunteer ticks his wishes; the team decides.
export const ENGAGEMENTS = [
  {
    value: 'tutorat',
    label: 'Tutorat (soutien scolaire)',
    short: 'Tutorat',
    hint: 'Suivre un élève chaque semaine',
  },
  {
    value: 'culture',
    label: 'Activités culturelles',
    short: 'Culture',
    hint: 'Accompagner les sorties : musées, théâtre, concerts…',
  },
  {
    value: 'sciences',
    label: 'Activités scientifiques',
    short: 'Sciences',
    hint: 'Accompagner les ateliers et visites scientifiques',
  },
  {
    // Étiquette posée par l'équipe (accord du bénévole) : pas un vœu à cocher
    value: 'masterclasses',
    label: 'Master Classe',
    short: 'Master Classe',
    hint: 'Proposé aux Master Classes de l\'association (Institut Henri Poincaré)',
    teamOnly: true,
  },
];
export const engagementLabel = (v) =>
  ENGAGEMENTS.find((e) => e.value === v)?.short || v;

export const OUTING_PERIODS = [
  { value: 'semaine', label: 'En semaine' },
  { value: 'weekend', label: 'Le week-end' },
  { value: 'vacances', label: 'Pendant les vacances scolaires' },
];

// What counts: the team's choice, else the wishes (tutoring before the
// activities existed)
export const engagementsOf = (u) =>
  (u?.engagements?.length && u.engagements) ||
  (u?.engagements_wished?.length && u.engagements_wished) || ['tutorat'];
export const isTutorUser = (u) => engagementsOf(u).includes('tutorat');
