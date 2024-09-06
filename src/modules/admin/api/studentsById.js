import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL; // Replace with your actual API base URL

export const fetchStudentById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/students/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(error.response.data.error || 'Failed to fetch student');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      throw new Error('Error setting up the request');
    }
  }
};

export const updateStudentFields = async (studentId, updatedFields) => {
  try {
    // Assuming your API endpoint is something like '/students/:id'
    const response = await axios.patch(
      `${BASE_URL}/students/${studentId}`,
      updatedFields,
      {
        headers: {
          'Content-Type': 'application/json',
          // Add any additional headers here, like authorization if required
        },
      }
    );

    console.log('Student updated successfully:', response.data);
    return response.data; // Return the updated student data
  } catch (error) {
    console.error('Error updating student:', error);
    throw error; // Rethrow the error so it can be handled by the caller
  }
};
