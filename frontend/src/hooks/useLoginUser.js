import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

const useLoginUser = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (walletAddress) => {
      const response = await axiosInstance.post('/auth/login', { walletAddress });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.user);
      toast.success('Logged in successfully!');
    },
    onError: (error) => {
      toast.error('Error logging in.');
      throw error; // Propagate the error to handle it in useAuthFlow
    },
  });
};

export default useLoginUser;