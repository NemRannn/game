import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Snake } from '../server/Snake.js';
import { PowerUpsManager, POWERUP_TYPES } from '../server/PowerUps.js';

test('PowerUpsManager spawns valid powerup within arena bounds', () => {
  const manager = new PowerUpsManager();
  const pup = manager.spawn(1000);

  assert.ok(pup.id);
  assert.ok(POWERUP_TYPES.includes(pup.type));
  assert.ok(Math.hypot(pup.x, pup.y) <= 1000);
  assert.equal(pup.radius, 18);
});

test('PowerUpsManager applies buff to snake', () => {
  const manager = new PowerUpsManager();
  const snake = new Snake({ id: 's_buff', name: 'Buffy' });

  manager.applyToSnake(snake, 'shield');
  assert.ok(snake.buffs.shield > 0, 'Shield buff should be active');

  manager.applyToSnake(snake, 'magnet');
  assert.ok(snake.buffs.magnet > 0, 'Magnet buff should be active');
});

