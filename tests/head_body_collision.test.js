import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Room } from '../server/Room.js';

test('Rule: When head of Snake A touches body of Snake B, Snake A dies and Snake B lives', () => {
  const room = new Room({ code: '555666', mode: 'ffa', botCount: 0 });
  const mock1 = { id: 'sA', emit: () => {} };
  const mock2 = { id: 'sB', emit: () => {} };

  const snakeA = room.addPlayer(mock1, 'SnakeA', 'cat');
  const snakeB = room.addPlayer(mock2, 'SnakeB', 'corgi');

  // Snake B body extends horizontally from (100, 100) to (300, 100)
  snakeB.x = 300;
  snakeB.y = 100;
  snakeB.radius = 15;
  snakeB.segments = [
    { x: 300, y: 100 }, // head
    { x: 250, y: 100 },
    { x: 200, y: 100 },
    { x: 150, y: 100 },
    { x: 100, y: 100 }  // tail
  ];

  // Snake A crashes its head directly into Snake B's body (between 200,100 and 250,100)
  snakeA.x = 225;
  snakeA.y = 108; // 8px away, well within radius 15+15
  snakeA.radius = 15;
  snakeA.segments = [
    { x: 225, y: 108 },
    { x: 225, y: 150 },
    { x: 225, y: 190 }
  ];

  room.checkCollisions();

  assert.equal(snakeA.isAlive, false, 'Snake A (head hitting body) MUST die');
  assert.equal(snakeB.isAlive, true, 'Snake B (whose body was hit) MUST stay alive');
  assert.equal(snakeB.kills, 1, 'Snake B gets +1 kill');
  room.stop();
});

test('Rule: Head hitting between segments (capsule) also triggers death', () => {
  const room = new Room({ code: '555777', mode: 'ffa', botCount: 0 });
  const mock1 = { id: 'sC', emit: () => {} };
  const mock2 = { id: 'sD', emit: () => {} };

  const snakeC = room.addPlayer(mock1, 'SnakeC', 'cat');
  const snakeD = room.addPlayer(mock2, 'SnakeD', 'corgi');

  snakeD.x = 500;
  snakeD.y = 500;
  snakeD.radius = 15;
  snakeD.segments = [
    { x: 500, y: 500 },
    { x: 500, y: 480 },
    { x: 500, y: 460 },
    { x: 500, y: 440 }
  ];

  // Snake C hits exactly midpoint between segment 1 (500, 480) and segment 2 (500, 460)
  snakeC.x = 505; // 5px offset from x=500
  snakeC.y = 470; // midpoint
  snakeC.radius = 15;
  snakeC.segments = [
    { x: 505, y: 470 },
    { x: 540, y: 470 }
  ];

  room.checkCollisions();

  assert.equal(snakeC.isAlive, false, 'Snake C must die when hitting body capsule');
  assert.equal(snakeD.isAlive, true, 'Snake D must survive');
  room.stop();
});
