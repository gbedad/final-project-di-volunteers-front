import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Popover,
  Stack,
  Tooltip,
  TextField,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import ShareIcon from '@mui/icons-material/Share';
import { BASE_URL } from './activityUtils';
import { insertAt, toggleList, toggleMark } from '../../js/whatsappFormat';

const MAX = 10000;
const URL_GUIDELINES = `${BASE_URL}/admin/consignes-sorties`;

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
const Preview = ({ text }) => (
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

const when = (at) =>
  new Date(at).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });

// "Consignes" of the outings: one text for all of them, written in the
// WhatsApp format, saved, and copied into the messages to the families
const GuidelinesPanel = ({ canEdit }) => {
  const [saved, setSaved] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emoji, setEmoji] = useState(null);
  const input = useRef(null);

  useEffect(() => {
    axios
      .get(URL_GUIDELINES)
      .then(({ data }) => {
        setSaved(data);
        setText(data.body || '');
      })
      .catch(() => setError(true));
  }, []);
  const dirty = saved !== null && text !== (saved.body || '');
  // Leaving the page with text not saved
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // A change from the toolbar: the selection is kept for the next click
  const apply = useCallback(
    (change) => {
      const el = input.current;
      if (!el) return;
      const r = change(text, el.selectionStart, el.selectionEnd);
      if (!r) return;
      setText(r.text);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(r.start, r.end);
      });
    },
    [text]
  );
  const bold = () => apply((t, s, e) => toggleMark(t, s, e, '*'));
  const italic = () => apply((t, s, e) => toggleMark(t, s, e, '_'));
  const strike = () => apply((t, s, e) => toggleMark(t, s, e, '~'));
  const bullets = () => apply((t, s, e) => toggleList(t, s, e, 'bullet'));
  const numbers = () => apply((t, s, e) => toggleList(t, s, e, 'number'));
  const addEmoji = (value) => {
    setEmoji(null);
    // After the selection: an icon never replaces the text selected
    // (a space first when it follows a word)
    apply((t, s, e) =>
      insertAt(
        t,
        e,
        e,
        (e > 0 && !/\s$/.test(t.slice(0, e)) ? ' ' : '') + value
      )
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

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(URL_GUIDELINES, { body: text });
      setSaved(data);
      toast.success('Consignes enregistrées', { position: 'bottom-left' });
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Les consignes n'ont pas pu être enregistrées",
        { position: 'bottom-left' }
      );
    } finally {
      setSaving(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copié : collez dans WhatsApp', {
        position: 'bottom-left',
      });
    } catch {
      toast.error('Copie impossible : sélectionnez le texte à la main', {
        position: 'bottom-left',
      });
    }
  };
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
  const share = async () => {
    try {
      await navigator.share({ text });
    } catch (err) {
      if (err?.name !== 'AbortError') copy();
    }
  };

  if (error) {
    return (
      <Alert severity="error">Les consignes n'ont pas pu être chargées.</Alert>
    );
  }
  if (saved === null) return <LinearProgress />;

  const tool = (label, onClick, icon) => (
    <Tooltip title={label}>
      <IconButton size="small" aria-label={label} onClick={onClick}>
        {icon}
      </IconButton>
    </Tooltip>
  );
  return (
    <Stack spacing={2} sx={{ maxWidth: 720 }}>
      <Typography variant="body2" color="text.secondary">
        Un texte pour toutes les sorties, au format WhatsApp : ce que vous voyez
        dans l'aperçu est ce que les familles recevront après la copie.
      </Typography>
      {canEdit ? (
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
            minRows={8}
            variant="standard"
            placeholder={
              "Ex. :\n*Rendez-vous* 📍 devant le musée à 14 h\n- pièce d'identité\n- goûter dans le sac"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            inputRef={input}
            inputProps={{ maxLength: MAX }}
            InputProps={{ disableUnderline: true, sx: { p: 1.5 } }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', px: 1.5, pb: 0.75, textAlign: 'right' }}>
            {text.length} / {MAX}
          </Typography>
        </Paper>
      ) : (
        !text.trim() && (
          <Alert severity="info">Aucune consigne rédigée pour l'instant.</Alert>
        )
      )}
      {canEdit && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap>
          <Button
            variant="contained"
            disabled={!dirty || saving}
            onClick={save}>
            Enregistrer
          </Button>
          {dirty && (
            <Chip size="small" color="warning" label="Pas encore enregistré" />
          )}
        </Stack>
      )}
      {saved.updated_at && (
        <Typography variant="caption" color="text.secondary">
          Dernière modification le {when(saved.updated_at)}
          {saved.updated_by ? ` par ${saved.updated_by}` : ''}.
        </Typography>
      )}
      {text.trim() && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
            Aperçu dans WhatsApp
          </Typography>
          <Preview text={text} />
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={copy}>
              Copier pour WhatsApp
            </Button>
            {canShare && (
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={share}>
                Partager
              </Button>
            )}
          </Stack>
        </Box>
      )}
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
    </Stack>
  );
};

export default GuidelinesPanel;
