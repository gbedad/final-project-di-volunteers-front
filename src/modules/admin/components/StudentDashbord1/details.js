import { useState, useCallback } from 'react';
import axios from 'axios';

const useStudentData = () => {
  const [rows, setRows] = useState([]);

  const getAll = useCallback(() => {
    return axios
      .get('http://localhost:3030/all-students')
      .then((response) => {
        setRows(response.data);
        return response;
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
        throw error;
      });
  }, []);

  const saveRow = useCallback((row) => {
    return new Promise((resolve) => {
      setRows((prevRows) => {
        let newRows;
        if (row.isNew) {
          newRows = [...prevRows, row];
        } else {
          newRows = prevRows.map((r) => (r.id === row.id ? row : r));
        }
        resolve({ data: row });
        return newRows;
      });
    });
  }, []);

  const deleteRow = useCallback((rowId) => {
    return new Promise((resolve) => {
      setRows((prevRows) => {
        const deletedRow = prevRows.find((r) => r.id === rowId);
        const newRows = prevRows.filter((r) => r.id !== rowId);
        resolve({ data: deletedRow });
        return newRows;
      });
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
