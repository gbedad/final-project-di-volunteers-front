import React, { useState } from 'react';
import { format, parseISO, startOfDay, endOfDay, isSameDay } from 'date-fns';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import UpdateCourseForm from './UpdateCourseForm';
import CreateInstanceForm from './CreateCourseInstance';

// Mock data for course list
const courses = [
  {
    tutor: 'Tutor 1',
    student: 'Student 1',
    location: 'Location 1',
    room: 'Room 1',
    subject: 'Math',
    datetime: '2023-06-17T09:00',
  },
  {
    tutor: 'Tutor 2',
    student: 'Student 2',
    location: 'Location 1',
    room: 'Room 1',
    subject: 'Math',
    datetime: '2023-06-18T09:00',
  },
  {
    tutor: 'Tutor 2',
    student: 'Student 2',
    location: 'Location 1',
    room: 'Room 1',
    subject: 'Math',
    datetime: '2023-06-17T09:00',
  },
  // Add more course objects here
];

const CourseList = () => {
  const [courses, setCourses] = useState([]);

  const handleCourseCreate = (course) => {
    setCourses((prevCourses) => [...prevCourses, course]);
  };

  const handleCourseUpdate = (courseId, instanceId, room, datetime) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id === courseId) {
          const updatedInstances = course.instances.map((instance) => {
            if (instance.id === instanceId) {
              return {
                ...instance,
                room,
                datetime,
              };
            }
            return instance;
          });
          return {
            ...course,
            instances: updatedInstances,
          };
        }
        return course;
      })
    );
  };

  const handleInstanceCreate = (courseId, room, datetime) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id === courseId) {
          const newInstance = {
            id: Date.now(), // Generate unique ID for the instance
            room,
            datetime,
          };
          return {
            ...course,
            instances: [...course.instances, newInstance],
          };
        }
        return course;
      })
    );
  };

  return (
    <div>
      <h2>All Courses</h2>
      {courses.map((course) => (
        <div key={course.id}>
          <h3>{course.subject}</h3>
          <p>Tutor: {course.tutor}</p>
          <p>Student: {course.student}</p>
          <p>Location: {course.location}</p>
          {course.instances.map((instance) => (
            <div key={instance.id}>
              {instance.room && <p>Room: {instance.room}</p>}
              {instance.datetime && <p>Date and Time: {instance.datetime}</p>}
              <UpdateCourseForm
                instance={instance}
                onUpdate={(roomId, datetime) =>
                  handleCourseUpdate(course.id, instance.id, roomId, datetime)
                }
              />
            </div>
          ))}
          <CreateInstanceForm
            courseId={course.id}
            onInstanceCreate={(roomId, datetime) =>
              handleInstanceCreate(course.id, roomId, datetime)
            }
          />
        </div>
      ))}
    </div>
  );
};

export default CourseList;
