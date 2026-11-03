import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameServer } from '../server/GameServer.js';

test('GameServer creates room with unique 6-digit code', () => {
  const gameServer = new GameServer();
  const room = gameServer.createRoom({ mode: 'ffa' });

  assert.equal(typeof room.code, 'string');
  assert.equal(room.code.length, 6);
  assert.ok(/^\d{6}$/.test(room.code), 'Code should be 6 digits');
  assert.equal(gameServer.getRoom(room.code), room);
  room.stop();
});

test('GameServer joins player to room by 6-digit code', () => {
  const gameServer = new GameServer();
  const room = gameServer.createRoom({ mode: 'duo' });

  const mockSocket = { id: 's_user1', emit: () => {}, on: () => {} };
  const player = gameServer.joinRoom(room.code, mockSocket, { name: 'Nam', skin: 'cat' });

  assert.ok(player);
  assert.equal(player.name, 'Nam');
  assert.equal(player.skin, 'cat');
  assert.equal(room.getHumanCount(), 1);
  room.stop();
});

test('GameServer cleans up empty rooms after players leave', () => {
  const gameServer = new GameServer();
  const room = gameServer.createRoom({ mode: 'ffa', botCount: 2 });
  const mockSocket = { id: 's_leave', emit: () => {}, on: () => {} };

  gameServer.joinRoom(room.code, mockSocket, { name: 'Leaver', skin: 'cat' });
  gameServer.handleDisconnect('s_leave');

  assert.equal(gameServer.getRoom(room.code), undefined, 'Room should be cleaned up when empty');
});
