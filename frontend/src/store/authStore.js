import { create } from "zustand"
import axios from "axios";

// Environment-based API URL
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: null,
    isLoading: false,
    error: null,
    message: null,
    fetchingUser: true,

    signup: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/signup`, {
                username,
                email,
                password,
            });
            set({ user: response.data.user, isLoading: false });
        }
        catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error signing up",
            });
            throw error;
        }
    },

    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/login`, credentials);
            set({ user: response.data.user, isLoading: false });
            return response.data;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Login failed"
            });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${API_URL}/api/logout`);
            set({ user: null, isLoading: false });
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },

    fetchUser: async () => {
        set({ fetchingUser: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/api/fetch-user`);
            set({ user: response.data.user, fetchingUser: false });
        }
        catch (error) {
            set({
                isLoading: false,
                fetchingUser: false,
                user: null,
                error: error.response?.data?.message || "Error fetching user"
            });
        }
    },
}))
