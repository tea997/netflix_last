import "./loadEnv.js";
import express from "express";
import mongoose from "mongoose";
import { connectToDB } from "./config/db.js";
import User from "./models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import axios from "axios";
import axiosRetry from "axios-retry";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = process.env.PORT || 5000;
const TMDB_TOKEN = (process.env.TMDB_TOKEN || "").trim();

// Configure Axios Retry
axiosRetry(axios, {
    retries: 3,
    retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNRESET';
    },
    retryDelay: axiosRetry.exponentialDelay
});

console.log("TMDB_TOKEN loaded:", TMDB_TOKEN ? "Yes (starts with " + TMDB_TOKEN.substring(0, 10) + "...)" : "No");

// Initialize Google GenAI - Using 1.5-flash-8b for faster responses
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "dummy_key");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Middleware - Local Dev CORS Fix
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Auth Helper for Cookies
const setAuthCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

// Routes
app.get("/", (req, res) => {
    res.send("Netflix Clone API is running");
});

app.post("/api/signup", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        const emailExist = await User.findOne({ email });
        if (emailExist) return res.status(400).json({ message: "user already exist" });
        const usernameExist = await User.findOne({ username });
        if (usernameExist) return res.status(400).json({ message: "Username is taken try another one" });

        const hashedPassword = await bcryptjs.hash(password, 10);
        const userDoc = await User.create({ username, email, password: hashedPassword });

        if (userDoc) {
            const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            setAuthCookie(res, token);
        }
        return res.status(200).json({ user: userDoc, message: "user created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user by username OR email
        const userDoc = await User.findOne({
            $or: [{ username: username }, { email: username }]
        });

        if (!userDoc) return res.status(400).json({ message: "Invalid Credentials" });
        const isPasswordValid = bcryptjs.compareSync(password, userDoc.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid Password" });

        if (userDoc) {
            const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            setAuthCookie(res, token);
        }
        return res.status(200).json({ user: userDoc, message: "Logged In successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get("/api/fetch-user", async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: "No token provided." });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userDoc = await User.findById(decoded.id).select("-password");
        if (!userDoc) return res.status(400).json({ message: "User not found." });
        res.status(200).json({ user: userDoc });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

app.post("/api/logout", async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });
    res.status(200).json({ message: "Logged Out successfully." });
});

app.get("/api/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: "Search Query is required" });
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`;

        const response = await axios.get(url, {
            headers: { 'accept': 'application/json', 'Authorization': TMDB_TOKEN }
        });
        return res.status(200).json({ content: response.data.results || [] });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/movie/:id", async (req, res) => {
    try {
        const url = `https://api.themoviedb.org/3/movie/${req.params.id}?language=en-US`;
        const response = await axios.get(url, {
            headers: { 'accept': 'application/json', 'Authorization': TMDB_TOKEN }
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/movie/:id/videos", async (req, res) => {
    try {
        const url = `https://api.themoviedb.org/3/movie/${req.params.id}/videos?language=en-US`;
        const response = await axios.get(url, {
            headers: { 'accept': 'application/json', 'Authorization': TMDB_TOKEN }
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/movie/:id/recommendations", async (req, res) => {
    try {
        const url = `https://api.themoviedb.org/3/movie/${req.params.id}/recommendations?language=en-US&page=1`;
        const response = await axios.get(url, {
            headers: { 'accept': 'application/json', 'Authorization': TMDB_TOKEN }
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const categoryCache = new Map();

app.get("/api/category/:type", async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1 } = req.query;
        const cacheKey = `${type}-${page}`;

        // Check Cache
        if (categoryCache.has(cacheKey)) {
            const { data, timestamp } = categoryCache.get(cacheKey);
            if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 min cache
                console.log(`[BACKEND] Serving category ${type} from cache`);
                return res.status(200).json(data);
            }
        }

        let url = '';
        switch (type) {
            case 'tv': url = `https://api.themoviedb.org/3/tv/popular?language=en-US&page=${page}`; break;
            case 'movies': url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`; break;
            case 'anime': url = `https://api.themoviedb.org/3/discover/movie?with_genres=16&language=en-US&page=${page}`; break;
            case 'popular': url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`; break;
            case 'upcoming': url = `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${page}`; break;
            case 'top_rated': url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`; break;
            case 'now_playing': url = `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=${page}`; break;
            default: return res.status(400).json({ message: "Invalid category type" });
        }

        console.log(`[BACKEND] Fetching category: ${type} (Page ${page})`);

        const response = await axios.get(url, {
            headers: {
                'accept': 'application/json',
                'Authorization': TMDB_TOKEN
            },
            timeout: 20000
        });

        const data = response.data;
        const responseData = {
            content: data.results || [],
            page: data.page,
            totalPages: data.total_pages
        };

        // Update Cache
        categoryCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

        return res.status(200).json(responseData);
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error("[BACKEND] TMDB Request Timed Out (Axios)");
            return res.status(504).json({ message: "Gateway Timeout - TMDB too slow" });
        }
        console.error("[BACKEND] Category Route Exception:", error.message);
        if (error.response) {
            console.error("[BACKEND] TMDB Error Status:", error.response.status);
            console.error("[BACKEND] TMDB Error Data:", error.response.data);
            return res.status(error.response.status).json({
                message: "TMDB API Error",
                error: error.response.data
            });
        }
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
});

app.post("/api/ai-recommendation", async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ message: "Prompt is required" });

        if (!process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_GENAI_API_KEY.includes("AIzaSy...")) {
            return res.status(500).json({ message: "Gemini API Key is missing or invalid" });
        }

        console.log(`[BACKEND] AI Request: ${prompt.substring(0, 50)}...`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ recommendation: text });
    } catch (error) {
        console.error("[BACKEND] AI Route Exception:", error.message);
        res.status(500).json({
            message: "AI Recommendation Failed",
            error: error.message
        });
    }
});

// Always connect and always listen in local development
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is definitely running on http://localhost:${PORT}`);
    connectToDB();
});

server.on('error', (err) => {
    console.error("FAILED TO START SERVER:", err.message);
});

export default app;
