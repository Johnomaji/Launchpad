import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const useGetMemecoin = (id) => {
  return useQuery({
    queryKey: ["memecoin", id], 
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/memecoins/${id}`);
        console.log(response.data); 
        return response.data;
      } catch (error) {
        // toast.error(error?.response?.data?.error || "Error fetching memecoin.");
        throw error; 
      }
    },
    onError: (error) => {
    //   toast.error(error?.response?.data?.error || "Error fetching memecoin.");
    },
    enabled: !!id,
  });
};

export default useGetMemecoin;