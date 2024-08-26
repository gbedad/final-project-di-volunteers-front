import { useState, useCallback } from 'react';
import axios from 'axios';

const useStudentData = () => {
  const [rows, setRows] = useState([]);

  const getAll = useCallback(() => {
    return axios
      .get('http://localhost:3030/students')
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
    const url = updatedRow.isNew
      ? 'http://localhost:3030/students'
      : `http://localhost:3030/students/${updatedRow.id}`;
    const method = updatedRow.isNew ? 'post' : 'patch';

    return axios[method](url, updatedRow)
      .then((response) => {
        setRows((currentRows) =>
          updatedRow.isNew
            ? [...currentRows, response.data]
            : currentRows.map((row) =>
                row.id === updatedRow.id ? response.data : row
              )
        );
        return response;
      })
      .catch((error) => {
        console.error('Error saving student:', error);
        throw error;
      });
  }, []);

  const deleteRow = useCallback((id) => {
    return axios
      .delete(`http://localhost:3030/students/${id}`)
      .then((response) => {
        setRows((currentRows) => currentRows.filter((row) => row.id !== id));
        return response;
      })
      .catch((error) => {
        console.error('Error deleting student:', error);
        throw error;
      });
  }, []);

  return {
    rows,
    getAll,
    saveRow,
    deleteRow,
  };
};

export default useStudentData;
