import React from 'react';
import { Button, IconButton, MenuItem, Stack, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { DAYS } from '../../js/studentOptions';
import TimeInput from '../TimeInput';

// Availability slots: [{ day, startTime, endTime }] (same as the tutors)
const SlotsEditor = ({ value = [], onChange }) => {
  const update = (index, field, fieldValue) =>
    onChange(
      value.map((s, i) => (i === index ? { ...s, [field]: fieldValue } : s))
    );
  return (
    <Stack spacing={1}>
      {value.map((slot, index) => (
        <Stack key={index} direction="row" spacing={1} alignItems="center">
          <TextField
            select
            size="small"
            label="Jour"
            value={slot.day || ''}
            onChange={(e) => update(index, 'day', e.target.value)}
            sx={{ width: 140 }}>
            {DAYS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
          <TimeInput
            label="De"
            value={slot.startTime}
            onChange={(t) => update(index, 'startTime', t)}
          />
          <TimeInput
            label="À"
            value={slot.endTime}
            after={slot.startTime}
            onChange={(t) => update(index, 'endTime', t)}
          />
          <IconButton
            aria-label="Retirer le créneau"
            onClick={() => onChange(value.filter((_, i) => i !== index))}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <Button
        size="small"
        startIcon={<AddIcon />}
        sx={{ alignSelf: 'flex-start' }}
        onClick={() =>
          onChange([...value, { day: '', startTime: '', endTime: '' }])
        }>
        Ajouter un créneau
      </Button>
    </Stack>
  );
};

export default SlotsEditor;
