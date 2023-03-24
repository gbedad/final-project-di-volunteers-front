import React, { useEffect, useState } from 'react';
import {useLocation} from 'react-router-dom';
import axios from 'axios';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox } from '@mui/material';
import TextField from '@mui/material/TextField';


const TopicSkills = () => {
    const location = useLocation()
    const [selectedItems, setSelectedItems] = useState([]);


    console.log(location.state.userLogged.id);

    const topics = ['Mathematics', 'Physics', 'French', 'Geography', 'English', 'Natural Sciences'];

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

        const handleTopicsSubmit = async () => {
            await axios.post(`/create-skill/${location.state.userLogged.id}`, 
                {topics: selectedItems}
            )
          }
          
        return (
            <>  
              <List>
                {topics.map((topic) => (
                  <ListItem key={topic} dense button onClick={() => handleToggle(topic)}>
                    <ListItemText primary={topic} />
                    <ListItemSecondaryAction>
                      <Checkbox
                        edge="end"
                        checked={selectedItems.indexOf(topic) !== -1}
                        onChange={() => handleToggle(topic)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {selectedItems.map((topic) => (
                <div key={topic}>
                  <div>{topic} </div>
                </div>
              ))}
              <button onClick={handleTopicsSubmit}>Submit</button>
            </>
          );
        };
        
export default TopicSkills
  
