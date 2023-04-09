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

const BASE_URL = process.env.REACT_APP_BASE_URL;
const TopicSkills = () => {
    const location = useLocation()
    const [selectedItems, setSelectedItems] = useState([]);
    const [whichTopics, setWhichTopics] = useState(null)
    const [reload, setReload] = useState(false)


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
          const response =  await axios.post(`${BASE_URL}/create-skill/${location.state.userLogged.id}`, 
                {topics: selectedItems}
            )
            if (response) {
              setReload(true)
            }
          }
          useEffect(() => {
            const getSkills =  async () => {
              const response = await axios.get(`${BASE_URL}/user-by-id/${location.state.userLogged.id}`)
              console.log("====>>>", response.data.skill)
              if (response.data.skill) {
                setWhichTopics(response.data.skill)
                setReload(false)
              }
            }
            getSkills()
          }, [selectedItems, reload])

        return (
            <>  
              <List>
                {topics.map((topic, index) => (
                  <ListItem key={index} dense button onClick={() => handleToggle(topic)}>
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
              {selectedItems.map((topic, index) => (
                <div key={index}>
                  <div>{topic} </div>
                </div>
              ))}
              <Button onClick={handleTopicsSubmit}>Submit</Button>
              <Card sx={{ minWidth: 275, mt:6, p:4}}>
                  <Typography variant="h5" component="div">
                      My Topics
                  </Typography>

                {!whichTopics ?
                  <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                  </Box>
                :
                whichTopics.topics.length !== 0 ? 
 
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      {whichTopics.topics.map((item, index) => (
                        <span>{item}</span>
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
        
export default TopicSkills
  
