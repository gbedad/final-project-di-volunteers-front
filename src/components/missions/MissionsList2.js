import React, { useContext } from 'react';
import { MissionsContext } from './MissionsContext';

const MissionList = () => {
  const { state } = useContext(MissionsContext);
  const { missions } = state;

  return (
    <div>
      {missions.map((mission) => (
        <div key={mission.id}>
          <h3>{mission.title}</h3>
          <p>{mission.location}</p>
          <p>{mission.description}</p>
          {mission.image && <img src={mission.image} alt="Mission" />}
        </div>
      ))}
    </div>
  );
};

export default MissionList;
