import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';
import { useWallet } from '@suiet/wallet-kit';

const useLoginUser = () => {
    const wallet = useWallet();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (walletAddress, signature) => {
      const response = await axiosInstance.post('/auth/login', { walletAddress, signature });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.user);
      toast.success('Logged in successfully!');
    },
    onError: (error) => {
      toast.error('Error logging in.');
      if(wallet.connected){
        wallet.disconnect();
    }
      throw error;
    },
  });
};

export default useLoginUser;