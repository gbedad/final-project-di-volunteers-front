import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { MissionsContext } from './MissionsContext';

import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
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

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'react-phone-number-input/style.css';

import { existingLocations } from '../../options/existingOptions';
import { Typography } from '@mui/material';

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

const Textarea = styled(BaseTextareaAutosize)(
  () => `
    box-sizing: border-box;
    width: 100%;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 2px;
    color:'blue';
    background: '!edit ? transparent : transparent';
    border-width: 1px solid light.main;
    

    &:hover {
      border-color: 'secondary.dark;
    }

    &:focus {
      border-color: 'light';
      
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `
);

const MissionForm = ({ userLogged }) => {
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
      navigate('/all-missions', { state: { userLogged } });
      dispatch({ type: 'ADD_MISSION', payload: newMission });
      // Mission created successfully
      // Reset the form fields
    } catch (error) {
      console.error('Error creating mission:', error);
      // Handle error
    }
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{ position: 'sticky', top: 16, right: 16 }}
        aria-label="add"
        onClick={handleClickOpen}>
        <AddIcon />
      </Fab>
      <Dialog
        fullWidth={'lg'}
        maxWidth={'lg'}
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
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <TextField
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    label="Titre de la mission"
                    required
                    margin="normal"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="demo-multiple-checkbox-label">
                    Lieu de la mission
                  </InputLabel>
                  <Select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    fullWidth
                    required
                    label="Lieu de la missio">
                    {existingLocations.map((location) => (
                      <MenuItem key={location} value={location} fullWidth>
                        <ListItemText primary={location} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Typography color="grey" fontSize={14}>
                    Description de la mission
                  </Typography>
                  {/* <InputLabel id="demo-multiple-checkbox-label">
                    Description de la mission
                  </InputLabel> */}
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    minRows={10}
                    label="Description de la mission"
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <DialogContentText>
                  Choisir une image ou une photo pour illustrer la mission.
                </DialogContentText>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  required
                />
              </Grid>

              <Grid item>
                <DialogActions>
                  <Button
                    variant="outlined"
                    onClick={handleClose}
                    sx={{ mt: 3, mb: 2 }}>
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}>
                    Confirmer
                  </Button>
                </DialogActions>
              </Grid>
            </Grid>
          </DialogContent>
        </form>

        {/* </Box> */}
        {/* </Container> */}
      </Dialog>
    </>
  );
};

export default MissionForm;
