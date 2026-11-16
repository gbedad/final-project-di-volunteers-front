import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
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
  const end = useRef(null);

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
  // The last message in sight
  const count = messages?.length || 0;
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [count]);

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/activites/${activityId}/chat`,
        { text }
      );
      setText('');
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

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.25} sx={{ maxHeight: 480, overflowY: 'auto', mb: 2 }}>
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
              <Typography variant="caption" color="text.secondary">
                {when(m.at)}
              </Typography>
            </Box>
          );
        })}
        <div ref={end} />
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
