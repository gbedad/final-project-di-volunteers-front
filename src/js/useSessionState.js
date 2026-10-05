import { useEffect, useState } from 'react';

const read = (key, initial) => {
  try {
    const saved = sessionStorage.getItem(key);
    return saved === null ? initial : JSON.parse(saved);
  } catch {
    return initial;
  }
};

// useState kept in sessionStorage: survives going to another page and
// coming back (same browser tab), forgotten when the tab is closed
export const useSessionState = (key, initial) => {
  const [value, setValue] = useState(() => read(key, initial));
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
};

export default useSessionState;
