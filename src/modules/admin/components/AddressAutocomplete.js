import React, { useState } from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';
import axios from 'axios';

const AddressAutocomplete = ({ onAddressSelect }) => {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);

  const handleInputChange = async (event, newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue.length > 2) {
      try {
        const response = await axios.get(
          `https://api-adresse.data.gouv.fr/search/?q=${newInputValue}&limit=5`
        );
        setOptions(response.data.features);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      }
    } else {
      setOptions([]);
    }
  };
  console.log(selectedAddress);

  return (
    <Box sx={{ width: '100%', marginTop: '1rem' }}>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.properties.label}
        filterOptions={(x) => x}
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={selectedAddress}
        onChange={(event, newValue) => {
          onAddressSelect(newValue);
        }}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Chercher une adresse"
            fullWidth
            variant="standard"
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Box>
              {option.properties.label}
              <br />
              <small>{option.properties.context}</small>
            </Box>
          </li>
        )}
      />
      {/* {selectedAddress && (
        <Box mt={2}>
          <h4>Selected Address Details:</h4>
          <p>Label: {selectedAddress.properties.label}</p>
          <p>City: {selectedAddress.properties.city}</p>
          <p>Postcode: {selectedAddress.properties.postcode}</p>
        </Box>
      )} */}
    </Box>
  );
};

export default AddressAutocomplete;
