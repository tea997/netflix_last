import express from "express";
import mongoose from "mongoose";
import { connectToDB } from "./config/db.js";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser";
import cors from "cors"
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TMDB_TOKEN = process.env.TMDB_TOKEN;

// Initialize Google GenAI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

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
        const userDoc = await User.findOne({ username });
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
    if (!token) return res.status(400).json({ message: "NO token provided." });
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
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`, {
            headers: { accept: 'application/json', Authorization: TMDB_TOKEN }
        });
        return res.status(200).json({ content: response.data.results || [] });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/movie/:id", async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${req.params.id}?language=en-US`, {
            headers: { accept: 'application/json', Authorization: TMDB_TOKEN }
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/movie/:id/videos", async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${req.params.id}/videos?language=en-US`, {
            headers: { accept: 'application/json', Authorization: TMDB_TOKEN }
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/movie/:id/recommendations", async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${req.params.id}/recommendations?language=en-US&page=1`, {
            headers: { accept: 'application/json', Authorization: TMDB_TOKEN }
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/category/:type", async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1 } = req.query;
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
        const response = await axios.get(url, {
            headers: { accept: 'application/json', Authorization: TMDB_TOKEN }
        });
        return res.status(200).json({ content: response.data.results, page: response.data.page, totalPages: response.data.total_pages });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/api/ai-recommendation", async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ message: "Prompt is required" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        res.status(200).json({ recommendation: text });
    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return;
    try { await mongoose.connect(process.env.MONGO_URI); } catch (err) { console.error(err.message); }
};

if (process.env.NODE_ENV !== 'production') {
    connectDB();
    app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`); });
} else {
    connectDB();
}

export default app;
