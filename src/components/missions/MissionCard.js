import React, { useState, useEffect, useContext } from 'react';
import { MissionsContext } from './MissionsContext';
import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';

import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/base/TextareaAutosize';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import image from '../../assets/hands.jpeg';

import '../cards/Card.css';
import MissionForm from './MissionForm2';

import GENERIC_IMAGE from '../../assets/hands.jpeg';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const BASE_URL = process.env.REACT_APP_BASE_URL;

const MissionCard = ({ mission }) => {
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
      navigate('/all-missions');
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
      navigate('/all-missions');
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

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="draggable-dialog-title">
          Modifier la mission
        </DialogTitle>

        <CssBaseline />

        <form onSubmit={handleSubmit}>
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

            <TextField
              type="text"
              label="Lieu de la mission"
              required
              fullWidth
              margin="normal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <TextareaAutosize
              minRows={10}
              label="Description de la mission"
              placeholder="Description de la mission"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '100%',
                minWidth: '100%',
                marginTop: 15,
                marginBottom: 15,
              }}
              required
            />

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
        </form>
      </Dialog>
    </div>
  );
};

export default MissionCard;
