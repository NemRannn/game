import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Room } from '../server/Room.js';

test('Room initializes with 6-digit code and default bots', () => {
  const room = new Room({
    code: '123456',
    mode: 'ffa',
    botCount: 5,
    arenaRadius: 1500
  });

  assert.equal(room.code, '123456');
  assert.equal(room.mode, 'ffa');
  assert.equal(room.snakes.size, 5, 'Should spawn 5 bots initially');
  assert.ok(room.foodCount > 50, 'Should spawn initial food pellets');
});

test('Room adds human player and assigns host status to first player', () => {
  const room = new Room({ code: '654321', mode: 'duo', botCount: 2 });
  const mockSocket1 = { id: 'sock1', emit: () => {} };
  const mockSocket2 = { id: 'sock2', emit: () => {} };

  const p1 = room.addPlayer(mockSocket1, 'Player1', 'cat');
  assert.equal(p1.isHost, true);
  assert.equal(p1.isBot, false);

  const p2 = room.addPlayer(mockSocket2, 'Player2', 'panda');
  assert.equal(p2.isHost, false);
  assert.equal(p2.isBot, false);

  assert.equal(room.getHumanCount(), 2);
});

test('In Duo mode, head-to-body collision between human players does NOT kill either', () => {
  const room = new Room({ code: '777888', mode: 'duo', botCount: 0 });
  const mockSocket1 = { id: 'sock1', emit: () => {} };
  const mockSocket2 = { id: 'sock2', emit: () => {} };

  const p1 = room.addPlayer(mockSocket1, 'P1', 'cat');
  const p2 = room.addPlayer(mockSocket2, 'P2', 'corgi');

  // Place p2 directly ahead of p1's head
  p1.x = 100;
  p1.y = 100;
  p1.segments = [{ x: 100, y: 100 }, { x: 90, y: 100 }];

  p2.x = 110;
  p2.y = 100;
  p2.segments = [{ x: 110, y: 100 }, { x: 105, y: 100 }];

  room.checkCollisions();

  assert.equal(p1.isAlive, true, 'Human 1 should stay alive in Duo mode');
  assert.equal(p2.isAlive, true, 'Human 2 should stay alive in Duo mode');
});

test('In FFA mode, head-to-body collision kills the crashing snake', () => {
  const room = new Room({ code: '999111', mode: 'ffa', botCount: 0 });
  const mockSocket1 = { id: 'sock1', emit: () => {} };
  const mockSocket2 = { id: 'sock2', emit: () => {} };

  const p1 = room.addPlayer(mockSocket1, 'P1', 'cat');
  const p2 = room.addPlayer(mockSocket2, 'P2', 'corgi');

  // Place p1's head colliding with p2's body segment (index 2)
  p2.segments = [
    { x: 300, y: 300 },
    { x: 250, y: 300 },
    { x: 200, y: 300 },
    { x: 150, y: 300 }
  ];
  p2.radius = 15;

  p1.x = 202; // Hitting segment 2 of p2
  p1.y = 300;
  p1.radius = 15;

  room.checkCollisions();

  assert.equal(p1.isAlive, false, 'Crashing snake should die in FFA mode');
  assert.equal(p2.isAlive, true, 'Snake that was collided into should stay alive');
});

