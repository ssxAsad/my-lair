const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config(); // Load local .env if it exists

const app = express();
app.use(cors());
app.use(express.static(__dirname));

// --- PAGE ROUTES ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/portfolio', (req, res) => res.sendFile(path.join(__dirname, 'portfolio.html')));
app.get('/projects', (req, res) => res.sendFile(path.join(__dirname, 'projects.html')));
app.get('/aria', (req, res) => res.sendFile(path.join(__dirname, 'aria', 'aria.html')));
app.get('/games', (req, res) => res.sendFile(path.join(__dirname, 'games.html')));

// --- SECURE KEY ROUTES ---

// 1. Gemini Key (Updated to use GEMINIKEY)
app.get('/api/key', (req, res) => {
    res.json({ key: process.env.GEMINIKEY });
});

// 2. Spotify Key (New Route using SPOTIFYRAPIDKEY)
app.get('/api/spotify-key', (req, res) => {
    res.json({ key: process.env.SPOTIFYRAPIDKEY });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});