import React, { useEffect, useState } from 'react';
import {useLocation} from 'react-router-dom';
import axios from 'axios';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox } from '@mui/material';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers';
// import { TimePicker } from '@mui/x-date-pickers/TimePicker';
// import { TimeField } from '@mui/x-date-pickers/TimeField';
// import { TimeClock } from '@mui/x-date-pickers/TimeClock';
import moment from 'moment';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import TimePicker from 'react-time-picker';

import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';


const DaySlotSkill = () => {
    const location = useLocation()
    const [selectedItems, setSelectedItems] = useState([]);
    // const [selectedDate, handleDateChange] = useState(new Date());
    const [selectedStartTime, setSelectedStartTime] = useState(null);
    const [selectedEndTime, setSelectedEndTime] = useState(null);
    const [locale, setLocale] = useState('en')
    const [dayTimeSlot, setDayTimeSlot] = useState(null)
    const [reload, setReload] = useState(false)
    

    console.log(location.state.userLogged.id);
    const BASE_URL = process.env.REACT_APP_BASE_URL;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleStartTimeChange = (newTime) => {
    setSelectedStartTime(newTime);
  };
  
  const handleEndTimeChange = (newTime) => {
    setSelectedEndTime(newTime);
  };
  const getTimeString = (time) => {
    if (!time || !time.$H || !time.$m) {
      return '';
    }
    const hours = time.$H.toString().padStart(2, '0');
    const minutes = time.$m.toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  getTimeString(selectedStartTime);
  getTimeString(selectedEndTime);


  // const handleToggle = (value) => {
  //   const currentIndex = selectedItems.indexOf(value);
  //   const newChecked = [...selectedItems];

  //   if (currentIndex === -1) {
  //     newChecked.push(value);
  //   } else {
  //     newChecked.splice(currentIndex, 1);
  //   }
  //   setSelectedItems(newChecked);
  // };

  const handleToggle = (value) => {
    const currentIndex = selectedItems.findIndex(item => item.day === value);
    const newChecked = [...selectedItems];

    if (currentIndex === -1) {
      newChecked.push({day: value, startTime: getTimeString(selectedStartTime), endTime: getTimeString(selectedEndTime) });
      // newChecked.push(`day: ${value}, startTime: ${getTimeString(selectedStartTime)}, endTime: ${getTimeString(selectedEndTime)}`)
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedItems(newChecked);
  };
    console.log(selectedItems);
    // const parsedData = selectedItems.forEach((element)=> {
    //   JSON.stringify(element)
    // });

    const handleDaysSubmit = async () => {
       const response = await axios.post(`${BASE_URL}/create-skill/${location.state.userLogged.id}`,{
          headers: {
            "Content-Type": "application/json"
          },
          when_day_slot:selectedItems  
      }  
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
      setDayTimeSlot(response.data.skill)
      setReload(false)
    }
  }
  getSkills()
}, [reload, selectedItems])


  return (
    <>
   

      <TimePicker
            sx={{
                border: 'none'
            }}
            nativeInputAriaLabel="Time From"
            maxTime='22:00:00'
            minTime='09:00:00'
            inputVariant="outlined"
            value='10:00'
            onChange={handleStartTimeChange}
           
          /> 
        <TimePicker
            label="Time To"
            inputVariant="outlined"
            value={selectedEndTime}
            onChange={handleEndTimeChange}
            
          />  
      
      <List>
        {days.map((day, index) => (
          <ListItem key={index} dense button onClick={() => handleToggle(day)}>
            <ListItemText primary={day} />
            <ListItemSecondaryAction>
              <Checkbox
                edge="end"
                checked={selectedItems.some(item => item.day === day)}
                onChange={() => handleToggle(day)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {selectedItems.map((day, index) => (
        <div key={index}>
          <div>{day.day} {selectedStartTime ? getTimeString(selectedStartTime) : ''} to {selectedEndTime ? getTimeString(selectedEndTime) : ''}</div>
        </div>
      ))}
      <Button onClick={handleDaysSubmit}>Submit</Button>
   

    <Card sx={{ minWidth: 275, mt:6, p:4}}>
                  <Typography variant="h5" component="div">
                      My Days Slots
                  </Typography>

                {!dayTimeSlot ?
                  <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                  </Box>
                :
                dayTimeSlot.when_day_slot.length !== 0 ? 
 
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      {dayTimeSlot.when_day_slot.map((item, index) => (
                    <p>{JSON.parse(item).day} from {JSON.parse(item).startTime} to {JSON.parse(item).endTime}</p>
                    ))}
                  </Typography>
                :
               
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      You don't yet have inserted data.
                  </Typography>
                        }
                </Card>
    </>
)}

export default DaySlotSkill
