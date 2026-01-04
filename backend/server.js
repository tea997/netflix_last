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

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))

// Routes
app.get("/", (req, res) => {
    res.send("hello World");
});

app.post("/api/signup", async (req, res) => {
    console.log("Signup req.body:", req.body);
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: "Invalid request body" });
    }
    //expecting 3 thing from front end-> {username, email, password}
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            throw new Error("All fields are required!");
        }

        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database connection failed. Please check MongoDB Atlas IP whitelist.");
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

        //JWT
        if (userDoc) {
            //jwt.sign(payload, secret,options)
            const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
        }
        return res.status(200).json({ user: userDoc, message: "user created successfully" });
    }
    catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/login", async (req, res) => {
    console.log("Login req.body:", req.body);
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: "Invalid request body" });
    }
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

        //JWT
        if (userDoc) {
            //jwt.sign(payload, secret,options)
            const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
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
    if (!token) {//check token
        return res.status(400).json({ message: "NO token provided." });
    }

    try {//decode token provided...is from JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);//verify token by JWT
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token." })
        }

        const userDoc = await User.findById(decoded.id).select("-password");//get user from DB by ID...is from JWT
        if (!userDoc) {
            return res.status(400).json({ message: "User not found." })
        }
        res.status(200).json({ user: userDoc });
    }
    catch (error) {
        console.log("error fetching user : ", error.message);
        return res.status(400).json({ message: error.message })
    }
});

app.post("/api/logout", async (req, res) => {   //Log Out...clear cookie token  //JWT
    res.clearCookie("token");
    res.status(200).json({ message: "Logged Out successfully." });
});

//search API
app.get("/api/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: "Search Query is required" });

        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`, {
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyODk5ZmJmYTk4OWY5YjlmOTJjNWYyYTVjNzExZjhhNiIsIm5iZiI6MTc2NjMzODI3NS45OTYsInN1YiI6IjY5NDgyZWUzNDkzNWIyZTMzMmZiMTFlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1uCxRfRwaewJNY5IpKotduvdBYC7PQsuNiN9deCjNkw'
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

// Category API - handles different content types
const TMDB_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyODk5ZmJmYTk4OWY5YjlmOTJjNWYyYTVjNzExZjhhNiIsIm5iZiI6MTc2NjMzODI3NS45OTYsInN1YiI6IjY5NDgyZWUzNDkzNWIyZTMzMmZiMTFlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1uCxRfRwaewJNY5IpKotduvdBYC7PQsuNiN9deCjNkw';

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
                // Animation genre ID is 16
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

app.listen(PORT, () => {
    connectToDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});
