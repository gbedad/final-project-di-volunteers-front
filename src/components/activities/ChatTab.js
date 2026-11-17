import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { BASE_URL } from './activityUtils';

// Who is connected (first name shown before what they type)
const me = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.user || {};
  } catch {
    return {};
  }
};
const when = (at) =>
  new Date(at).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });
// New messages of the others, every 20 seconds while the tab is open
const REFRESH_MS = 20000;

// "Chat" tab of an outing: the people in charge write to each other; each
// message starts with the first name of who wrote it. onCount: number of
// messages (the tab's label).
const ChatTab = ({ activityId, onCount }) => {
  const user = me();
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  // The window of messages (fixed height, scrolls by itself)
  const box = useRef(null);
  // At the bottom (or a message just sent): the new ones are shown
  const atBottom = useRef(true);
  const stick = useRef(true);
  // Own message asked to be deleted (its time)
  const [deleting, setDeleting] = useState(null);

  const show = useCallback(
    (list) => {
      setMessages(list);
      onCount?.(list.length);
    },
    [onCount]
  );
  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/activites/${activityId}/chat`)
      .then(({ data }) => show(data))
      .catch(() => setMessages((m) => m || []));
  }, [activityId, show]);
  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);
  // The last messages in sight, as in WhatsApp: unless one scrolled up to
  // read older ones (a message sent always brings back to the bottom)
  const count = messages?.length || 0;
  useEffect(() => {
    const el = box.current;
    if (el && (stick.current || atBottom.current))
      el.scrollTop = el.scrollHeight;
    stick.current = false;
  }, [count, messages]);
  const onScroll = () => {
    const el = box.current;
    if (el)
      atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/activites/${activityId}/chat`,
        { text }
      );
      setText('');
      stick.current = true;
      show(data);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Le message n'a pas pu être envoyé",
        { position: 'bottom-left' }
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (m) => {
    try {
      const { data } = await axios.delete(
        `${BASE_URL}/admin/activites/${activityId}/chat`,
        { data: { at: m.at } }
      );
      setDeleting(null);
      show(data);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Le message n'a pas pu être supprimé",
        { position: 'bottom-left' }
      );
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        ref={box}
        onScroll={onScroll}
        spacing={1.25}
        sx={{
          // Fixed height: the page does not move, the messages scroll
          height: { xs: '55vh', sm: 440 },
          overflowY: 'auto',
          mb: 2,
          pr: 0.5,
          // The few first messages at the bottom, near the input
          '& > :first-of-type': { mt: 'auto' },
        }}>
        {messages === null && (
          <Typography variant="body2" color="text.secondary">
            Chargement…
          </Typography>
        )}
        {messages?.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Aucun message. Écrivez le premier : il sera visible par toutes les
            personnes qui suivent les sorties.
          </Typography>
        )}
        {(messages || []).map((m, i) => {
          const mine = m.user_id === user.id;
          return (
            <Box
              key={`${m.at}-${i}`}
              sx={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                bgcolor: (t) =>
                  mine
                    ? alpha(t.palette.primary.main, 0.08)
                    : t.palette.action.hover,
                border: 1,
                borderColor: mine ? 'primary.light' : 'transparent',
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
              }}>
              <Typography
                variant="body2"
                sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                <b>{m.by} :</b> {m.text}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {when(m.at)}
                </Typography>
                {mine && deleting !== m.at && (
                  <IconButton
                    size="small"
                    aria-label="Supprimer mon message"
                    title="Supprimer mon message"
                    onClick={() => setDeleting(m.at)}
                    sx={{ p: 0.25 }}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
                {mine && deleting === m.at && (
                  <>
                    <Button
                      size="small"
                      color="error"
                      sx={{ minWidth: 0, py: 0 }}
                      onClick={() => remove(m)}>
                      Supprimer
                    </Button>
                    <Button
                      size="small"
                      sx={{ minWidth: 0, py: 0 }}
                      onClick={() => setDeleting(null)}>
                      Garder
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          );
        })}
      </Stack>
      <Stack direction="row" spacing={1} alignItems="flex-end">
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={12}
          size="small"
          placeholder="Votre message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // Ctrl (or Cmd) + Entrée : envoyer
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              send();
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ alignSelf: 'flex-start', mt: '10px' }}>
                <b>{user.first_name || 'Moi'} :</b>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          disabled={busy || !text.trim()}
          onClick={send}
          aria-label="Envoyer"
          sx={{ minWidth: 0, px: 1.5 }}>
          <SendIcon fontSize="small" />
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Ctrl + Entrée pour envoyer. Les messages se mettent à jour toutes les 20
        secondes.
      </Typography>
    </Paper>
  );
};

export default ChatTab;
