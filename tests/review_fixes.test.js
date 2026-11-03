import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameServer } from '../server/GameServer.js';
import { Room } from '../server/Room.js';

test('Room broadcastSnapshot culls food outside player view radius', () => {
  const room = new Room({ code: '111222', mode: 'ffa', botCount: 0 });
  let sentPayload = null;
  const mockSocket = {
    id: 's_view',
    emit: (event, payload) => {
      if (event === 'game_tick') sentPayload = payload;
    }
  };

  const p = room.addPlayer(mockSocket, 'Viewer', 'cat');
  p.x = 0;
  p.y = 0;

  // Clear existing foods and spawn 1 near food and 1 far food
  room.foods.clear();
  room.foodGrid.clear();

  const nearFood = room.spawnFood(100, 100);
  const farFood = room.spawnFood(1900, 1900); // Beyond 1400 view distance

  room.broadcastSnapshot();

  assert.ok(sentPayload, 'Should send game_tick');
  const foodIds = sentPayload.food.map(f => f.id);
  assert.ok(foodIds.includes(nearFood.id), 'Near food should be included in snapshot');
  assert.ok(!foodIds.includes(farFood.id), 'Far food should be culled from snapshot');
});

test('GameServer properly leaves previous room when socket hops to new room', () => {
  const gs = new GameServer();
  const room1 = gs.createRoom({ mode: 'ffa', botCount: 0 });
  const room2 = gs.createRoom({ mode: 'ffa', botCount: 0 });

  const mockSocket = { id: 's_hopper', emit: () => {}, on: () => {} };
  gs.joinRoom(room1.code, mockSocket, { name: 'Hopper' });
  assert.equal(room1.getHumanCount(), 1);

  // Hop to room2
  gs.joinRoom(room2.code, mockSocket, { name: 'Hopper' });
  assert.equal(room2.getHumanCount(), 1);
  assert.equal(room1.getHumanCount(), 0, 'Previous room should have 0 humans');
  assert.equal(gs.getRoom(room1.code), undefined, 'Previous room should be cleaned up');

  room2.stop();
});

test('Room killSnake cleans up bot memory in botAI', () => {
  const room = new Room({ code: '333444', mode: 'ffa', botCount: 1 });
  const bot = Array.from(room.snakes.values()).find(s => s.isBot);
  assert.ok(bot);

  // Populate bot memory
  room.botAI.botMemories.set(bot.id, { angleBias: 1, nextChange: Date.now() + 5000 });
  assert.ok(room.botAI.botMemories.has(bot.id));

  // Kill bot
  room.killSnake(bot, null);
  assert.ok(!room.botAI.botMemories.has(bot.id), 'Bot memory should be deleted on death');
});

