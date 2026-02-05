import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { getAccessToken, removeAccessToken } from "@/utils/cookies";

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token from cookies
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from cookies
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Handle 401 unauthorized - token might be expired
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== "undefined") {
        removeAccessToken();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
