// SchoolAutocomplete.js
import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Box,
  TextField,
  CircularProgress,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { debounce } from 'lodash';

export const SchoolAutocomplete = () => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const fetchSchools = async (search) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/student-demand/schools`,
        {
          params: { search, page: 1, limit: 20 },
        }
      );
      setOptions(response.data.schools);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchSchools = debounce(fetchSchools, 300);

  useEffect(() => {
    if (inputValue) {
      debouncedFetchSchools(inputValue);
    } else {
      setOptions([]);
    }
  }, [inputValue]);

  return (
    <Box>
      <Autocomplete
        options={options}
        getOptionLabel={(option) =>
          `${option.nom_etablissement}, ${option.nom_commune}`
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Établissement"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(event, newValue) => {
          setSelectedSchool(newValue);
        }}
        loading={loading}
        loadingText="Chargement..."
        noOptionsText="Aucune école trouvée"
      />
      {selectedSchool && (
        <Box mt={2}>
          <Typography variant="subtitle2">
            Identifiant: {selectedSchool.identifiant_de_l_etablissement}
          </Typography>
          <Typography variant="body2">
            Adresse:{' '}
            {`${selectedSchool.adresse_1}, ${selectedSchool.code_postal}` ||
              'Non spécifiée'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
