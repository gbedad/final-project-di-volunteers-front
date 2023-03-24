import React, { useEffect, useState } from 'react';
import {useLocation} from 'react-router-dom';
import axios from 'axios';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox } from '@mui/material';
import TextField from '@mui/material/TextField';


const LocationSkills = () => {
    const location = useLocation()
    const [selectedItems, setSelectedItems] = useState([]);


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
            await axios.post(`/create-skill/${location.state.userLogged.id}`, 
                {where_location: selectedItems}
            )
          }
          
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
              <button onClick={handleLocationSubmit}>Submit</button>
            </>
          );
        };
        
export default LocationSkills