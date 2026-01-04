import { create } from "zustand"
//import axios
import axios from "axios";
axios.defaults.withCredentials = true

export const useAuthStore = create((set) => ({
    //inital state
    user: null,
    isLoading: false,
    error: null,
    message: null,
    fetchingUser: true,

    //functions

    signup: async (username, email, password) => {
        set({ isLoading: true, message: null });

        try {
            const response = await axios.post("http://localhost:5000/api/signup", {
                username,
                email,
                password,
            });

            set({ user: response.data.user, isLoading: false });
        }
        catch (error) {
            set({
                isLoading: false,
                error: error.response.data.message || "error Signing up",
            });
            throw error;
        }
    },

    login: async (credentials) => {
        set({ isLoading: true, error: null });
        console.log("Attempting login with:", credentials);
        try {
            const response = await axios.post("http://localhost:5000/api/login", credentials);
            console.log("Login success:", response.data);
            set({ user: response.data.user, isLoading: false });
            return response.data;
        } catch (error) {
            console.error("Login failed:", JSON.stringify(error.response?.data || error.message));
            set({ isLoading: false, error: error.response?.data?.message || "Login failed" });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post("http://localhost:5000/api/logout");
            set({ user: null, isLoading: false });
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },

    fetchUser: async () => {
        set({ fetchingUser: true, error: null });
        try {
            const response = await axios.get("http://localhost:5000/api/fetch-user");
            set({ user: response.data.user, fetchingUser: false });
        }
         catch (error) {
            set({ 
                isLoading : false,
                fetchingUser: false,
                user: null,
                error: error.response?.data?.message || "Error fetching user" });
        }
    },




}))
