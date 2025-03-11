import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };
  
  return { logout: handleLogout };
};

export default useLogout;