import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { notifyApplicationChanged } from './applicationProgress';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Saves the volunteer's skills (one block = one field) shortly after the
// last change, and right away if the block is left with unsaved changes.
// Returns [state, schedule]: state is 'idle' | 'pending' | 'saving' |
// 'saved' | 'error', schedule(value) plans the save of that field.
export const useAutoSave = (userId, field, { delay = 700 } = {}) => {
  const [state, setState] = useState('idle');
  const timer = useRef(null);
  const pending = useRef(undefined);

  const save = useCallback(
    async (value) => {
      pending.current = undefined;
      setState('saving');
      try {
        await axios.post(`${BASE_URL}/create-skill/${userId}`, {
          [field]: value,
        });
        setState('saved');
        notifyApplicationChanged();
      } catch (err) {
        console.error(err);
        setState(err.sessionExpired ? 'expired' : 'error');
      }
    },
    [userId, field]
  );

  const schedule = useCallback(
    (value) => {
      clearTimeout(timer.current);
      pending.current = value;
      setState('pending');
      timer.current = setTimeout(() => save(value), delay);
    },
    [save, delay]
  );

  // Leaving the tab must not lose the last change
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (pending.current !== undefined) {
        axios
          .post(`${BASE_URL}/create-skill/${userId}`, {
            [field]: pending.current,
          })
          .catch(console.error);
      }
    },
    [userId, field]
  );

  return [state, schedule];
};
