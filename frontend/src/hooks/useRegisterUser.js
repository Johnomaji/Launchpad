import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";
import { useWallet } from "@suiet/wallet-kit";

const useRegisterUser = () => {
  const wallet = useWallet();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (walletAddress, signature) => {
      const userData = {
        walletAddress,
        signature,
        username: `user_${walletAddress.slice(0, 8)}`, // Auto-generate a username
        bio: "Crypto enthusiast",
      };
      const response = await axiosInstance.post("/auth/register", userData);
      return response.data;
    },
    onSuccess: (data) => {
      login(data);
      toast.success("User registered successfully!");
    },
    onError: (error) => {
      toast.error("Error registering user.");
      if (wallet.connected) {
        wallet.disconnect();
      }
      throw error;
    },
  });
};

export default useRegisterUser;
