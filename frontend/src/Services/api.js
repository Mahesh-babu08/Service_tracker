import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// ✅ REQUEST INTERCEPTOR
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    // Do NOT append token logic if we are hitting auth endpoints (Registration/Login) 
    // to prevent ghost/expired tokens in localStorage from blocking the backend JwtFilter.
    const isAuthRequest = req.url && req.url.includes('/auth/');

    if (token && !isAuthRequest) {
      if (req.headers && req.headers.set) {
        req.headers.set('Authorization', `Bearer ${token}`);
      } else {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR (VERY IMPORTANT)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Prevent aggressive redirect loop if the failure was naturally from the login endpoint itself
      const isLoginRequest = err.config && err.config.url && err.config.url.includes('/auth/login');
      
      if (!isLoginRequest) {
        toast.error("Session expired or unauthorized. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    if (err.response?.status === 403) {
      toast.error("Forbidden - You do not have permission to perform this action.");
      console.error("Forbidden - Check roles/permissions");
    }

    if (err.response?.status >= 500) {
      toast.error("An internal server error occurred. Please try again later.");
    }

    return Promise.reject(err);
  }
);

export default API;