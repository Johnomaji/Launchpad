import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://launchpad-ashy-nine.vercel.app/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;