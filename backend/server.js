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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TMDB_TOKEN = process.env.TMDB_TOKEN;

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
        secure: process.env.NODE_ENV === "production", // true in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // none for cross-domain in prod
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
        if (emailExist) {
            return res.status(400).json({ message: "user already exist" });
        }

        const usernameExist = await User.findOne({ username });
        if (usernameExist) {
            return res.status(400).json({ message: "Username is taken try another one" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const userDoc = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        if (userDoc) {
            const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            setAuthCookie(res, token);
        }
        return res.status(200).json({ user: userDoc, message: "user created successfully" });
    }
    catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.findOne({ username });
        if (!userDoc) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isPasswordValid = bcryptjs.compareSync(password, userDoc.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        if (userDoc) {
            const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            setAuthCookie(res, token);
        }
        return res.status(200).json({ user: userDoc, message: "Logged In successfully" });
    }
    catch (error) {
        console.log("error Logging In: ", error.message)
        res.status(400).json({ message: error.message });
    }
});

app.get("/api/fetch-user", async (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(400).json({ message: "NO token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token." })
        }

        const userDoc = await User.findById(decoded.id).select("-password");
        if (!userDoc) {
            return res.status(400).json({ message: "User not found." })
        }
        res.status(200).json({ user: userDoc });
    }
    catch (error) {
        return res.status(400).json({ message: error.message })
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
            headers: {
                accept: 'application/json',
                Authorization: TMDB_TOKEN
            }
        });

        if (response.data.results) {
            return res.status(200).json({ content: response.data.results });
        } else {
            return res.status(404).json({ message: "No results found" });
        }
    }
    catch (error) {
        console.log("error searching movies: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/movie/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, {
            headers: {
                accept: 'application/json',
                Authorization: TMDB_TOKEN
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.log("error fetching movie detail: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/movie/:id/videos", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, {
            headers: {
                accept: 'application/json',
                Authorization: TMDB_TOKEN
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.log("error fetching movie videos: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/movie/:id/recommendations", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}/recommendations?language=en-US&page=1`, {
            headers: {
                accept: 'application/json',
                Authorization: TMDB_TOKEN
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.log("error fetching recommendations: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/category/:type", async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1 } = req.query;
        let url = '';

        switch (type) {
            case 'tv':
                url = `https://api.themoviedb.org/3/tv/popular?language=en-US&page=${page}`;
                break;
            case 'movies':
                url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`;
                break;
            case 'anime':
                url = `https://api.themoviedb.org/3/discover/movie?with_genres=16&language=en-US&page=${page}`;
                break;
            case 'popular':
                url = `https://api.themoviedb.org/3/trending/all/week?language=en-US&page=${page}`;
                break;
            case 'upcoming':
                url = `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${page}`;
                break;
            default:
                return res.status(400).json({ message: "Invalid category type" });
        }

        const response = await axios.get(url, {
            headers: {
                accept: 'application/json',
                Authorization: TMDB_TOKEN
            }
        });

        if (response.data.results) {
            return res.status(200).json({ content: response.data.results, page: response.data.page, totalPages: response.data.total_pages });
        } else {
            return res.status(404).json({ message: "No content found" });
        }
    }
    catch (error) {
        console.log("error fetching category: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Database connection helper
const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
    }
};

// Start server or export for Vercel
if (process.env.NODE_ENV !== 'production') {
    connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
} else {
    connectDB();
}

export default app;
