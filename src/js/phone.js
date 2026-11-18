import { parsePhoneNumber } from 'awesome-phonenumber';

// A phone number as on the volunteers page: "+33 6 88 92 50 89". Numbers
// typed the French way ("06 88 92 50 89", "0688925089") are understood;
// what is not a valid number is shown as it was typed.
export const showPhone = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const parsed = parsePhoneNumber(raw, { regionCode: 'FR' });
  return parsed.valid ? parsed.number.international : raw;
};
