const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const GAMES_FILE = path.join(__dirname, 'games.json');

// Load games from file
let games = [];
if (fs.existsSync(GAMES_FILE)) {
    try {
        games = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf8'));
    } catch (e) {
        console.log('Error loading games.json, starting fresh.');
        games = [];
    }
}

// Get all games
app.get('/games', (req, res) => {
    res.json(games);
});

// Add a new game (admin only - simple password check)
app.post('/games', (req, res) => {
    const { game, adminPassword } = req.body;

    // Simple admin protection (change this password!)
    if (adminPassword !== 'Lululoloadmin03') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!game || !game.title) {
        return res.status(400).json({ error: 'Invalid game data' });
    }

    // Add ID and timestamp
    game.id = 'g-' + Date.now();
    game.uploadDate = new Date().toISOString().split('T')[0];

    games.unshift(game);

    // Save to file
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));

    res.json({ success: true, game });
});

// Delete a game (admin only)
app.delete('/games/:id', (req, res) => {
    const { adminPassword } = req.body;
    const gameId = req.params.id;

    if (adminPassword !== 'Lululoloadmin03') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    games = games.filter(g => g.id !== gameId);
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`✅ GrokSteam Server running on http://localhost:${PORT}`);
    console.log(`   - GET  /games          → Get all games`);
    console.log(`   - POST /games          → Publish new game (needs adminPassword)`);
    console.log(`   - DELETE /games/:id    → Delete game (needs adminPassword)`);
});