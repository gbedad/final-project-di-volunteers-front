import React from 'react';
import { TextField, Box, Button } from '@mui/material';

const SearchBar = ({ onSearch }) => {
  const [topic, setTopic] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [status, setStatus] = React.useState('');

  const handleTopicChange = (event) => {
    setTopic(event.target.value);
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleSearch = () => {
    // Call the onSearch prop and pass the topic and location values
    onSearch(topic, location, status);
  };

  return (
    <Box display="flex" alignItems="center" maxWidth={700}>
      <TextField
        label="Search by topic"
        value={topic}
        onChange={handleTopicChange}
        sx={{ marginRight: '1rem' }}
      />
      <TextField
        label="Search by location"
        value={location}
        onChange={handleLocationChange}
        sx={{ marginRight: '1rem' }}
      />
      <TextField
        label="Search by status"
        value={status}
        onChange={handleStatusChange}
        sx={{ marginRight: '1rem' }}
      />
      <Button variant="contained" onClick={handleSearch}>
        Search
      </Button>
    </Box>
  );
};

export default SearchBar;
