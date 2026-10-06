import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const EVENT = 'application-changed';

// Call after any save that can change the application (skills, profile,
// documents): every progress indicator on the page refreshes itself
export const notifyApplicationChanged = () =>
  window.dispatchEvent(new Event(EVENT));

// Progress of the volunteer's application ({ profile, wishes, documents,
// details, canSubmit, status… }), kept up to date after each save
export const useApplicationProgress = (userId) => {
  const [progress, setProgress] = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`${BASE_URL}/application/${userId}`);
      setProgress(data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    return () => window.removeEventListener(EVENT, refresh);
  }, [refresh]);

  return [progress, refresh];
};

// Human-readable list of what is still missing for each tab
export const missingItems = (progress) => {
  if (!progress) return { profile: [], wishes: [], documents: [] };
  const { details, documents } = progress;
  return {
    profile: [
      !details.address && 'votre adresse',
      !details.activity && 'votre activité',
    ].filter(Boolean),
    wishes: [
      !details.topics && 'les matières et niveaux',
      !details.slots && 'vos jours et heures',
      !details.places && 'un site (ou une modalité à distance)',
    ].filter(Boolean),
    documents: [
      !documents.cv && 'votre CV',
      !documents.id && "votre pièce d'identité",
    ].filter(Boolean),
  };
};

export const joinFrench = (items) =>
  items.length <= 1
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
