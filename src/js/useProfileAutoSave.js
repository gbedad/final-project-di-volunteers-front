import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { notifyApplicationChanged } from './applicationProgress';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Saves the volunteer's profile shortly after the last change (several
// fields changed in a row are sent together), and right away when the page
// is left with unsaved changes. Returns [state, schedule]: schedule({ field:
// value }) plans the save; state is 'idle' | 'pending' | 'saving' | 'saved'
// | 'error' (for SaveStatus).
export const useProfileAutoSave = (userId, { delay = 800 } = {}) => {
  const [state, setState] = useState('idle');
  const timer = useRef(null);
  const pending = useRef({});

  const flush = useCallback(async () => {
    const fields = pending.current;
    pending.current = {};
    if (!userId || !Object.keys(fields).length) return;
    setState('saving');
    try {
      await axios.patch(`${BASE_URL}/update-user-profile/${userId}`, fields);
      setState(Object.keys(pending.current).length ? 'pending' : 'saved');
      notifyApplicationChanged();
    } catch (err) {
      console.error(err);
      setState(err.sessionExpired ? 'expired' : 'error');
    }
  }, [userId]);

  const schedule = useCallback(
    (fields) => {
      pending.current = { ...pending.current, ...fields };
      setState('pending');
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [flush, delay]
  );

  // Leaving the page must not lose the last change
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (userId && Object.keys(pending.current).length) {
        axios
          .patch(`${BASE_URL}/update-user-profile/${userId}`, pending.current)
          .then(notifyApplicationChanged)
          .catch(console.error);
      }
    },
    [userId]
  );

  return [state, schedule];
};

export default useProfileAutoSave;
