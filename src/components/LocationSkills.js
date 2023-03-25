import React, { useEffect, useState } from 'react';
import {useLocation} from 'react-router-dom';
import axios from 'axios';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox } from '@mui/material';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

const LocationSkills = () => {
    const location = useLocation()
    const [selectedItems, setSelectedItems] = useState([]);
    const [whereLocation, setWhereLocation] = useState(null)
    const [reload, setReload] = useState(false)


    console.log(location.state.userLogged.id);

    const locations = ['Maison des Associations', 'Aubervillers', 'Bercy'];

    const handleToggle = (value) => {
        const currentIndex = selectedItems.indexOf(value);
        const newChecked = [...selectedItems];
    
        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        setSelectedItems(newChecked);
      };
        console.log(selectedItems);

        const handleLocationSubmit = async () => {
         const response =   await axios.post(`/create-skill/${location.state.userLogged.id}`, 
                {where_location: selectedItems}
            )
            if (response) {
              setReload(true)
            }
          }

          useEffect(() => {
            const getSkills =  async () => {
              const response = await axios.get(`/user-by-id/${location.state.userLogged.id}`)
              console.log("====>>>", response.data.skill)
              if (response.data.skill) {
                setWhereLocation(response.data.skill)
                setReload(false)
              }
            }
            getSkills()
          }, [selectedItems, reload])
          
        return (
            <>  
              <List>
                {locations.map((location) => (
                  <ListItem key={location} dense button onClick={() => handleToggle(location)}>
                    <ListItemText primary={location} />
                    <ListItemSecondaryAction>
                      <Checkbox
                        edge="end"
                        checked={selectedItems.indexOf(location) !== -1}
                        onChange={() => handleToggle(location)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {selectedItems.map((location) => (
                <div key={location}>
                  <div>{location} </div>
                </div>
              ))}
              <Button onClick={handleLocationSubmit}>Submit</Button>
              <Card sx={{ minWidth: 275, mt:6, p:4}}>
                  <Typography variant="h5" component="div">
                      My Locations
                  </Typography>

                {!whereLocation ?
                  <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                  </Box>
                :
                whereLocation.where_location.length !== 0 ? 
 
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      {whereLocation.where_location.map((item, index) => (
                        <p>{item}</p>
                      ))}
                  </Typography>
                :
               
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      You don't yet have inserted data.
                  </Typography>
                        }
                </Card>
            </>
          );
        };
        
export default LocationSkills