import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import DialogTitle from '@mui/material/DialogTitle';

import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
// import TextareaAutosize from '@mui/material/TextareaAutosize';
import { styled } from '@mui/system';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';

import MapComponent from '../maps/MapComponent';

import { getCenter } from '../../options/locationCentersOptions';

import image from '../../assets/hands.jpeg';

import './Card.css';

// const center = [48.834218481227296, 2.3869057718685927];

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

const MissionCard = (props) => {
  // function isBase64Image(imageString) {
  //   const base64ImagePattern =
  //     /^data:image\/(png|jpeg|jpg|gif|svg\+xml);base64,/;

  //   return base64ImagePattern.test(imageString);
  // }
  // const imageString = `data:${props.image_type};base64,${props.image_data}`; // Example base64 image string

  // if (isBase64Image(imageString)) {
  //   console.log('The string represents a base64-encoded image.');
  // } else {
  //   console.log('The string is not a base64-encoded image.');
  // }

  // const style = {
  //   position: 'absolute',
  //   top: '50%',
  //   left: '50%',
  //   transform: 'translate(-50%, -50%)',
  //   width: 400,
  //   bgcolor: 'background.paper',
  //   border: '2px solid #000',
  //   boxShadow: 24,
  //   p: 4,
  // };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const imageUrl = props.image_data;

  // console.log(imageUrl);

  return (
    <>
      <Card className="card animated-card">
        <img src={imageUrl ? imageUrl : image} alt={props.title} />
        <div className="card-body">
          <CardContent>
            <Typography variant="h5" mb={3} sx={{ fontWeight: 'bold' }}>
              {props.title}
            </Typography>
            {/* <h2 className="card-title">{props.title}</h2> */}
            {/* <p className="card-text">{props.location}</p> */}
            <Typography variant="p">{props.location}</Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'space-between' }}>
            <Button size="small" onClick={handleOpen}>
              En savoir plus
            </Button>
            <Box sx={{ display: !props.token ? 'block' : 'none' }}>
              <Link to="/register" className="card-link" state={props.id}>
                JE POSTULE
              </Link>
            </Box>
          </CardActions>
        </div>

        {/* <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {props.title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {props.description}
          </Typography>
        </Box>
      </Modal> */}
        <Dialog open={open} onClose={handleClose} maxWidth="md">
          <DialogTitle id="draggable-dialog-title">
            Détails de la mission
          </DialogTitle>

          <CssBaseline />

          <DialogContent>
            <TextField
              type="text"
              label="Titre de la mission"
              required
              fullWidth
              margin="normal"
              value={props.title}
              disabled
            />

            <TextField
              type="text"
              label="Lieu de la mission"
              required
              fullWidth
              margin="normal"
              value={props.location}
              disabled
            />

            <Textarea
              value={props.description}
              minRows={10}
              label="Description de la mission"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            {getCenter(props.location) && (
              <MapComponent center={getCenter(props.location)} />
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ mt: 3, mb: 2 }}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  );
};

export default MissionCard;
