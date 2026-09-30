import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import BorderedBoxWithLabel from './borderedBox';

export default function SelectNumberStudents() {
  const [number, setNumber] = React.useState('');

  const handleChange = (event) => {
    setNumber(event.target.value);
  };

  return (
    <BorderedBoxWithLabel label="Enfants ou adolescents à accompagner" sx={{ display: 'flex' }}>
      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        {/* <FormHelperText>Je suis prêt à suivre</FormHelperText> */}
        <InputLabel id="simple-select-helper-label">Nombre</InputLabel>
        <Select
          labelId="simple-select-helper-label"
          id="simple-select-helper"
          value={number}
          label="Number"
          onChange={handleChange}
        >
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={6}>6</MenuItem>
          <MenuItem value={7}>7</MenuItem>
          <MenuItem value={8}>8</MenuItem>
          <MenuItem value={9}>9</MenuItem>
          
        </Select>
        
      </FormControl>
       <Grid item xs={12}>
            <Button
              sx={{ marginTop: '10px' }}
              variant="contained"
              color="primary"
            //   onClick={handleSaveLocationsPossible}
              // disabled={disableSave || !showButton}
            >
              Enregistrer
            </Button>
          </Grid>
    </BorderedBoxWithLabel>
  );
}
