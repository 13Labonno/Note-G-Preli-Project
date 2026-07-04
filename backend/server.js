const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { getSystemState } = require('./simulator');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// HTTP Endpoint for Discord Bot
app.get('/api/status', (req, res) => {
    res.json(getSystemState());
});

// WebSocket Real-time Broadcast to Web Dashboard
wss.on('connection', (ws) => {
    console.log('Dashboard client connected');
    
    // Send immediate initial state
    ws.send(JSON.stringify(getSystemState()));

    // Broadcast updates every 2 seconds
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(getSystemState()));
        }
    }, 2000);

    ws.on('close', () => {
        clearInterval(interval);
        console.log('Dashboard client disconnected');
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});