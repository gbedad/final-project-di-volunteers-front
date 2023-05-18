import React, { useState } from 'react';
import TextField from '@mui/material//TextField';
import TextareaAutosize from '@mui/material//TextareaAutosize';
import Switch from '@mui/material//Switch';
import Button from '@mui/material//Button';
import Select from '@mui/material//Select';
import MenuItem from '@mui/material//MenuItem';
import axios from 'axios';

const MissionForm = ({ mission, onSubmit }) => {
  const [title, setTitle] = useState(mission.title);
  const [description, setDescription] = useState(mission.description);
  const [location, setLocation] = useState(mission.location);
  const [isActive, setIsActive] = useState(mission.is_active);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const handleIsActiveChange = (event) => {
    setIsActive(event.target.checked);
  };

  const handleSubmit = async () => {
    try {
      const updatedMission = {
        id: mission.id,
        title,
        description,
        location,
        is_active: isActive,
      };

      // Make PUT or PATCH request to update mission
      await axios.put(`/missions/update`, updatedMission);

      // Call onSubmit with updated mission data
      onSubmit(updatedMission);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form>
      <TextField
        label="Title"
        value={title}
        onChange={handleTitleChange}
      />
      <TextareaAutosize
        label="Description"
        value={description}
        onChange={handleDescriptionChange}
        rows={4}
        placeholder="Description"
      />
      <Select
        label="Location"
        value={location}
        onChange={handleLocationChange}
      >
        <MenuItem value="MDA">MDA</MenuItem>
        <MenuItem value="Location2">Location 2</MenuItem>
        <MenuItem value="ParisAnim">ParisAnim</MenuItem>
      </Select>
      <Switch
        checked={isActive}
        onChange={handleIsActiveChange}
        color="primary"
        label="Is Active"
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Save
      </Button>
    </form>
  );
};

export default MissionForm;
