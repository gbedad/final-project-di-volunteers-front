import React from 'react';
import {Link} from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import './Card.css'; 

const card = (props) => {
    console.log("Mission ID",props);
  return (
    <div className="card">
      <img src={props.image} alt={props.title} />
      <div className="card-body">
        <h2 className="card-title">{props.title}</h2>
        <p className="card-text">{props.description}</p>
        <Link to="/register" className='card-link' state={props.id}>Register</Link>
      </div>
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
export default card;
