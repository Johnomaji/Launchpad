import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

const useRegisterUser = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async ({ walletAddress, signature }) => {
      try {
        const userData = {
          walletAddress,
          username: `user_${walletAddress.slice(0, 8)}`, // Auto-generate a username
          bio: 'Crypto enthusiast',
          signature,
        };
        const response = await axiosInstance.post('/auth/register', userData);
        return response.data;
      } catch (error) {
        toast.error('Error registering user.');
        throw error; 
      }
    },
    onSuccess: (data) => {
      login(data);
      toast.success('User registered successfully!');
    },
  });
};

export default useRegisterUser;