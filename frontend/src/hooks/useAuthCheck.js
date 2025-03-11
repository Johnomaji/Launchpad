// useAuthCheck.js
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import Cookies from 'js-cookie';

const useAuthCheck = () => {
  const { isAuthenticated, user, login, logout } = useAuthStore();
  
  useEffect(() => {
    const cookieData = Cookies.get('auth_data');
    
    if (cookieData) {
      try {
        const authData = JSON.parse(cookieData);
        // If cookie exists but store isn't authenticated, update store
        if (!isAuthenticated && authData.isAuthenticated) {
          login(authData.user);
        }
      } catch (e) {
        // Invalid cookie data
        logout();
      }
    } else if (isAuthenticated) {
      // Cookie is gone but store thinks we're authenticated
      logout();
    }
  }, [isAuthenticated, login, logout]);
  
  return { isAuthenticated, user };
};

export default useAuthCheck;