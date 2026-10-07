import React from 'react';
import { Button, IconButton, MenuItem, Stack, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { DAYS } from '../../js/studentOptions';
import { SEARCH_TIMES } from '../../js/volunteerSearch';

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
          <TextField
            select
            size="small"
            label="De"
            value={slot.startTime || ''}
            onChange={(e) => update(index, 'startTime', e.target.value)}
            sx={{ width: 110 }}>
            {SEARCH_TIMES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="À"
            value={slot.endTime || ''}
            onChange={(e) => update(index, 'endTime', e.target.value)}
            sx={{ width: 110 }}>
            {SEARCH_TIMES.filter(
              (t) => !slot.startTime || t > slot.startTime
            ).map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
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
