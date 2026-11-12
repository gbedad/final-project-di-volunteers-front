import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Autocomplete, TextField } from '@mui/material';

// Address with suggestions from the national address base (BAN). Free typing
// stays possible (a building, an address not found).
// url: the search endpoint (team or parent's link); onText(text) while
// typing; onPick({ label, street, postcode, city, citycode, lat, lon })
const AddressField = ({
  url,
  value,
  onText,
  onPick,
  label = 'Adresse',
  size = 'small',
  disabled,
  helperText,
}) => {
  const [options, setOptions] = useState([]);
  const [text, setText] = useState(value || '');
  const timer = useRef(null);
  useEffect(() => setText(value || ''), [value]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const search = (q) => {
    clearTimeout(timer.current);
    if (q.trim().length < 4) return setOptions([]);
    // A short pause after typing: one request, not one per key
    timer.current = setTimeout(() => {
      axios
        .get(url, { params: { q } })
        .then(({ data }) => setOptions(Array.isArray(data) ? data : []))
        .catch(() => setOptions([]));
    }, 350);
  };
  return (
    <Autocomplete
      freeSolo
      disabled={disabled}
      options={options}
      filterOptions={(x) => x}
      getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
      inputValue={text}
      onInputChange={(e, v, reason) => {
        if (reason === 'reset') return;
        setText(v);
        onText?.(v);
        search(v);
      }}
      onChange={(e, v) => {
        if (v && typeof v === 'object') {
          setText(v.street);
          onPick(v);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size={size}
          label={label}
          helperText={helperText}
          inputProps={{ ...params.inputProps, autoComplete: 'street-address' }}
        />
      )}
      fullWidth
    />
  );
};

export default AddressField;
