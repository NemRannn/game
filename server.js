import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameServer } from './server/GameServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

const PORT = process.env.PORT || 3000;

// Serve static frontend from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for any direct routes / room links
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize game server
const gameServer = new GameServer(io);

io.on('connection', (socket) => {
  gameServer.initSocketHandlers(socket);
});

let isListening = false;

function startServer(port = PORT) {
  if (!isListening) {
    server.listen(port, () => {
      isListening = true;
      console.log(`✨ SnakeCute.io Server is running on port ${port}`);
      console.log(`👉 Open http://localhost:${port} in your browser!`);
    });
  }
  return server;
}

// Auto-start when run directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  startServer();
}

export { app, server, io, gameServer, startServer };
