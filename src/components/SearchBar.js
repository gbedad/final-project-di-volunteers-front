import React, { useState } from 'react';
import { TextField, Button, Autocomplete, Stack } from '@mui/material';
import { existingSubjects } from '../options/existingOptions';

const subjects = existingSubjects;

const SearchBar = ({ onSearchSubject }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  // const [filteredData, setFilteredData] = useState([]);

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  // const handleSearch = () => {
  //   // Call the onSearch prop and pass the topic and location values
  //   onSearch(topic, location, status);
  // };

  return (
    <Stack spacing={2} sx={{ width: 400 }} direction="row">
      <Autocomplete
        sx={{ width: 300 }}
        freeSolo
        id="free-solo-2-demo"
        disableClearable
        options={subjects.map((option) => option.title)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search input"
            InputProps={{
              ...params.InputProps,
              type: 'search',
            }}
            value={selectedSubject}
            onChange={handleSubjectChange}
          />
        )}
      />
      {/* <TextField
        size="small"
        label="Search by topic"
        value={topic}
        onChange={handleTopicChange}
        sx={{ marginRight: '1rem' }}
      />
      <TextField
        size="small"
        label="Search by location"
        value={location}
        onChange={handleLocationChange}
        sx={{ marginRight: '1rem' }}
      />
      <TextField
        size="small"
        label="Search by status"
        value={status}
        onChange={handleStatusChange}
        sx={{ marginRight: '1rem' }}
      /> */}
      <Button variant="contained" color="secondary">
        Searcher
      </Button>
    </Stack>
  );
};

export default SearchBar;
