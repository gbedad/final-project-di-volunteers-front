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

const BASE_URL = process.env.REACT_APP_BASE_URL;
let refreshing = null;

// Gets a new access token with the refresh token kept at login, and stores
// it (also in the saved session). Returns the token, or null when the
// session can't be renewed. Calls made at the same time share one request.
export const refreshSession = () => {
  if (!refreshing) {
    refreshing = (async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;
      try {
        const response = await fetch(`${BASE_URL}/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!response.ok) return null;
        const { accessToken } = await response.json();
        if (!accessToken) return null;
        localStorage.setItem('token', accessToken);
        try {
          const saved = JSON.parse(localStorage.getItem('user'));
          if (saved) {
            localStorage.setItem(
              'user',
              JSON.stringify({ ...saved, token: accessToken })
            );
          }
        } catch {}
        return accessToken;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
};
