import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

const useLoginUser = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async ({ walletAddress, signature }) => {
      try {
        const response = await axiosInstance.post('/auth/login', { walletAddress, signature });
        return response.data;
      } catch (error) {
        throw error; 
      }
    },
    onSuccess: (data) => {
      login(data.user);
      toast.success('Logged in successfully!');
    },
  });
};

export default useLoginUser;