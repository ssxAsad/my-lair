const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// THIS LINE MAKES ALL YOUR FILES (Projects, Portfolio, Login) ACCESSIBLE
app.use(express.static(path.join(__dirname))); 

// --- HELPER FUNCTIONS ---

function loadUsers() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, '[]');
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error loading users:", err);
        return [];
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error("Error saving users:", err);
    }
}

// --- API ROUTES ---

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ success: false, message: "All fields are required." });

    const users = loadUsers();
    if (users.find(u => u.username === username)) return res.status(400).json({ success: false, message: "Username already exists." });

    users.push({ username, email, password });
    saveUsers(users);
    
    console.log(`New User Registered: ${username}`);
    res.json({ success: true, message: "Registration successful! Please sign in." });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        console.log(`User Logged In: ${username}`);
        res.json({
            success: true,
            message: "Login successful!",
            token: "persistent-jwt-token-" + Date.now(),
            username: user.username
        });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials." });
    }
});

// --- UPDATED MAIN ROUTE ---
// Opens the DASHBOARD by default when you go to localhost:3000
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n--- SERVER ONLINE ---`);
    console.log(`Home:     http://localhost:${PORT}`);
    console.log(`Status:   All projects are active and linked.`);
    console.log(`Storage:  ${DATA_FILE}`);
    console.log(`---------------------\n`);
});