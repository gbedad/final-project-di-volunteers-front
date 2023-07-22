import React, { createContext, useReducer, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';

const initialState = {
  courses: [
    // {
    //   courseId: '',
    //   subject: '',
    //   classe: '',
    //   tutor: '',
    //   student: '',
    //   day: '',
    //   timeStart: '',
    //   timeEnd: '',
    //   room: '',
    //   location: '',
    //   instances: [],
    // },
  ],
};

export const CourseContext = createContext();

export const useValue = () => {
  return useContext(CourseContext);
};

const courseReducer = (state, action) => {
  switch (action.type) {
    case 'SET_COURSES':
      return {
        ...state,
        courses: action.payload,
      };
    case 'ADD_COURSE':
      return {
        ...state,
        courses: [...state.courses, action.payload],
      };
    // case 'UPDATE_COURSE':
    //   const updatedCourses = state.courses.map((course) => {
    //     if (course.id === action.payload.id) {
    //       return action.payload;
    //     }
    //     return course;
    //   });
    //   return {
    //     ...state,
    //     courses: updatedCourses,
    //   };
    case 'UPDATE_COURSE':
      const updatedCourses = state.courses.map((course) => {
        if (course.id === action.payload.id) {
          return action.payload;
        }
        return course;
      });
      return {
        ...state,
        courses: updatedCourses,
      };

    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter((course) => course.id !== action.payload),
      };
    case 'ADD_INSTANCES':
      const updatedWithInstancesCourses = state.courses.map((course) => {
        if (course.id === action.payload.id) {
          return action.payload;
        }
        return course;
      });
      return {
        ...state,
        courses: updatedWithInstancesCourses,
      };
    default:
      return state;
  }
};

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const CourseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/allcourses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const courses = response.data;

        dispatch({ type: 'SET_COURSES', payload: courses });
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  console.log(state);

  return (
    <CourseContext.Provider value={{ courses: state.courses, dispatch }}>
      {children}
    </CourseContext.Provider>
  );
};
