import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";

const useGetMemecoins = () => {
  return useQuery({
    queryKey: ["memecoins"], 
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/memecoins/all");
        return response.data;
      } catch (error) {
        // toast.error(error?.response?.data?.error || "Error fetching memecoins.");
        throw error;
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || "Error fetching memecoins.");
    },
  });
};

export default useGetMemecoins;