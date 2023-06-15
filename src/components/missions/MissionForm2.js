import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { MissionsContext } from './MissionsContext';

import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/base/TextareaAutosize';

import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'react-phone-number-input/style.css';

import { existingLocations } from '../../options/locationOptions';

const BASE_URL = process.env.REACT_APP_BASE_URL;

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const theme = createTheme();

const MissionForm = () => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const { dispatch } = useContext(MissionsContext);

  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('location', location);
    formData.append('description', description);
    formData.append('image', image);

    try {
      const response = await axios.post(
        `${BASE_URL}/missions/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const newMission = response.data.data;
      setTitle('');
      setLocation('');
      setDescription('');
      setImage(null);
      handleClose();
      navigate('/all-missions');
      dispatch({ type: 'ADD_MISSION', payload: newMission });
      // Mission created successfully
      // Reset the form fields
    } catch (error) {
      console.error('Error creating mission:', error);
      // Handle error
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {/* <Button variant="outlined" onClick={handleClickOpen}>
        Créer une mission
      </Button> */}
      <Fab
        color="primary"
        sx={{ position: 'sticky', top: 16, right: 16 }}
        aria-label="add"
        onClick={handleClickOpen}>
        <AddIcon />
      </Fab>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title">
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          Créer la mission
        </DialogTitle>

        {/* <Container component="main" maxWidth="lg"> */}
        <CssBaseline />
        {/* <Box
          sx={{
            marginTop: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}> */}
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              label="Titre de la mission"
              required
              fullWidth
              margin="normal"
            />

            {/* <TextField
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              label="Lieu de la mission"
              required
              fullWidth
              margin="normal"
            /> */}
            <FormControl fullWidth>
              <InputLabel id="demo-multiple-checkbox-label">
                Lieu de la mission
              </InputLabel>
              <Select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                input={<OutlinedInput label="Lieu de la mission" />}
                fullWidth
                label="Lieu de la mission">
                {existingLocations.map((location) => (
                  <MenuItem key={location} value={location} fullWidth>
                    <ListItemText primary={location} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextareaAutosize
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minRows={10}
              label="Description de la mission"
              placeholder="Description de la mission"
              style={{
                width: '100%',
                maxWidth: '100%',
                minWidth: '100%',
                marginTop: 15,
                marginBottom: 15,
              }}
              required
            />

            <DialogContentText>
              Choisir une image ou une photo pour illustrer la mission.
            </DialogContentText>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ mt: 3, mb: 2 }}>
              Annuler
            </Button>
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
              Confirmer
            </Button>
          </DialogActions>
        </form>
        {/* </Box> */}
        {/* </Container> */}
      </Dialog>
    </ThemeProvider>
  );
};

export default MissionForm;
