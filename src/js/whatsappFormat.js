// Text in the WhatsApp format: *bold*, _italic_, ~struck~, "- " bullets,
// "1. " numbers. The text kept and copied is this very text (WhatsApp reads
// the marks itself): these helpers only change it from the toolbar.
// Each returns { text, start, end }: the new text and the selection to keep.

// Marks around the selection (or an empty pair with the cursor inside); a
// second click on a marked selection removes the marks. Spaces stay outside:
// WhatsApp needs the mark glued to the text.
export const toggleMark = (text, start, end, mark) => {
  const m = mark.length;
  const before = text.slice(0, start);
  const sel = text.slice(start, end);
  const after = text.slice(end);
  if (start === end) {
    return {
      text: before + mark + mark + after,
      start: start + m,
      end: start + m,
    };
  }
  // The marks are around the selection: removed
  if (before.endsWith(mark) && after.startsWith(mark)) {
    return {
      text: before.slice(0, -m) + sel + after.slice(m),
      start: start - m,
      end: end - m,
    };
  }
  // The selection includes its marks: removed
  if (sel.length > 2 * m && sel.startsWith(mark) && sel.endsWith(mark)) {
    const inner = sel.slice(m, -m);
    return { text: before + inner + after, start, end: start + inner.length };
  }
  const lead = sel.match(/^\s*/)[0];
  const trail = sel.slice(lead.length).match(/\s*$/)[0];
  const core = sel.slice(lead.length, sel.length - trail.length);
  if (!core) return { text, start, end };
  return {
    text: before + lead + mark + core + mark + trail + after,
    start: start + lead.length + m,
    end: start + lead.length + m + core.length,
  };
};

// "- " or "1. " in front of each line touched by the selection; again, they
// are removed
const BULLET = /^[-*] /;
const NUMBER = /^\d+\. /;
export const toggleList = (text, start, end, kind) => {
  const from = text.lastIndexOf('\n', start - 1) + 1;
  const to =
    text.indexOf('\n', end) === -1 ? text.length : text.indexOf('\n', end);
  const lines = text.slice(from, to).split('\n');
  const has = kind === 'bullet' ? BULLET : NUMBER;
  const all = lines.every((l) => has.test(l));
  let n = 0;
  const changed = lines.map((l) => {
    const bare = l.replace(BULLET, '').replace(NUMBER, '');
    if (all) return bare;
    if (!bare.trim()) return l;
    n += 1;
    return kind === 'bullet' ? `- ${bare}` : `${n}. ${bare}`;
  });
  const block = changed.join('\n');
  // The cursor goes to the end of the lines: what comes next (an icon, more
  // text) is added there, it does not replace them
  return {
    text: text.slice(0, from) + block + text.slice(to),
    start: from + block.length,
    end: from + block.length,
  };
};

export const insertAt = (text, start, end, value) => ({
  text: text.slice(0, start) + value + text.slice(end),
  start: start + value.length,
  end: start + value.length,
});
