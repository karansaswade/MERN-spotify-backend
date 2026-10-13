
const userModel = require("../models/user.model");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register a new user
async function registerUser(req, res) {
    const { username, email, password } = req.body;

    // Check if username or email already exists
    const userAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (userAlreadyExists) {
        return res.status(409).json({
            message: "User already exists"
        });
    }

    // Hash the password before saving it
    const hash = await bcrypt.hash(password, 10);

    // Create user with the default role from the model
    const user = await userModel.create({
        username,
        email,
        password: hash
    });

    // Generate JWT containing user ID and role
    const token = jsonwebtoken.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET
    );

    // Store JWT in a cookie
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax"
    });

    // Never send the hashed password to the client
    return res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
}

// Login an existing user
async function loginUser(req, res) {
    const { username, email, password } = req.body;

    // Find user using username or email
    const user = await userModel.findOne({
        $or: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : [])
        ]
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    // Compare entered password with the hashed password
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid password"
        });
    }

    // Generate JWT containing user ID and role
    const token = jsonwebtoken.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET
    );

    // Store JWT in a cookie
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax"
    });

    return res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
}

async function logoutUser(req, res) {
    res.clearCookie("token");
    return res.status(200).json({
        message: "User logged out successfully"
    });
}

module.exports = { registerUser, loginUser ,logoutUser};
