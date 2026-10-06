import React, { useEffect, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';

// French national address service (IGN Géoplateforme, successor of the
// Base Adresse Nationale): free, no key, allowed from the browser
const SEARCH_URL = 'https://data.geopf.fr/geocodage/search';

const searchAddresses = async (query, signal) => {
  const params = new URLSearchParams({
    q: query,
    autocomplete: '1',
    limit: '6',
    index: 'address',
  });
  const response = await fetch(`${SEARCH_URL}?${params}`, { signal });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.features || []).map((f) => ({
    label: f.properties.label,
    street: f.properties.name,
    zipcode: f.properties.postcode,
    city: f.properties.city,
    context: f.properties.context,
  }));
};

// Address of a volunteer: type and pick a suggestion to fill the street,
// postcode and city; every field stays editable (e.g. an address abroad).
// value: { street, zipcode, city, country }; onChange(fields) receives only
// the fields that changed.
const AddressField = ({ value, onChange }) => {
  const [input, setInput] = useState(value.street || '');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const request = useRef(null);

  // Show the saved street once the profile is loaded
  useEffect(() => {
    setInput(value.street || '');
  }, [value.street]);

  useEffect(() => {
    const query = input.trim();
    if (query.length < 3 || query === (value.street || '')) {
      setOptions([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      request.current?.abort();
      request.current = new AbortController();
      setLoading(true);
      try {
        setOptions(await searchAddresses(query, request.current.signal));
      } catch (err) {
        if (err.name !== 'AbortError') setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [input, value.street]);

  const field = (name, label, props = {}) => (
    <TextField
      size="small"
      label={label}
      value={value[name] || ''}
      onChange={(e) => onChange({ [name]: e.target.value })}
      InputLabelProps={{ shrink: true }}
      {...props}
    />
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Autocomplete
        freeSolo
        filterOptions={(x) => x}
        options={options}
        loading={loading}
        inputValue={input}
        onInputChange={(event, text, reason) => {
          if (reason === 'reset') return;
          setInput(text);
        }}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.street
        }
        onChange={(event, option) => {
          if (!option || typeof option === 'string') return;
          setInput(option.street);
          onChange({
            street: option.street,
            zipcode: option.zipcode,
            city: option.city,
            country: 'France',
          });
        }}
        // A street typed without picking a suggestion is kept as it is
        onBlur={() => {
          if (input !== (value.street || '')) onChange({ street: input });
        }}
        renderOption={(props, option) => (
          <li {...props} key={option.label}>
            <PlaceIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2">{option.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.context}
              </Typography>
            </Box>
          </li>
        )}
        noOptionsText="Aucune adresse trouvée"
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Adresse"
            placeholder="Ex. : 22 rue Gabriel Lamé, Paris"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={16} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        {field('zipcode', 'Code postal', { sx: { width: 120 } })}
        {field('city', 'Ville', { sx: { flex: 1 } })}
        {field('country', 'Pays', { sx: { width: 120 } })}
      </Stack>
    </Box>
  );
};

export default AddressField;
