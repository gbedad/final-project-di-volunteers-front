import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import jwtDecode from 'jsonwebtoken';

const useJwtExpiration = () => {
  const navigate = useNavigate();
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Function to check JWT expiration
    const checkJwtExpiration = async () => {
      try {
        // Retrieve JWT from local storage or state management (replace with your logic)
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
          // No token found, consider redirecting to login immediately
          setIsExpired(true);
          return;
        }

        // Decode the JWT token to extract expiration time
        const decodedToken = await jwtDecode(jwtToken); // Replace with your JWT decoding logic
        const expirationTime = decodedToken.exp * 1000; // Convert seconds to milliseconds

        // Check if current time is past expiration
        const now = Date.now();
        if (now >= expirationTime) {
          setIsExpired(true);
        }
      } catch (error) {
        console.error('Error checking JWT expiration:', error);
        // Handle potential errors during token retrieval or decoding
      }
    };

    checkJwtExpiration();

    // Optional: Set up a periodic check for expiration (if needed)
    const intervalId = setInterval(checkJwtExpiration, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId); // Clear interval on unmount
    };
  }, []); // Empty dependency array to run only once upon component mount

  useEffect(() => {
    if (isExpired) {
      navigate('/login'); // Replace with your login route
    }
  }, [isExpired, navigate]); // Trigger navigation on isExpired change

  return isExpired;
};

export default useJwtExpiration;
