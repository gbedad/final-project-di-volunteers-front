import React, { createContext, useReducer } from 'react';

const initialState = {
  missions: [],
};

export const MissionsContext = createContext();

const missionsReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_MISSION':
      return {
        ...state,
        missions: [...state.missions, action.payload],
      };
    case 'UPDATE_MISSION':
      const updatedMissions = state.missions.map((mission) => {
        if (mission.id === action.payload.id) {
          return action.payload;
        }
        return mission;
      });
      return {
        ...state,
        missions: updatedMissions,
      };
    default:
      return state;
  }
};

export const MissionsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(missionsReducer, initialState);

  return (
    <MissionsContext.Provider value={{ state, dispatch }}>
      {children}
    </MissionsContext.Provider>
  );
};
