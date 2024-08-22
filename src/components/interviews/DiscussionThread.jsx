import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  TextField,
  TextareaAutosize,
  IconButton,
  Text,
  Fade,
} from '@mui/material';
import { styled } from '@mui/system';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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
  backgroundColor: isCurrentUser
    ? theme.palette.primary.main
    : theme.palette.grey[300],
  color: isCurrentUser
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
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
  alignItems: 'flex-end', // Align items to the bottom
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

const DiscussionThread = ({ currentUser }) => {
  const [messages, setMessages] = useState([
    { sender: 'Emmanuelle', content: 'Test en dur', timestamp: new Date() },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const message = {
        id: Date.now(),
        sender: currentUser,
        content: newMessage,
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  console.log(messages);

  const handleDeleteMessage = (messageId) => {
    setMessages(messages.filter((message) => message.id !== messageId));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: 2 }}>
        {messages.map((message) => {
          const isCurrentUser = message.sender === currentUser;
          return (
            <MessageContainer key={message.id} isCurrentUser={isCurrentUser}>
              {!isCurrentUser && (
                <Avatar sx={{ marginRight: 1 }}>
                  {message.sender.charAt(0).toUpperCase()}
                </Avatar>
              )}
              <MessageBubble isCurrentUser={isCurrentUser}>
                {!isCurrentUser && (
                  <MessageHeader variant="subtitle2">
                    {message.sender}
                  </MessageHeader>
                )}
                <Typography variant="body1">{message.content}</Typography>
                <MessageTimestamp variant="caption">
                  {message.timestamp.toLocaleString()}
                </MessageTimestamp>
                {isCurrentUser && (
                  <Fade in={hoveredMessageId === message.id}>
                    <DeleteButton
                      size="small"
                      onClick={() => handleDeleteMessage(message.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </DeleteButton>
                  </Fade>
                )}
              </MessageBubble>
            </MessageContainer>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>
      <InputContainer>
        <StyledTextareaAutosize
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          ref={inputRef}
          minRows={1}
          maxRows={6}
        />
        <IconButton color="primary" onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </InputContainer>
    </Box>
  );
};

export default DiscussionThread;
