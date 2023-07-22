import React, { useState } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

const UpdateCourseForm = ({ instance, onUpdate }) => {
  const [room, setRoom] = useState(instance.room || '');
  const [datetime, setDatetime] = useState(instance.datetime || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(instance.id, room, datetime);
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
        Update Course
      </Button>
    </form>
  );
};

export default UpdateCourseForm;
