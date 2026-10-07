import React from 'react';
import { Button, IconButton, MenuItem, Stack, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { SUBJECTS, TOPIC_PRIORITIES } from '../../js/studentOptions';

// Subjects to work on, each with a priority: [{ subject, priority }]
const TopicsEditor = ({ value = [], onChange }) => {
  const update = (index, field, fieldValue) =>
    onChange(
      value.map((t, i) => (i === index ? { ...t, [field]: fieldValue } : t))
    );
  const used = value.map((t) => t.subject);
  return (
    <Stack spacing={1}>
      {value.map((topic, index) => (
        <Stack key={index} direction="row" spacing={1} alignItems="center">
          <TextField
            select
            size="small"
            label="Matière"
            value={topic.subject || ''}
            onChange={(e) => update(index, 'subject', e.target.value)}
            sx={{ flex: 1 }}>
            {SUBJECTS.filter(
              (s) => s === topic.subject || !used.includes(s)
            ).map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Priorité"
            value={topic.priority || 'haute'}
            onChange={(e) => update(index, 'priority', e.target.value)}
            sx={{ width: 150 }}>
            {TOPIC_PRIORITIES.map((p) => (
              <MenuItem key={p.value} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
          </TextField>
          <IconButton
            aria-label="Retirer la matière"
            onClick={() => onChange(value.filter((_, i) => i !== index))}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <Button
        size="small"
        startIcon={<AddIcon />}
        sx={{ alignSelf: 'flex-start' }}
        disabled={value.some((t) => !t.subject)}
        onClick={() =>
          onChange([...value, { subject: '', priority: 'haute' }])
        }>
        Ajouter une matière
      </Button>
    </Stack>
  );
};

export default TopicsEditor;
