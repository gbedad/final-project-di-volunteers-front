import { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Video tutorials (catalogue on the server: services/tutorials.js). The list
// is loaded once and shared by the screens that offer a tutorial.
let cache = null;
let pending = null;
export const loadTutorials = (force = false) => {
  if (cache && !force) return Promise.resolve(cache);
  if (!pending || force) {
    pending = axios
      .get(`${BASE_URL}/tutorials`)
      .then(({ data }) => {
        cache = data;
        return data;
      })
      .catch(() => [])
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

// null while loading, then the tutorials (with has_video)
export const useTutorials = () => {
  const [list, setList] = useState(cache);
  useEffect(() => {
    let alive = true;
    loadTutorials().then((l) => alive && setList(l));
    return () => {
      alive = false;
    };
  }, []);
  return list;
};

export const tutorialPath = (slug) => `/tutoriel/${slug}`;
// Link to send to the tutors (works without signing in)
export const tutorialLink = (slug) =>
  `${window.location.origin}${tutorialPath(slug)}`;
