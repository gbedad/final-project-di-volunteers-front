// Search without accents or case: "zoe" finds "Zoé"
export const norm = (v) =>
  String(v || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// Every word typed is found in one of the values; a number of 4 digits or
// more is also looked for in the phone numbers written another way
// ("06 12…", "+33 6 12…")
export const matchesWords = (values, q) => {
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = norm(values.filter(Boolean).join(' '));
  const digits = text.replace(/[^\d]/g, '');
  const local = digits.replace(/33(\d{9})/g, '0$1');
  return words.every(
    (w) =>
      text.includes(w) ||
      (/^\d{4,}$/.test(w) && (digits.includes(w) || local.includes(w)))
  );
};
