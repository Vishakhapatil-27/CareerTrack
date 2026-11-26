const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Application = require("./Application");
const User = require("./User");
console.log("User Model:", typeof User.findOne);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// User Registration
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || password.length < 6) {
            return res.status(400).json({
                message: "Name, email and password (minimum 6 characters) are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            passwordHash
        });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "Registration successful",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. Please login." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        req.userId = decoded.userId;
        next();
    });
};

// Home Route
app.get("/", (req, res) => {
    res.send("CareerTrack Backend is Running!");
});

// Get all applications
app.get("/api/applications", authenticateToken, async (req, res) => {
    try {
        const applications = await Application.find({
            user: req.userId
        });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add application
app.post("/api/applications", authenticateToken, async (req, res) => {
    try {
        const application = new Application({
            ...req.body,
            user: req.userId
        });

        const savedApplication = await application.save();
        res.status(201).json(savedApplication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update application
app.put("/api/applications/:id", authenticateToken, async (req, res) => {
    try {
        const { user, ...updateData } = req.body;

        const updatedApplication = await Application.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.userId
            },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json(updatedApplication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete application
app.delete("/api/applications/:id", authenticateToken, async (req, res) => {
    try {
        const deletedApplication = await Application.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!deletedApplication) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json({ message: "Application deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error.message);
    });
