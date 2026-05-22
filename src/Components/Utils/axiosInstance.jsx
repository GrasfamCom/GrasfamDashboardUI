import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../../config/envConfig";

const methodsRequiringCsrf = ["post", "put", "patch", "delete"];

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (methodsRequiringCsrf.includes(config.method?.toLowerCase())) {
    const xsrfToken = Cookies.get("X-GRASFAM-XSRF-TOKEN");
    if (xsrfToken) {
      config.headers["X-XSRF-TOKEN"] = xsrfToken;
    }
    config.withCredentials = true;
  }

  return config;
});

export default axiosInstance;
