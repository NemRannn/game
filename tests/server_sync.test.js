import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Room } from '../server/Room.js';
import { GameServer } from '../server/GameServer.js';

test('Room tick updates both bots and human snakes synchronously', () => {
  const gs = new GameServer();
  const room = gs.createRoom({ mode: 'ffa', botCount: 2 });
  const mockSocket = { id: 's_sync', emit: () => {}, on: () => {} };
  const human = gs.joinRoom(room.code, mockSocket, { name: 'SyncPlayer' });
  human.angle = 0; // Facing positive X

  // Send input (should only store desired direction and not move snake immediately)
  const initialX = human.x;
  gs.handleInput(mockSocket.id, { angle: 0, boost: false });

  // Verify snake did not move immediately inside handleInput
  assert.equal(human.x, initialX, 'Snake should not update immediately on socket packet arrival');

  // Now trigger room tick
  room.tick();

  // Verify human snake advanced synchronously in tick
  assert.ok(human.x > initialX, 'Human snake should advance forward in room.tick()');
  room.stop();
});
