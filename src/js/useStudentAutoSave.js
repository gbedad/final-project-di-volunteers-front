import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Saves a student's page shortly after the last change (fields changed in
// a row are sent together), and right away when the page is left.
// Returns [state, schedule]; state is for SaveStatus.
export const useStudentAutoSave = (studentId, { delay = 700 } = {}) => {
  const [state, setState] = useState('idle');
  const timer = useRef(null);
  const pending = useRef({});

  const flush = useCallback(async () => {
    const fields = pending.current;
    pending.current = {};
    if (!studentId || !Object.keys(fields).length) return;
    setState('saving');
    try {
      await axios.patch(`${BASE_URL}/admin/students/${studentId}`, fields);
      setState(Object.keys(pending.current).length ? 'pending' : 'saved');
    } catch (err) {
      console.error(err);
      setState(err.sessionExpired ? 'expired' : 'error');
    }
  }, [studentId]);

  const schedule = useCallback(
    (fields) => {
      pending.current = { ...pending.current, ...fields };
      setState('pending');
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [flush, delay]
  );

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (studentId && Object.keys(pending.current).length) {
        axios
          .patch(`${BASE_URL}/admin/students/${studentId}`, pending.current)
          .catch(console.error);
      }
    },
    [studentId]
  );

  return [state, schedule];
};

export default useStudentAutoSave;
