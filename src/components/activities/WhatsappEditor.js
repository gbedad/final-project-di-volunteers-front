import React, { useCallback, useRef, useState } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import { insertAt, toggleList, toggleMark } from '../../js/whatsappFormat';

// Icons (emojis: they go through WhatsApp), by theme
const EMOJIS = [
  [
    'Lieu et temps',
    ['📍', '🕒', '📅', '⏰', '🚇', '🚌', '🚶', '🏛️', '🎭', '🎨'],
  ],
  [
    'À faire, attention',
    ['✅', '❗', '⚠️', '👉', '📌', 'ℹ️', '❓', '📞', '💬', '📧'],
  ],
  ['À apporter', ['🎒', '🥪', '💧', '🧥', '☔', '🪪', '📄', '✏️', '📱', '🎟️']],
  ['Ambiance', ['😊', '👋', '🎉', '🙏', '👏', '🌟', '🎶', '📚', '❤️', '👍']],
];

// ---- Preview: the text as WhatsApp shows it ----
// A mark opens after a space (or the start) and closes before a space or a
// punctuation mark, glued to the text, as in WhatsApp.
const INLINE = /(^|[^\p{L}\p{N}])([*_~])(\S(?:[^\n]*?\S)?)\2(?![\p{L}\p{N}])/u;
const TAGS = { '*': 'b', _: 'i', '~': 's' };
const inline = (text, key) => {
  const out = [];
  let rest = text;
  let i = 0;
  while (rest) {
    const m = INLINE.exec(rest);
    if (!m) {
      out.push(rest);
      break;
    }
    out.push(rest.slice(0, m.index + m[1].length));
    const Tag = TAGS[m[2]];
    i += 1;
    out.push(<Tag key={`${key}-${i}`}>{inline(m[3], `${key}-${i}`)}</Tag>);
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
};
export const Preview = ({ text }) => (
  <Box
    sx={{
      bgcolor: '#d9fdd3',
      color: '#111b21',
      borderRadius: '10px 10px 10px 2px',
      boxShadow: '0 1px 1px rgba(11, 20, 26, 0.18)',
      px: 1.5,
      py: 1,
      maxWidth: 520,
      fontSize: 14.5,
      lineHeight: 1.4,
      overflowWrap: 'anywhere',
    }}>
    {text.split('\n').map((line, i) => {
      if (!line.trim()) return <Box key={i} sx={{ height: '1.1em' }} />;
      const bullet = /^[-*] (.*)$/.exec(line);
      const quote = /^> (.*)$/.exec(line);
      if (bullet) {
        return (
          <Box key={i} sx={{ display: 'flex', gap: 1, pl: 0.5 }}>
            <span>•</span>
            <span>{inline(bullet[1], i)}</span>
          </Box>
        );
      }
      if (quote) {
        return (
          <Box
            key={i}
            sx={{ borderLeft: '4px solid #06cf9c', pl: 1, my: 0.25 }}>
            {inline(quote[1], i)}
          </Box>
        );
      }
      return (
        <Box key={i} sx={{ whiteSpace: 'pre-wrap' }}>
          {inline(line, i)}
        </Box>
      );
    })}
  </Box>
);

// Text box in the WhatsApp format, with its toolbar (bold, italic, struck,
// lists, icons). Controlled: `value` and `onChange(text)`.
export const WhatsappEditor = ({
  value,
  onChange,
  max,
  placeholder,
  minRows = 8,
}) => {
  const [emoji, setEmoji] = useState(null);
  const input = useRef(null);

  // A change from the toolbar: the selection is kept for the next click
  const apply = useCallback(
    (change) => {
      const el = input.current;
      if (!el) return;
      const r = change(value, el.selectionStart, el.selectionEnd);
      if (!r) return;
      onChange(r.text);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(r.start, r.end);
      });
    },
    [value, onChange]
  );
  const bold = () => apply((t, s, e) => toggleMark(t, s, e, '*'));
  const italic = () => apply((t, s, e) => toggleMark(t, s, e, '_'));
  const strike = () => apply((t, s, e) => toggleMark(t, s, e, '~'));
  const bullets = () => apply((t, s, e) => toggleList(t, s, e, 'bullet'));
  const numbers = () => apply((t, s, e) => toggleList(t, s, e, 'number'));
  const addEmoji = (v) => {
    setEmoji(null);
    // After the selection: an icon never replaces the text selected
    // (a space first when it follows a word)
    apply((t, s, e) =>
      insertAt(t, e, e, (e > 0 && !/\s$/.test(t.slice(0, e)) ? ' ' : '') + v)
    );
  };
  const onKeyDown = (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === 'b') {
      e.preventDefault();
      bold();
    } else if (k === 'i') {
      e.preventDefault();
      italic();
    }
  };

  const tool = (label, onClick, icon) => (
    <Tooltip title={label}>
      <IconButton size="small" aria-label={label} onClick={onClick}>
        {icon}
      </IconButton>
    </Tooltip>
  );
  return (
    <>
      <Paper variant="outlined">
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.25}
          flexWrap="wrap"
          useFlexGap
          sx={{ p: 0.5, borderBottom: 1, borderColor: 'divider' }}>
          {tool('Gras (Ctrl+B)', bold, <FormatBoldIcon />)}
          {tool('Italique (Ctrl+I)', italic, <FormatItalicIcon />)}
          {tool('Barré', strike, <FormatStrikethroughIcon />)}
          {tool('Liste à puces', bullets, <FormatListBulletedIcon />)}
          {tool('Liste numérotée', numbers, <FormatListNumberedIcon />)}
          {tool(
            'Icônes',
            (e) => setEmoji(e.currentTarget),
            <EmojiEmotionsIcon />
          )}
        </Stack>
        <TextField
          multiline
          fullWidth
          minRows={minRows}
          variant="standard"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          inputRef={input}
          inputProps={{ maxLength: max }}
          InputProps={{ disableUnderline: true, sx: { p: 1.5 } }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', px: 1.5, pb: 0.75, textAlign: 'right' }}>
          {value.length} / {max}
        </Typography>
      </Paper>
      <Popover
        open={!!emoji}
        anchorEl={emoji}
        onClose={() => setEmoji(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 1.5, maxWidth: 320 }}>
          {EMOJIS.map(([title, list]) => (
            <Box key={title} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {title}
              </Typography>
              <Stack direction="row" flexWrap="wrap" useFlexGap>
                {list.map((e) => (
                  <IconButton
                    key={e}
                    size="small"
                    aria-label={`Insérer ${e}`}
                    onClick={() => addEmoji(e)}
                    sx={{ fontSize: 22, width: 40, height: 40 }}>
                    {e}
                  </IconButton>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};
