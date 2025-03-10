import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

const useRegisterUser = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (walletAddress, signature) => {
      const userData = {
        walletAddress,
        signature,
        username: `user_${walletAddress.slice(0, 8)}`, // Auto-generate a username
        bio: 'Crypto enthusiast',
      };
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      login(data);
      toast.success('User registered successfully!');
    },
    onError: (error) => {
      toast.error('Error registering user.');
      throw error; // Propagate the error to handle it in useAuthFlow
    },
  });
};

export default useRegisterUser;