import React, { useState, useEffect, useContext } from 'react';
import { MissionsContext } from './MissionsContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/system';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';

import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import '../cards/Card.css';

import GENERIC_IMAGE from '../../assets/hands.jpeg';
import { existingLocations } from '../../options/existingOptions';

// const style = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: 300,
//   bgcolor: 'background.paper',
//   border: '2px solid #000',
//   boxShadow: 24,
//   p: 4,
// };

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

const BASE_URL = process.env.REACT_APP_BASE_URL;

const MissionCard = ({ mission, userLogged }) => {
  const navigate = useNavigate();
  const { dispatch } = useContext(MissionsContext);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [title, setTitle] = useState(mission.title || '');
  const [location, setLocation] = useState(mission.location || '');
  const [description, setDescription] = useState(mission.description || '');
  const [imageData, setImageData] = useState(
    mission.image_data || GENERIC_IMAGE
  );
  const [imageSrc, setImageSrc] = useState(mission.image_data || GENERIC_IMAGE);
  const [isSwitchOn, setIsSwitchOn] = useState(mission.is_active);
  // const userLogged = JSON.parse(localStorage.getItem('user'));

  const handleSwitchToggle = async () => {
    setIsSwitchOn(!isSwitchOn);
    try {
      const response = await axios.patch(
        `${BASE_URL}/missions/update/${mission.id}`,
        { is_active: !isSwitchOn },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedMission = response.data.data;

      handleClose();
      navigate('/all-missions', { state: { userLogged } });
      dispatch({ type: 'UPDATE_MISSION', payload: updatedMission });
    } catch (error) {
      console.error('Error creating mission:', error);
      // Handle error
    }
    // Update the backend API with the new `is_active` value
    // Use the appropriate endpoint and update method to update the specific mission
    // You can make an API call here to update the `is_active` field in the backend
    // Example:
    // axios.patch(`${BASE_URL}/missions/update/${props.id}`, { is_active: !isSwitchOn });
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImageData(selectedImage);
    setImageSrc(URL.createObjectURL(selectedImage));
  };

  useEffect(() => {
    return () => {
      // Clean up the object URL when the component unmounts
      URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newUpdateMission = {
      title,
      location,
      description,
      image: imageData,
      is_active: mission.is_active,
    };

    try {
      const response = await axios.patch(
        `${BASE_URL}/missions/update/${mission.id}`,
        newUpdateMission,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedMission = response.data.data;
      setImageSrc(updatedMission.image_data);
      handleClose();
      navigate('/all-missions', { state: { userLogged } });
      dispatch({ type: 'UPDATE_MISSION', payload: updatedMission });
    } catch (error) {
      console.error('Error creating mission:', error);
      // Handle error
    }
  };

  return (
    <div className="card">
      <img src={imageSrc} alt={title} />
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p className="card-text">{location}</p>
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <FormControlLabel
            control={
              <Switch checked={isSwitchOn} onChange={handleSwitchToggle} />
            }
            label="Activer"
          />
          <Button size="small" onClick={handleOpen}>
            Editer
          </Button>
        </CardActions>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={'md'}
        maxWidth={'lg'}>
        <DialogTitle id="draggable-dialog-title">
          Modifier la mission
        </DialogTitle>

        <CssBaseline />

        {/* <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              type="text"
              label="Titre de la mission"
              required
              fullWidth
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

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
            <FormControl fullWidth>
              <InputLabel id="demo-multiple-checkbox-label">
                Lieu de la mission
              </InputLabel>
              <Textarea
                minRows={10}
                label="Description de la mission"
                placeholder="Description de la mission"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </FormControl>
            <DialogContentText>Modifier l'image.</DialogContentText>
            <input type="file" accept="image/*" onChange={handleImageChange} />
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
        </form> */}
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
                    label="Lieu de la mission">
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
                  <Typography color="gray" fontSize={14}>
                    Description de la mission
                  </Typography>
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
                  onChange={(e) => setImageData(e.target.files[0])}
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
      </Dialog>
    </div>
  );
};

export default MissionCard;
