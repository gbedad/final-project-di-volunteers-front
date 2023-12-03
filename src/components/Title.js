import * as React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { cyan } from '@mui/material/colors';

const breakpoints = {
  values: {
    xs: 340,
    sm: 640, // Phone
    md: 768, // Tablet/Laptop
    lg: 1500, // Desktop
    xl: 2000,
  },
};

const title_theme = createTheme({
  palette: {
    primary: { main: cyan[800] },
  },
  breakpoints,
  typography: {
    h2: {
      fontSize: '1.2rem',
      [`@media screen and (max-width: ${breakpoints.values.lg}px)`]: {
        fontSize: '1rem',
      },
      [`@media screen and (max-width: ${breakpoints.values.md}px)`]: {
        fontSize: '0.6rem',
      },
    },
  },
});
function Title(props) {
  return (
    <ThemeProvider theme={title_theme}>
      <Typography component="h2" variant="h2" color="primary" gutterBottom>
        {props.children}
      </Typography>
    </ThemeProvider>
  );
}

Title.propTypes = {
  children: PropTypes.node,
};

export default Title;
