import { useWallet } from "@suiet/wallet-kit";
import useLoginUser from "./useLoginUser";
import useRegisterUser from "./useRegisterUser";
import { toast } from "react-toastify";

const useAuthFlow = () => {
  const wallet = useWallet();
  const { mutateAsync: loginUser } = useLoginUser();
  const { mutateAsync: registerUser } = useRegisterUser();

  const handleAuth = async (walletAddress, signature) => {
    if (!walletAddress) {
      toast.error("Wallet address is missing.");
      return;
    }

    try {
      // Try to log in the user
      await loginUser({ walletAddress, signature });
    } catch (error) {
      // If the user is not found, register them
      if (error.response?.status === 404 || error.response?.status === 400) {
        try {
          await registerUser({ walletAddress, signature });
        } catch (registrationError) {
          console.error("Error during registration:", registrationError);
          toast.error("Registration failed.");
        }
      } else {
        wallet.disconnect();
        toast.error("Authentication failed.");
        console.error("Error during authentication:", error);
      }
    }
  };

  return { handleAuth };
};

export default useAuthFlow;
