import * as React from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';

import FavoriteIcon from '@mui/icons-material/Favorite';
import NavigationIcon from '@mui/icons-material/Navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FloatingActionButtons(props) {
  const [disableButton, setDisableButton] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { handleChange } = props;
  const handleFinish = (event) => {
    setDisableButton(true);
    // return (
    //   <Box
    //     sx={{ width: '100%', position: 'absolute', top: '200px', zIndex: 2 }}>
    //     <Alert
    //       severity="warning"
    //       onClose={() => {
    //         handleChange(event, 0);
    //       }}>
    //       This Alert displays the default close icon.
    //     </Alert>
    //   </Box>
    // );
    setTimeout(() => {
      handleChange(event, 0);
    }, 700);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Box sx={{ m: 1 }}>
      <Fab
        variant="extended"
        onClick={handleClickOpen}
        disabled={disableButton}
        color="primary">
        {!disableButton ? (
          <NavigationIcon sx={{ mr: 1 }} />
        ) : (
          <CheckCircleIcon sx={{ nmr: 1 }} />
        )}
        J'ai terminé
      </Fab>
      {/* <Fab disabled aria-label="like">
        <FavoriteIcon />
      </Fab> */}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description">
        <DialogTitle>{'Informations renseignées ?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            J'ai terminé la saisie des informations demandées sur cette page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Non</Button>
          <Button onClick={handleFinish}>Oui</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
