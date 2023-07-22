import React, { useState } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

const CreateInstanceForm = ({ courseId, onInstanceCreate }) => {
  const [room, setRoom] = useState('');
  const [datetime, setDatetime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onInstanceCreate(room, datetime);
    setRoom('');
    setDatetime('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />

      <TextField
        label="Date and Time"
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
      />

      <Button type="submit" variant="contained" color="primary">
        Add Instance
      </Button>
    </form>
  );
};

export default CreateInstanceForm;
