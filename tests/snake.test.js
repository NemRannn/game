import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Snake } from '../server/Snake.js';

test('Snake initializes with valid properties and body segments', () => {
  const snake = new Snake({
    id: 's1',
    name: 'Nam',
    skin: 'cat',
    x: 500,
    y: 500,
    angle: 0
  });

  assert.equal(snake.id, 's1');
  assert.equal(snake.name, 'Nam');
  assert.equal(snake.skin, 'cat');
  assert.equal(snake.isAlive, true);
  assert.ok(snake.segments.length >= 10, 'Should start with reasonable initial segments');
  assert.equal(snake.segments[0].x, 500);
  assert.equal(snake.segments[0].y, 500);
});

test('Snake moves forward based on velocity and angle', () => {
  const snake = new Snake({
    id: 's2',
    name: 'Snake2',
    skin: 'panda',
    x: 500,
    y: 500,
    angle: 0
  });

  const initialX = snake.x;
  snake.update(0, false, 2000); // targetAngle = 0, isBoosting = false, arena = 2000

  assert.ok(snake.x > initialX, 'Head should advance forward along positive X');
  assert.equal(snake.segments[0].x, snake.x);
});

test('Snake boost increases speed and drops mass orbs when mass > minMass', () => {
  const snake = new Snake({
    id: 's3',
    name: 'Speedy',
    skin: 'dino',
    x: 500,
    y: 500,
    angle: 0
  });

  snake.mass = 50; // Plenty of mass
  let droppedOrbs = [];
  for (let i = 0; i < 5; i++) {
    const dropped = snake.update(0, true, 2000); // boost = true
    if (dropped.length > 0) droppedOrbs = droppedOrbs.concat(dropped);
  }

  assert.ok(snake.isBoosting, 'Should be marked as boosting');
  assert.ok(snake.mass < 50, 'Mass should decrease during boost');
  assert.ok(droppedOrbs.length > 0, 'Should drop orbs across ticks');
});

test('Snake clamps within arena bounds', () => {
  const arenaRadius = 1000;
  const snake = new Snake({
    id: 's4',
    name: 'BorderTest',
    x: 990,
    y: 0,
    angle: 0
  });

  // Try moving way past arena boundary
  for (let i = 0; i < 20; i++) {
    snake.update(0, false, arenaRadius);
  }

  const distFromCenter = Math.hypot(snake.x, snake.y);
  assert.ok(distFromCenter <= arenaRadius + 1, 'Should stay constrained inside circular arena');
});

test('Snake kill sets alive to false', () => {
  const snake = new Snake({ id: 's5', name: 'DeadSnake', x: 0, y: 0 });
  snake.kill();
  assert.equal(snake.isAlive, false);
});
