import React, { useState } from 'react';

// Message component to display individual messages
const Message = ({ message }) => (
  <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
    <strong>{message.user}:</strong>
    <p>{message.content}</p>
  </div>
);

// DiscussionThread component to manage and display the list of messages
const DiscussionThread = () => {
  // State to hold messages
  const [messages, setMessages] = useState([]);
  // State to hold new message content
  const [newMessage, setNewMessage] = useState('');
  // State to hold current user
  const [currentUser, setCurrentUser] = useState('Gerald');

  // Function to handle adding a new message
  const addMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      user: currentUser,
      content: newMessage,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Fil de discussion</h2>
      <div>
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        <textarea
          rows="3"
          style={{ width: '100%', padding: '10px' }}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button onClick={addMessage} style={{ marginTop: '10px', padding: '10px 20px' }}>
          Post Message
        </button>
      </div>
    </div>
  );
};

export default DiscussionThread;
