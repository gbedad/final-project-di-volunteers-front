import { jwtDecode } from 'jwt-decode';

// Checks if the token has expired
export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);

    const currentTime = Date.now() / 1000; // convert milliseconds to seconds
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // Assume token is invalid if there is an error decoding
  }
};
