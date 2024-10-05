import { useState, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const excludeColumns = (data, columnsToExclude) => {
  const newData = { ...data };
  columnsToExclude.forEach((column) => {
    delete newData[column];
  });
  return newData;
};

const useStudentData = () => {
  const [rows, setRows] = useState([]);

  const getAll = useCallback(() => {
    return axios
      .get(`${BASE_URL}/students`)
      .then((response) => {
        setRows(response.data);
        return response;
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
        throw error;
      });
  }, []);

  const saveRow = useCallback((updatedRow) => {
    console.log('Updating row:', updatedRow);

    const url = updatedRow.isNew
      ? `${BASE_URL}/students`
      : `${BASE_URL}/students/${updatedRow.id}`;
    const method = updatedRow.isNew ? 'post' : 'patch';

    // Specify columns to exclude
    const columnsToExclude = [
      'interview',
      'pre_interview',
      'no',
      'isNew',
      'id',
    ];

    // Remove specified columns and any properties that might be causing issues
    const dataToSend = excludeColumns(updatedRow, columnsToExclude);

    // Remove any properties that might be causing issues
    // const { isNew, ...dataToSend } = updatedRow;

    console.log('Sending data:', dataToSend);
    console.log('URL:', url);
    console.log('Method:', method);

    return axios[method](url, dataToSend, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        console.log('Server response:', response.data);

        setRows((currentRows) => {
          const safeCurrentRows = Array.isArray(currentRows) ? currentRows : [];
          if (updatedRow.isNew) {
            return [...safeCurrentRows, response.data];
          } else {
            return safeCurrentRows.map((row) =>
              row.id === updatedRow.id ? response.data : row
            );
          }
        });
        return response;
      })
      .catch((error) => {
        console.error('Error saving student:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }
        throw error;
      });
  }, []);

  const deleteRow = useCallback((id) => {
    return axios
      .delete(`${BASE_URL}/students/${id}`)
      .then((response) => {
        setRows((currentRows) => currentRows.filter((row) => row.id !== id));
        return response;
      })
      .catch((error) => {
        console.error('Error deleting student:', error);
        throw error;
      });
  }, [setRows]); // Add setRows to the dependency array
  

  return {
    rows,
    getAll,
    saveRow,
    deleteRow,
  };
};

export default useStudentData;
