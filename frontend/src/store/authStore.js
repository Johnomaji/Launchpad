import { create } from 'zustand';
import Cookies from 'js-cookie';

const COOKIE_NAME = 'auth_data';
const COOKIE_EXPIRY = 1; 

// Helper to get initial state from cookie
const getInitialState = () => {
  const cookieData = Cookies.get(COOKIE_NAME);
  if (cookieData) {
    try {
      return JSON.parse(cookieData);
    } catch (e) {
      return { user: null, isAuthenticated: false };
    }
  }
  return { user: null, isAuthenticated: false };
};

const useAuthStore = create((set) => ({
  ...getInitialState(),
  login: (user) => {
    const newState = { user, isAuthenticated: true };
    // Save to cookie
    Cookies.set(COOKIE_NAME, JSON.stringify(newState), { 
      expires: COOKIE_EXPIRY,
      sameSite: 'strict'
    });
    set(newState);
  },
  logout: () => {
    // Remove the cookie
    Cookies.remove(COOKIE_NAME);
    set({ user: null, isAuthenticated: false });
  }
}));

export default useAuthStore;