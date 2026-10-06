// Dashboard search on what volunteers can teach and when they are free.
// A topic is { subject, classStart, classEnd }, a slot { day, startTime,
// endTime } (both stored as JSON strings in the skills).
import { existingLevels } from '../options/existingOptions';

// Value of the status filter for "Tuteurs actifs" (dashboard chips)
export const ACTIVE_TUTORS = 'tuteurs-actifs';

export const LEVELS = JSON.parse(existingLevels).map((l) => l.label);

// Search times: every half hour from 07:00 to 22:00
export const SEARCH_TIMES = Array.from({ length: 31 }, (_, i) => {
  const minutes = 7 * 60 + i * 30;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
});

const parse = (value) => {
  if (value && typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// Spellings found in the data: "Maths", "3e", "6e"…
const SUBJECT_ALIASES = { maths: 'mathématiques', math: 'mathématiques' };
const normalizeSubject = (subject) => {
  const s = String(subject || '')
    .trim()
    .toLowerCase();
  return SUBJECT_ALIASES[s] || s;
};
const levelIndex = (label) => {
  const l = String(label || '')
    .trim()
    .replace(/^(\d)e$/i, '$1ème');
  return LEVELS.findIndex((x) => x.toLowerCase() === l.toLowerCase());
};

// "Physique" matches "Physique-Chimie" and the other way round
const subjectMatches = (wanted, taught) => {
  const a = normalizeSubject(wanted);
  const b = normalizeSubject(taught);
  if (a === b) return true;
  const partsA = a.split('-');
  const partsB = b.split('-');
  return partsA.some((p) => partsB.includes(p));
};

// The topic covers the whole requested level range
const levelsMatch = (topic, from, to) => {
  if (from === -1 && to === -1) return true;
  let start = levelIndex(topic.classStart);
  let end = levelIndex(topic.classEnd);
  if (start === -1) start = end;
  if (end === -1) end = start;
  if (start === -1) return false;
  const lo = from === -1 ? to : from;
  const hi = to === -1 ? from : to;
  return start <= lo && end >= hi;
};

// The slot covers the requested times ("HH:MM" strings compare in order)
const timesMatch = (slot, from, to) => {
  const start = slot.startTime;
  const end = slot.endTime;
  if (!start || !end) return !from && !to;
  if (from && to) return start <= from && end >= to;
  if (from) return start <= from && end > from;
  if (to) return start < to && end >= to;
  return true;
};

// criteria: { subject, levelFrom, levelTo, days: [], timeFrom, timeTo }
// Subject and levels must be in the same topic, days and times in the same
// slot: "Maths in 4ème on Tuesday 18:00-20:00" finds tutors who do exactly that
export const matchesSearch = (skill, criteria) => {
  const { subject, levelFrom, levelTo, days = [], timeFrom, timeTo } = criteria;
  const from = levelIndex(levelFrom);
  const to = levelIndex(levelTo);

  if (subject || levelFrom || levelTo) {
    const topics = (skill?.topics || []).map(parse).filter(Boolean);
    const ok = topics.some(
      (t) =>
        (!subject || subjectMatches(subject, t.subject)) &&
        levelsMatch(t, from, to)
    );
    if (!ok) return false;
  }

  if (days.length || timeFrom || timeTo) {
    const slots = (skill?.when_day_slot || []).map(parse).filter(Boolean);
    const ok = slots.some(
      (s) =>
        (!days.length || days.includes(s.day)) &&
        timesMatch(s, timeFrom, timeTo)
    );
    if (!ok) return false;
  }
  return true;
};
