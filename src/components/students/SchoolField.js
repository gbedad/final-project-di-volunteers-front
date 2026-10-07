import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const schoolLabel = (school) =>
  school ? `${school.name}${school.city ? ` (${school.city})` : ''}` : '';

// School from the national directory (name or town); REP / REP+ shown
const SchoolField = ({ value, onChange }) => {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = input.trim();
    if (q.length < 3 || q === schoolLabel(value)) return undefined;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${BASE_URL}/admin/schools`, {
          params: { q },
        });
        setOptions(data);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [input, value]);

  return (
    <Autocomplete
      value={value || null}
      options={options}
      loading={loading}
      filterOptions={(x) => x}
      getOptionLabel={schoolLabel}
      isOptionEqualToValue={(a, b) =>
        a.uai ? a.uai === b.uai : a.name === b.name
      }
      onInputChange={(e, text) => setInput(text)}
      onChange={(e, school) => onChange(school)}
      noOptionsText={
        input.trim().length < 3
          ? 'Tapez au moins 3 lettres'
          : 'Aucun établissement'
      }
      renderOption={(props, option) => (
        <li {...props} key={option.uai || option.name}>
          <Box>
            <Typography variant="body2">
              {option.name}{' '}
              {option.rep && <Chip size="small" label={option.rep} />}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {[option.type, option.zipcode, option.city, option.sector]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label="Établissement"
          placeholder="Nom ou ville"
          helperText={value?.rep ? `Éducation prioritaire : ${value.rep}` : ' '}
        />
      )}
    />
  );
};

export default SchoolField;
