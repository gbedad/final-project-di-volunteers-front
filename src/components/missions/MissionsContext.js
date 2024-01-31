import React, { createContext, useReducer, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';

const initialState = {
  missions: [],
};

export const MissionsContext = createContext();

const missionsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MISSIONS':
      return {
        ...state,
        missions: action.payload,
      };
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

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const MissionsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(missionsReducer, initialState);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/all-missions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const missions = response.data;

        dispatch({ type: 'SET_MISSIONS', payload: missions });
      } catch (error) {
        console.error('Error fetching missions:', error);
      }
    };

    fetchMissions();
  }, []);

  // console.log(state);

  return (
    <MissionsContext.Provider value={{ missions: state.missions, dispatch }}>
      {children}
    </MissionsContext.Provider>
  );
};
