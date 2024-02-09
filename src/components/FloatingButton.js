import * as React from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';

import FavoriteIcon from '@mui/icons-material/Favorite';
import NavigationIcon from '@mui/icons-material/Navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function FloatingActionButtons(props) {
  const [disableButton, setDisableButton] = React.useState(false);
  const { handleChange } = props;
  const handleFinish = (event) => {
    setDisableButton(true);
    setTimeout(() => {
      handleChange(event, 0);
    }, 2000);
  };
  return (
    <Box sx={{ m: 1 }}>
      <Fab
        variant="extended"
        onClick={handleFinish}
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
    </Box>
  );
}
