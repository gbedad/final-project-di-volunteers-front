import React, { useState, useEffect } from 'react';
import MissionForm from './MissionForm';
import axios from 'axios';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);

  // Fetch missions data from API on component mount
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/missions`);
        setMissions(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMissions();
  }, []);

  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
  };

  const handleMissionSubmit = (updatedMission) => {
    // Update selected mission in the missions state
    setMissions((prevMissions) =>
      prevMissions.map((mission) =>
        mission.id === updatedMission.id ? updatedMission : mission
      )
    );

    // Reset selected mission state
    setSelectedMission(null);
  };

  return (
    <div>
      
      <Typography variant="h5">Mission List</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {missions.map((mission) => (
              <TableRow
                key={mission.id}
                onClick={() => handleMissionSelect(mission)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{mission.id}</TableCell>
                <TableCell>{mission.title}</TableCell>
                <TableCell>{mission.description}</TableCell>
                <TableCell>{mission.location}</TableCell>
                <TableCell>{mission.is_active ? 'Active' : 'Inactive'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedMission && (
        <MissionForm mission={selectedMission} onSubmit={handleMissionSubmit} />
      )}
    </div>
  );
};

export default MissionList;
