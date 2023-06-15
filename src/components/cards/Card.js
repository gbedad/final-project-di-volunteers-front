import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';

import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/base/TextareaAutosize';

import image from '../../assets/hands.jpeg';

import './Card.css';

const MissionCard = (props) => {
  function isBase64Image(imageString) {
    const base64ImagePattern =
      /^data:image\/(png|jpeg|jpg|gif|svg\+xml);base64,/;

    return base64ImagePattern.test(imageString);
  }
  const imageString = `data:${props.image_type};base64,${props.image_data}`; // Example base64 image string

  if (isBase64Image(imageString)) {
    console.log('The string represents a base64-encoded image.');
  } else {
    console.log('The string is not a base64-encoded image.');
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const imageUrl = props.image_data;

  return (
    <div className="card">
      <img src={imageUrl ? imageUrl : image} alt={props.title} />
      <div className="card-body">
        <h2 className="card-title">{props.title}</h2>
        <p className="card-text">{props.location}</p>
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Button size="small" onClick={handleOpen}>
            En savoir plus
          </Button>
          <Link to="/register" className="card-link" state={props.id}>
            Register
          </Link>
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
      <Dialog open={open} onClose={handleClose}>
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

          <TextareaAutosize
            minRows={10}
            label="Description de la mission"
            placeholder="Description de la mission"
            value={props.description}
            disabled
            style={{
              width: '100%',
              maxWidth: '100%',
              minWidth: '100%',
              marginTop: 15,
              marginBottom: 15,
              fontFamily: 'roboto',
              fontSize: 16,
            }}
            required
          />
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
    </div>
    //     <React.Fragment>
    //     <CardContent>
    //       <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
    //         Word of the Day
    //       </Typography>
    //       <Typography variant="h5" component="div">
    //         benevolent
    //       </Typography>
    //       <Typography sx={{ mb: 1.5 }} color="text.secondary">
    //         adjective
    //       </Typography>
    //       <Typography variant="body2">
    //         well meaning and kindly.
    //         <br />
    //         {'"a benevolent smile"'}
    //       </Typography>
    //     </CardContent>
    //     <CardActions>
    //       <Button size="small">Learn More</Button>
    //     </CardActions>
    //   </React.Fragment>
  );
};

// export default function OutlinedCard() {
//     return (
//       <Box sx={{ minWidth: 275 }}>
//         <Card variant="outlined">{card}</Card>
//       </Box>
//     );
//   }
export default MissionCard;
