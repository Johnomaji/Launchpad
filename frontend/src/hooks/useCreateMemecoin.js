import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";
import { use } from "react";

const useCreateMemecoin = () => {
  return useMutation({
    mutationFn: async ({
      name,
      ticker,
      coinAddress,
      creator,
      image,
      desc,
      totalCoins,
      xSocial,
      telegramSocial,
      discordSocial,
      creatorAddress,
    }) => {
      try {
        const coinData = {
          name,
          ticker,
          coinAddress,
          creator,
          image,
          desc,
          totalCoins,
          xSocial,
          telegramSocial,
          discordSocial,
          creatorAddress,
        };
        const response = await axiosInstance.post("/memecoin/create", coinData);
        return response.data;
      } catch (error) {
        toast.error("Error Creating Coin.");
        throw error;
      }
    },
    onSuccess: (data) => {
      login(data);
      toast.success("Coin created successfully!");
    },
  });
};

export default useCreateMemecoin;
