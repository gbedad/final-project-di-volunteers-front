import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
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
  // backgroundColor: isCurrentUser
  //   ? theme.palette.primary.main
  //   : theme.palette.grey[300],
  // color: isCurrentUser
  //   ? theme.palette.primary.contrastText
  //   : theme.palette.text.primary,
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

const DiscussionThread = ({ currentUser, userId }) => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const userToken = location.state.userLogged.token;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const getMessages = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      // console.log(response.data);
      if (response.data.internal_thread) {
        const fetchedMessages = response.data.internal_thread.map(
          (string) => string
        );
        setMessages(fetchedMessages);
        setIsLoading(false);
        localStorage.setItem(
          `lastViewedCount_${userId}`,
          fetchedMessages.length.toString()
        );
      }
      setIsLoading(false);
    };

    getMessages();
  }, [userId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '') {
      const message = {
        id: Date.now(),
        sender: currentUser,
        content: newMessage,
        timestamp: new Date(),
      };
      const updatedMessages = [...messages, message];
      setMessages([...messages, message]);

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/add-internalthread/${userId}`,
          updatedMessages,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': userToken,
            },
          }
        );
        // console.log(response.data.message);
        if (response.data.message) {
          console.log('Message saved successfully');
        } else {
          console.error('Failed to save message');
        }
        // Update last viewed count in local storage
        localStorage.setItem(
          `lastViewedCount_${userId}`,
          updatedMessages.length.toString()
        );
      } catch (error) {
        console.error('Failed to save message', error);
      }

      setNewMessage('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const allMessages = messages.filter((message) => message.id !== messageId);
    setMessages(allMessages);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/add-internalthread/${userId}`,
        allMessages,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': userToken,
          },
        }
      );
      // console.log(response.data.message);
      if (response.data.message) {
        console.log('Message saved successfully');
      } else {
        console.error('Failed to save message');
      }
      // Update last viewed count in local storage
      localStorage.setItem(
        `lastViewedCount_${userId}`,
        allMessages.length.toString()
      );
    } catch (error) {
      console.error('Failed to save message', error);
    }
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
            <Box
              key={message.id}
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
              sx={{ position: 'relative' }}>
              <MessageContainer isCurrentUser={isCurrentUser}>
                <MessageBubble isCurrentUser={isCurrentUser}>
                  {!isCurrentUser && (
                    <MessageHeader variant="subtitle2">
                      {message.sender}
                    </MessageHeader>
                  )}
                  <Typography variant="body1">{message.content}</Typography>
                  <MessageTimestamp variant="caption">
                    {format(
                      new Date(message.timestamp),
                      "d/MM/yyyy 'à' h:mm:ss a"
                    )}
                  </MessageTimestamp>
                </MessageBubble>
              </MessageContainer>
              {isCurrentUser && (
                <Fade in={hoveredMessageId === message.id}>
                  <DeleteButton
                    size="small"
                    onClick={() => handleDeleteMessage(message.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </DeleteButton>
                </Fade>
              )}
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>
      <InputContainer>
        <StyledTextareaAutosize
          placeholder="Message"
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
