// Values of the students module (same lists as the tutors where possible,
// so that students and tutors can be matched)
import {
  existingSubjects,
  existingModalities,
  existingLocations,
} from '../options/existingOptions';
import { LEVELS } from './volunteerSearch';

export const STUDENT_STATUSES = [
  { value: 'Nouvelle demande', color: 'info' },
  { value: 'En attente de tuteur', color: 'warning' },
  { value: 'Binôme en cours', color: 'success' },
  { value: 'En pause', color: 'default' },
  { value: 'Terminé', color: 'default' },
  { value: 'Abandon', color: 'default' },
];
export const statusColor = (status) =>
  STUDENT_STATUSES.find((s) => s.value === status)?.color || 'default';

// Database enum TOP, P1…P3
export const PRIORITIES = [
  { value: 'TOP', label: 'Urgente', color: 'error' },
  { value: 'P1', label: 'Haute', color: 'warning' },
  { value: 'P2', label: 'Normale', color: 'default' },
  { value: 'P3', label: 'Basse', color: 'default' },
];
export const priorityLabel = (value) =>
  PRIORITIES.find((p) => p.value === value)?.label || '';

export const SUBJECTS = existingSubjects.map((s) => s.label);
export const STUDENT_LEVELS = LEVELS.filter((l) => !/^L\d$/.test(l));
export const TRACKS = ['Générale', 'Technologique', 'Professionnelle'];
export const TOPIC_PRIORITIES = [
  { value: 'haute', label: 'Prioritaire' },
  { value: 'moyenne', label: 'Importante' },
  { value: 'basse', label: 'Secondaire' },
];
export const GOALS = [
  'Remise à niveau',
  'Méthodologie',
  'Aide aux devoirs',
  'Préparation du brevet',
  'Préparation du bac',
  'Confiance en soi',
];
export const REFERRAL_SOURCES = [
  'Établissement scolaire',
  'Assistante sociale',
  'Famille',
  'Association partenaire',
  'Autre',
];
export const MODALITIES = existingModalities;
// Real sites only (the shared list also holds separators and modalities)
export const SITES = existingLocations.filter(
  (l) => !/^-+$/.test(l) && !/distance|distanciel/i.test(l)
);
export const DAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];
