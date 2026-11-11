import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { SEARCH_TIMES } from '../js/volunteerSearch';

// "14h15", "14:15", "14.15", "1415", "14h", "14" -> "14:15" / "14:00"
export const parseTime = (text) => {
  const t = String(text || '')
    .trim()
    .toLowerCase();
  const m =
    /^(\d{1,2})\s*(?:[h:.]\s*(\d{1,2})?)?$/.exec(t) ||
    /^(\d{2})(\d{2})$/.exec(t);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2] || 0);
  if (h > 23 || min > 59) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(min)}`;
};

// An hour ("HH:MM"): chosen in the half-hour list, or typed freely (14h15).
// after: an end hour must come later (an earlier one typed is refused).
// An unreadable entry puts the previous value back; an empty one clears.
const TimeInput = ({
  label,
  value,
  onChange,
  options = SEARCH_TIMES,
  after,
  error,
  sx = { width: 110 },
  fullWidth,
  disabled,
}) => {
  const [text, setText] = useState(value || '');
  useEffect(() => setText(value || ''), [value]);
  const shown = after ? options.filter((t) => t > after) : options;
  const commit = (raw) => {
    if (!String(raw || '').trim()) {
      setText('');
      if (value) onChange('');
      return;
    }
    const time = parseTime(raw);
    if (time && !(after && time <= after)) {
      setText(time);
      if (time !== value) onChange(time);
    } else setText(value || '');
  };
  return (
    <Autocomplete
      freeSolo
      disableClearable
      size="small"
      options={shown}
      value={value || ''}
      inputValue={text}
      onInputChange={(e, v, reason) => reason !== 'reset' && setText(v)}
      onChange={(e, v) => commit(v)}
      // Typing "14" (or "14h1") shows 14:00 and 14:30
      filterOptions={(opts, { inputValue }) => {
        const h = /^(\d{1,2})/.exec(inputValue.trim())?.[1];
        if (!h || inputValue === value) return opts;
        return opts.filter((o) => o.startsWith(h.padStart(2, '0')));
      }}
      fullWidth={fullWidth}
      disabled={disabled}
      sx={fullWidth ? undefined : sx}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error || (!!after && !!value && value <= after)}
          onBlur={() => commit(text)}
          InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
          inputProps={{ ...params.inputProps, placeholder: '14h15' }}
        />
      )}
    />
  );
};

export default TimeInput;
