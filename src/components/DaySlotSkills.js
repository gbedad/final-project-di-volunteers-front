import React, { useEffect, useState } from 'react';
import {useLocation} from 'react-router-dom';
import axios from 'axios';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox } from '@mui/material';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import moment from 'moment';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';



const DaySlotSkill = () => {
    const location = useLocation()
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedDate, handleDateChange] = useState();
    const [selectedStartTime, setSelectedStartTime] = useState(null);
    const [selectedEndTime, setSelectedEndTime] = useState(null);
    const [locale, setLocale] = useState('en')
    const [dayTimeSlot, setDayTimeSlot] = useState([])
    

    console.log(location.state.userLogged.id);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleStartTimeChange = (newTime) => {
    setSelectedStartTime(newTime);
  };
  
  const handleEndTimeChange = (newTime) => {
    setSelectedEndTime(newTime);
  };
  const getTimeString = (time) => {
    if (!time) {
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
    const parsedData = selectedItems.forEach((element)=> {
      JSON.stringify(element)
    });
    console.log(parsedData)
    const handleDaysSubmit = async () => {
       const response = await axios.post(`/create-skill/${location.state.userLogged.id}`,{
          // headers: {
          //   "Content-Type": "application/json"
          // },

          when_day_slot:selectedItems
      }
  )
        
        
      }
useEffect(() => {

  const getSkills =  async () => {
    const response = await axios.get(`/user-by-id/${location.state.userLogged.id}`)
    console.log("====>>>", response.data.skill)
    if (response.data.skill) {
      setDayTimeSlot(response.data.skill)
    }
  }
  getSkills()
}, [])
  return (
    <>
    <LocalizationProvider dateAdapter={AdapterDayjs} >

      <TimePicker
            label="Time From"
            ampm={false}
            value={selectedStartTime}
            onChange={handleStartTimeChange}
            renderInput={(params) => <TextField {...params} />}
          /> 
        <TimePicker
            label="Time To"
            ampm={false}
            value={selectedEndTime}
            onChange={handleEndTimeChange}
            renderInput={(params) => <TextField {...params} />}
          />  
      
      <List>
        {days.map((day) => (
          <ListItem key={day} dense button onClick={() => handleToggle(day)}>
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
      {selectedItems.map((day) => (
        <div key={day}>
          <div>{day.day} {selectedStartTime ? getTimeString(selectedStartTime) : ''} to {selectedEndTime ? getTimeString(selectedEndTime) : ''}</div>
        </div>
      ))}
      <Button onClick={handleDaysSubmit}>Submit</Button>
    </LocalizationProvider>


  {dayTimeSlot.length !== 0 ? 
  <Card sx={{ minWidth: 275, mt:6, p:4}}>
    <Typography variant="h5" component="div">
         My Days Slots 
    </Typography>
    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {dayTimeSlot.when_day_slot.map((item, index) => (
          <p>{JSON.parse(item).day} from {JSON.parse(item).startTime} to {JSON.parse(item).endTime}</p>
        ))}
    </Typography>
  </Card> :
  
      <></>
}

    </>
  
)}

export default DaySlotSkill
