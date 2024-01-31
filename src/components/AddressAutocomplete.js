import React from 'react';
// import axios from 'axios';
import { AddressAutofill } from '@mapbox/search-js-react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// import AccordionActions from '@mui/material/AccordionActions';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import Chip from '@mui/material/Chip';
// import Button from '@mui/material/Button';
// import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
// import Container from '@mui/material/Container';
// import Snackbar from '@mui/material/Snackbar';
// import MuiAlert from '@mui/material/Alert';
// import Alert from '@mui/material/Alert';

import Stack from '@mui/material/Stack';

// const BASE_URL = process.env.REACT_APP_BASE_URL;

const AddressAutocomplete = (props) => {
  // const { userId, street, city, zipcode, country } = props;
  const {
    street,
    country,
    city,
    zipcode,
    onStreetChange,
    onCityChange,
    onZipcodeChange,
    onCountryChange,
    editing,
  } = props;
  // const [streetSelected, setStreetSelected] = React.useState('');
  // const [citySelected, setCitySelected] = React.useState('');
  // const [zipcodeSelected, setZipcodeSelected] = React.useState('');
  // const [countrySelected, setCountrySelected] = React.useState('');
  // const [addressSaved, setAddressSaved] = React.useState(false);
  // console.log(street);
  // const [open, setOpen] = useState(false);
  // const [openAlert, setOpenAlert] = useState(false);

  // const handleSubmit = async () => {
  //   try {
  //     const response = await axios.post(`${BASE_URL}/update-address`, {
  //       userId,
  //       streetSelected,
  //       citySelected,
  //       zipcodeSelected,
  //       countrySelected,
  //     });
  //     console.log(response.data.message);
  //     if (response.status === 200) {
  //       setAddressSaved(true);
  //       setOpenAlert(true);
  //     } else {
  //       console.log('Error uploading file:', response.status);
  //     }
  //     // Perform any desired actions after successful submission
  //   } catch (error) {
  //     console.error(error);
  //     // Handle any errors
  //   }
  // };

  // const handleAlertClose = (event, reason) => {
  //   if (reason === 'clickaway') {
  //     return;
  //   }

  //   setOpenAlert(false);
  // };

  // const getUserById = async () => {
  //   try {
  //     const response = await axios.get(`${BASE_URL}/user-by-id/${userId}`);
  //     if (response.data) {
  //       const user = response.data;
  //       setStreetSelected(user.street);
  //       setCitySelected(user.city);
  //       setZipcodeSelected(user.zipcode);
  //       setCountrySelected(user.country);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   getUserById();
  // }, []);

  // function resetForm() {
  //   setStreetSelected('');
  //   setCitySelected('');
  //   setZipcodeSelected('');
  //   setCountrySelected('');
  // }

  return (
    <div>
      <Accordion disabled={!editing} defaultExpanded={true}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1c-content"
          id="panel1c-header">
          <Typography>Adresse</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <form>
            <AddressAutofill
              accessToken="pk.eyJ1IjoiZ2JlZGFkIiwiYSI6ImNsaTlyc3VzYTFicmgza2x1ODFndHc2eHoifQ.7FiDsQwHvL3qR-Bqdngb4g"
              popoverOptions={{
                placement: 'top-start',
                flip: true,
                offset: 5,
              }}>
              <TextField
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                color="secondary"
                label="Voie"
                placeholder="Commencer à indiquer le nom de votre voie..."
                name="address"
                autoComplete="address-line1"
                value={street || ''}
                onChange={onStreetChange}
                fullWidth
                required
                sx={{ marginBottom: 4 }}
              />
            </AddressAutofill>
            <TextField
              InputLabelProps={{ shrink: true }}
              type="text"
              variant="outlined"
              color="secondary"
              label="Ville"
              name="city"
              autoComplete="address-level2"
              value={city}
              onChange={onCityChange}
              fullWidth
            />
            <Stack
              spacing={2}
              direction="row"
              sx={{ marginBottom: 4, marginTop: 4 }}>
              <TextField
                InputLabelProps={{ shrink: true }}
                type="text"
                variant="outlined"
                color="secondary"
                label="Code postal"
                name="postcode"
                autoComplete="postal-code"
                value={zipcode}
                onChange={onZipcodeChange}
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                type="text"
                variant="outlined"
                color="secondary"
                label="Pays"
                name="country"
                autoComplete="country-name"
                value={country}
                onChange={onCountryChange}
              />
            </Stack>
          </form>
        </AccordionDetails>
      </Accordion>
      {/* {addressSaved && (
        <Snackbar
          open={openAlert}
          autoHideDuration={3000}
          onClose={handleAlertClose}>
          <Alert
            onClose={handleAlertClose}
            severity="success"
            sx={{ width: '100%' }}>
            Address saved!
          </Alert>
        </Snackbar>
      )} */}
    </div>
  );
};

export default AddressAutocomplete;
