// components/NotFound.js
import React from 'react';
import { Typography, Container } from '@mui/material';

const Error404 = () => {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '5rem',
      }}>
      <Typography variant="h2" color="primary">
        404 - Erreur
      </Typography>
      <Typography variant="body">
        La page que vous demandez n'existe pas ou n'est pas accessible.
      </Typography>
    </Container>
  );
};

export default Error404;
