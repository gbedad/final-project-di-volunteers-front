import axios from 'axios';
import { notifyThreadChanged } from './whatsapp';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Contact address of a volunteer (the second address replaces the first)
export const volunteerEmail = (volunteer) =>
  volunteer?.email2 || volunteer?.email || null;

const signedIn = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.user || {};
  } catch {
    return {};
  }
};

// New Gmail message, prefilled; it is sent from the Gmail account signed in
// in this browser
export const gmailComposeUrl = (volunteer) => {
  const me = signedIn();
  const signature = [me.first_name, me.last_name].filter(Boolean).join(' ');
  const params = {
    view: 'cm',
    fs: '1',
    to: volunteerEmail(volunteer),
    su: 'Votre candidature de tuteur bénévole – Association Séphora Berrebi',
    body: `Bonjour ${volunteer.first_name},\n\n\n\n${signature}\nAssociation Séphora Berrebi`,
  };
  // %20 for spaces (not "+"), which Gmail always reads correctly
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `https://mail.google.com/mail/?${query}`;
};

// Opens Gmail and records the contact in the volunteer's internal discussion
export const contactByEmail = async (volunteer) => {
  if (!volunteerEmail(volunteer)) return;
  window.open(gmailComposeUrl(volunteer), '_blank', 'noopener');
  try {
    await axios.post(`${BASE_URL}/admin/users/${volunteer.id}/thread`, {
      kind: 'email',
    });
    notifyThreadChanged();
  } catch (err) {
    console.error(err);
  }
};
