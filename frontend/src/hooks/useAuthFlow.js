import useLoginUser from './useLoginUser';
import useRegisterUser from './useRegisterUser';
import { toast } from 'react-toastify';

const useAuthFlow = () => {
  const { mutate: loginUser } = useLoginUser();
  const { mutate: registerUser } = useRegisterUser();

  const handleAuth = async (walletAddress, signature) => {
    if (!walletAddress) {
      toast.error('Wallet address is missing.');
      return;
    }

    try {
      // Try to log in the user
      await loginUser(walletAddress, signature);
    } catch (error) {
      if (error.response?.status === 404) {
        // If the user is not found, register them
        await registerUser(walletAddress, signature);
      } else {
        toast.error('Authentication failed.');
        console.error('Error during authentication:', error);
      }
    }
  };

  return { handleAuth };
};

export default useAuthFlow;