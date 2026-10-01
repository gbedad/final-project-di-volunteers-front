import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Stored path is either a public URL or a private key like documents/12/cv.pdf
export const isInFolder = (path, folder) =>
  path.startsWith(`${folder}/`) || path.includes(`/${folder}/`);

// URL the browser can open; private files get a temporary signed link
export const getFileUrl = async (path) => {
  if (/^https?:\/\//.test(path)) return path;
  const { data } = await axios.post(`${BASE_URL}/files/url`, { path });
  return data.url;
};

export const fileNameOf = (path) =>
  decodeURIComponent(path.split('/').pop()).replace(/^\d{13}-/, '');
