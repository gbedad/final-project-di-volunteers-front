import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Box,
  Typography,
  Paper,
  TextareaAutosize,
  IconButton,
  Fade,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/system';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { onThreadChanged } from '../../js/whatsapp';

const BASE_URL = process.env.REACT_APP_BASE_URL;
// New messages from colleagues show up without reloading the page
const REFRESH_MS = 30000;

const MessageContainer = styled(Box)(({ theme, isCurrentUser }) => ({
  display: 'flex',
  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(2),
}));

const MessageBubble = styled(Paper)(({ theme, isCurrentUser }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: 16,
  minWidth: '70%',
  maxWidth: '90%',
  backgroundColor: isCurrentUser ? 'rgb(255, 255, 255)' : 'rgb( 199, 249, 204)',
  color: isCurrentUser ? 'rgb(0, 0, 0)' : theme.palette.text.primary,
  position: 'relative',
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: -16,
  right: -16,
  padding: 4,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const MessageHeader = styled(Typography)({
  fontWeight: 'bold',
  marginBottom: 4,
});

const MessageTimestamp = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.7,
  marginTop: 4,
  textAlign: 'right',
});

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  alignItems: 'flex-end',
  position: 'relative',
}));

const StyledTextareaAutosize = styled(TextareaAutosize)(({ theme }) => ({
  width: '100%',
  minHeight: '40px',
  maxHeight: '150px',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  resize: 'none',
  '&:focus': {
    outline: 'none',
    border: `2px solid ${theme.palette.primary.main}`,
  },
}));

const formatDate = (value) => format(new Date(value), "d/MM/yyyy 'à' HH:mm");

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Message text with the @mentions in bold
const MessageContent = ({ message, team }) => {
  const names = team
    .filter((u) => (message.mentions || []).includes(u.id))
    .map((u) => `@${u.name}`);
  if (!names.length) return message.content;
  const parts = message.content.split(
    new RegExp(`(${names.map(escapeRegExp).join('|')})`, 'g')
  );
  return parts.map((part, i) =>
    names.includes(part) ? (
      <Box
        component="span"
        key={i}
        sx={{ fontWeight: 600, color: 'primary.main' }}>
        {part}
      </Box>
    ) : (
      part
    )
  );
};

// "@Gér" just before the cursor -> "Gér"
const mentionQuery = (text, caret) => {
  const match = /(^|\s)@([^\s@]*)$/.exec(text.slice(0, caret));
  return match ? match[2] : null;
};

const DiscussionThread = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [team, setTeam] = useState([]);
  const [me, setMe] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [mentioned, setMentioned] = useState([]);
  const [query, setQuery] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/admin/users/${userId}/thread`
      );
      setMessages(data.messages);
      setTeam(data.team);
      setMe(data.me);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    load();
    const timer = setInterval(load, REFRESH_MS);
    const stop = onThreadChanged(load);
    return () => {
      clearInterval(timer);
      stop();
    };
  }, [userId, load]);

  // Scroll inside the discussion only, not the whole page
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const suggestions =
    query === null
      ? []
      : team
          .filter((u) => u.id !== me)
          .filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6);

  const handleChange = (event) => {
    setNewMessage(event.target.value);
    setQuery(mentionQuery(event.target.value, event.target.selectionStart));
  };

  const insertMention = (member) => {
    const input = inputRef.current;
    const caret = input ? input.selectionStart : newMessage.length;
    const before = newMessage
      .slice(0, caret)
      .replace(/@([^\s@]*)$/, `@${member.name} `);
    setNewMessage(before + newMessage.slice(caret));
    setMentioned((prev) => [...new Set([...prev, member.id])]);
    setQuery(null);
    setTimeout(() => {
      input?.focus();
      input?.setSelectionRange(before.length, before.length);
    });
  };

  const handleSendMessage = async () => {
    const content = newMessage.trim();
    if (!content || sending) return;
    // Mentions removed from the text while typing are not notified
    const mentions = mentioned.filter((id) => {
      const member = team.find((u) => u.id === id);
      return member && content.includes(`@${member.name}`);
    });
    setSending(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/users/${userId}/thread`,
        { content, mentions }
      );
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
      setMentioned([]);
      setQuery(null);
      if (mentions.length) {
        toast.success(
          'Les personnes mentionnées ont été prévenues par e-mail',
          {
            position: 'bottom-left',
          }
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Le message n'a pas pu être envoyé", {
        position: 'bottom-left',
      });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${BASE_URL}/admin/thread/${messageId}`);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error(error);
      toast.error('Suppression impossible', { position: 'bottom-left' });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && query !== null) {
      setQuery(null);
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (suggestions.length) insertMention(suggestions[0]);
      else handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        ref={listRef}
        sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 420, padding: 2 }}>
        {messages.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Aucun message. Tapez @ pour mentionner un membre de l'équipe : il
            sera prévenu par e-mail.
          </Typography>
        )}
        {messages.map((message) => {
          const isCurrentUser = message.author_id === me;
          if (message.kind === 'whatsapp') {
            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  mb: 2,
                  color: 'text.secondary',
                }}>
                <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
                <Typography variant="caption">
                  {message.author_name} {message.content} le{' '}
                  {formatDate(message.created_at)}
                </Typography>
              </Box>
            );
          }
          return (
            <Box
              key={message.id}
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
              sx={{ position: 'relative' }}>
              <MessageContainer isCurrentUser={isCurrentUser}>
                <MessageBubble isCurrentUser={isCurrentUser}>
                  {!isCurrentUser && (
                    <MessageHeader variant="subtitle2">
                      {message.author_name}
                    </MessageHeader>
                  )}
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    <MessageContent message={message} team={team} />
                  </Typography>
                  <MessageTimestamp variant="caption" component="div">
                    {formatDate(message.created_at)}
                  </MessageTimestamp>
                </MessageBubble>
              </MessageContainer>
              {isCurrentUser && (
                <Fade in={hoveredMessageId === message.id}>
                  <DeleteButton
                    size="small"
                    title="Supprimer mon message"
                    onClick={() => handleDeleteMessage(message.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </DeleteButton>
                </Fade>
              )}
            </Box>
          );
        })}
      </Box>
      <InputContainer>
        {suggestions.length > 0 && (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              bottom: '100%',
              left: 16,
              zIndex: 2,
              minWidth: 220,
            }}>
            <List dense disablePadding>
              {suggestions.map((member) => (
                <ListItemButton
                  key={member.id}
                  // Keep the focus in the text box
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertMention(member)}>
                  <ListItemText primary={member.name} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
        <StyledTextareaAutosize
          placeholder="Message (@ pour mentionner)"
          value={newMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setQuery(null)}
          ref={inputRef}
          minRows={1}
          maxRows={6}
        />
        <IconButton
          color="primary"
          disabled={!newMessage.trim() || sending}
          onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </InputContainer>
    </Box>
  );
};

export default DiscussionThread;
