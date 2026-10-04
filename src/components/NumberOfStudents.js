import * as React from 'react';
import axios from 'axios';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import BorderedBoxWithLabel from './borderedBox';
import { useAutoSave } from '../js/useAutoSave';
import SaveStatus from './application/SaveStatus';

export default function SelectNumberStudents({ userId }) {
  const [number, setNumber] = React.useState('');
  const [saveState, scheduleSave] = useAutoSave(userId, 'number_of_students', {
    delay: 0,
  });

  React.useEffect(() => {
    if (!userId) return;
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`)
      .then(({ data }) => setNumber(data.skill?.number_of_students || ''))
      .catch(console.error);
  }, [userId]);

  const handleChange = (event) => {
    setNumber(event.target.value);
    scheduleSave(event.target.value);
  };

  return (
    <BorderedBoxWithLabel
      label="Enfants ou adolescents à accompagner"
      sx={{ display: 'flex' }}>
      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <InputLabel id="simple-select-helper-label">Nombre</InputLabel>
        <Select
          labelId="simple-select-helper-label"
          id="simple-select-helper"
          value={number}
          label="Nombre"
          onChange={handleChange}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <SaveStatus state={saveState} />
    </BorderedBoxWithLabel>
  );
}
