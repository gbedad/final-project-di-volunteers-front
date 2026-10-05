import axios from 'axios';
import { parsePhoneNumber } from 'awesome-phonenumber';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const THREAD_EVENT = 'thread-changed';

// Call after adding a message from outside the discussion (e.g. WhatsApp
// contact): the open discussion reloads itself
export const notifyThreadChanged = () =>
  window.dispatchEvent(new Event(THREAD_EVENT));
export const onThreadChanged = (handler) => {
  window.addEventListener(THREAD_EVENT, handler);
  return () => window.removeEventListener(THREAD_EVENT, handler);
};

// Digits of the international number, as expected by wa.me (e.g. 33612345678)
export const whatsappNumber = (phone) => {
  if (!phone) return null;
  const parsed = parsePhoneNumber(phone);
  const number = parsed.valid ? parsed.number.e164 : phone;
  const digits = number.replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
};

const greeting = (volunteer, me) =>
  `Bonjour ${volunteer.first_name}, je suis ${me.first_name} de l'association Séphora Berrebi, au sujet de votre candidature de tuteur bénévole sur MyCogniverse.`;

// Opens WhatsApp (app or WhatsApp Web) with a ready-to-send message and
// records the contact in the volunteer's internal discussion
export const contactOnWhatsApp = async (volunteer) => {
  const number = whatsappNumber(volunteer.phone);
  if (!number) return;
  let me = {};
  try {
    me = JSON.parse(localStorage.getItem('user'))?.user || {};
  } catch {}
  window.open(
    `https://wa.me/${number}?text=${encodeURIComponent(greeting(volunteer, me))}`,
    '_blank',
    'noopener'
  );
  try {
    await axios.post(`${BASE_URL}/admin/users/${volunteer.id}/thread`, {
      kind: 'whatsapp',
    });
    notifyThreadChanged();
  } catch (err) {
    console.error(err);
  }
};
