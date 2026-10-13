
const musicModel = require("../models/music.model");
const { uploadFile } = require("../services/storage.service");
const albumModel = require("../models/album.model");
const jsonwebtoken = require("jsonwebtoken");

async function createMusic(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    let decoded;

    try {
        decoded = jsonwebtoken.verify(
            token,
            process.env.JWT_SECRET
        );
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    // Only artists can upload music
    if (decoded.role !== "artist") {
        return res.status(403).json({
            message: "No access"
        });
    }

    // Get the uploaded file from Multer
    const file = req.file;

    if (!file) {
        return res.status(400).json({
            message: "Music file is required"
        });
    }

    const { title } = req.body;

    // Convert file buffer to Base64 for storage upload
    const result = await uploadFile(
        file.buffer.toString("base64")
    );

    // Save music details in MongoDB
    const music = await musicModel.create({
        uri: result.url,
        title,
        artist: decoded.id
    });

    return res.status(201).json({
        message: "Music created successfully",
        music
    });
}


async function createAlbum(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    let decoded;

    try {
        decoded = jsonwebtoken.verify(
            token,
            process.env.JWT_SECRET
        );
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    // Only artists can create albums
    if (decoded.role !== "artist") {
        return res.status(403).json({
            message: "No access"
        });
    }

    const { title, musicIds } = req.body;

    const album = await albumModel.create({
        title,
        artist: decoded.id,
        musics: musicIds
    });

    return res.status(201).json({
        message: "Album created successfully",
        album
    });
}

async function getAllmusics(req, res) {
    const musics = await musicModel.find()
    .limit(20)
    .populate("artist", "username email");
    res.status(200).json({
        message: "All musics retrieved successfully",
        musics
    });
}

async function getAllAlbums(req, res) {
    const albums = await albumModel.find().select("title artist -musics").populate("artist", "username email").populate("musics", "title uri");
    res.status(200).json({
        message: "All albums retrieved successfully",
        albums
    });
}

module.exports = { createMusic,createAlbum,getAllmusics,getAllAlbums};
