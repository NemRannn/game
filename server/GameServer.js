import { Room } from './Room.js';

export class GameServer {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // code -> Room
    this.playerRoomMap = new Map(); // socketId -> roomCode
  }

  generateRoomCode() {
    let code;
    let attempts = 0;
    do {
      code = String(Math.floor(100000 + Math.random() * 900000));
      attempts++;
    } while (this.rooms.has(code) && attempts < 100);
    return code;
  }

  createRoom(options = {}) {
    const code = this.generateRoomCode();
    const room = new Room({
      code,
      mode: options.mode || 'ffa',
      botCount: options.botCount !== undefined ? options.botCount : 8
    });

    this.rooms.set(code, room);
    room.start();
    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(String(code).trim());
  }

  joinRoom(code, socket, playerData = {}) {
    // If socket is already in another room, leave it first
    if (this.playerRoomMap.has(socket.id)) {
      this.handleDisconnect(socket.id);
    }

    const cleanCode = String(code).trim();
    let room = this.rooms.get(cleanCode);

    if (!room) {
      // If room doesn't exist, create it with this code
      room = new Room({
        code: cleanCode,
        mode: playerData.mode || 'ffa',
        botCount: playerData.botCount !== undefined ? playerData.botCount : 8
      });
      this.rooms.set(cleanCode, room);
      room.start();
    }

    const player = room.addPlayer(socket, playerData.name, playerData.skin);
    this.playerRoomMap.set(socket.id, cleanCode);

    return player;
  }

  handleInput(socketId, inputData) {
    const code = this.playerRoomMap.get(socketId);
    if (!code) return;
    const room = this.rooms.get(code);
    if (!room) return;

    const snake = room.snakes.get(socketId);
    if (!snake || !snake.isAlive) return;

    if (typeof inputData.angle === 'number') {
      snake.desiredAngle = inputData.angle;
    }
    snake.desiredBoost = !!inputData.boost;
  }

  handleRespawn(socketId, data = {}) {
    const code = this.playerRoomMap.get(socketId);
    if (!code) return null;
    const room = this.rooms.get(code);
    if (!room) return null;

    return room.respawnPlayer(socketId, data.name, data.skin);
  }

  handleDisconnect(socketId) {
    const code = this.playerRoomMap.get(socketId);
    if (!code) return;

    const room = this.rooms.get(code);
    if (room) {
      room.removePlayer(socketId);
      if (room.getHumanCount() === 0) {
        room.stop();
        this.rooms.delete(code);
      }
    }

    this.playerRoomMap.delete(socketId);
  }

  initSocketHandlers(socket) {
    socket.on('create_room', (data, callback) => {
      const room = this.createRoom(data || {});
      const player = this.joinRoom(room.code, socket, data || {});
      if (typeof callback === 'function') {
        callback({
          success: true,
          code: room.code,
          mode: room.mode,
          player: player.getSnapshot()
        });
      }
    });

    socket.on('join_room', (data, callback) => {
      const code = String(data?.code || '').trim();
      const room = this.getRoom(code);

      if (!room && !data.allowCreate) {
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Không tìm thấy phòng với mã này!' });
        }
        return;
      }

      const player = this.joinRoom(code, socket, data || {});
      const targetRoom = this.getRoom(code);
      if (typeof callback === 'function') {
        callback({
          success: true,
          code: targetRoom.code,
          mode: targetRoom.mode,
          player: player.getSnapshot()
        });
      }
    });

    socket.on('player_input', (inputData) => {
      this.handleInput(socket.id, inputData);
    });

    socket.on('respawn_request', (data, callback) => {
      const player = this.handleRespawn(socket.id, data);
      if (typeof callback === 'function') {
        callback({
          success: !!player,
          player: player ? player.getSnapshot() : null
        });
      }
    });

    socket.on('disconnect', () => {
      this.handleDisconnect(socket.id);
    });
  }
}

