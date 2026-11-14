const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

let players = {};

wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(2, 9);
    ws.send(JSON.stringify({ type: 'init', id: id }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'update') {
                players[id] = data.player;
            }
        } catch (e) {}
    });

    ws.on('close', () => {
        delete players[id];
    });
});

setInterval(() => {
    const payload = JSON.stringify({ type: 'state', players: players });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}, 30);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Szerver fut a ${PORT} porton`);
});
