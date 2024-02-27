import React from 'react';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#c8f5e9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #7b1fa2',
  },
}));

const AdminRefreshButton = ({ getAllUsers }) => {
  const handleRefresh = () => {
    // Call the getUser function when the button is clicked
    // console.log('Clicked');

    getAllUsers();
  };

  return (
    <HtmlTooltip
      title={
        <React.Fragment>
          <Typography color="secondary.dark" fontSize={13}>
            Veuillez cliquer ici pour rafraîchir la page.
          </Typography>
        </React.Fragment>
      }>
      <IconButton color="primary" onClick={handleRefresh}>
        <RefreshIcon />
      </IconButton>
    </HtmlTooltip>
  );
};

export default AdminRefreshButton;
