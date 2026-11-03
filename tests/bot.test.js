import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Snake } from '../server/Snake.js';
import { BotAI } from '../server/BotAI.js';

test('BotAI casual bot turns away when approaching arena boundary', () => {
  const botAI = new BotAI();
  const bot = new Snake({
    id: 'b1',
    name: 'Bot1',
    isBot: true,
    botType: 'casual',
    x: 950,
    y: 0,
    angle: 0 // Headed directly outwards to boundary 1000
  });

  const roomState = {
    arenaRadius: 1000,
    snakes: [bot],
    foodGrid: { queryRadius: () => [] }
  };

  const decision = botAI.computeDecision(bot, roomState);
  assert.ok(typeof decision.targetAngle === 'number');
  // It should steer back towards the center (PI or -PI), away from 0
  assert.ok(Math.abs(decision.targetAngle) > 1.0, 'Bot should turn back towards center');
});

test('BotAI hunter bot targets nearby smaller snake or food', () => {
  const botAI = new BotAI();
  const hunter = new Snake({
    id: 'hunter1',
    name: 'Hunter',
    isBot: true,
    botType: 'hunter',
    x: 0,
    y: 0,
    angle: 0
  });

  const prey = new Snake({
    id: 'prey1',
    name: 'Prey',
    x: 200,
    y: 50,
    mass: 10
  });

  const roomState = {
    arenaRadius: 2000,
    snakes: [hunter, prey],
    foodGrid: { queryRadius: () => [] }
  };

  const decision = botAI.computeDecision(hunter, roomState);
  // Hunter should aim towards prey (angle ~0.24 rad)
  assert.ok(Math.abs(decision.targetAngle) < 0.6, 'Hunter should aim towards prey');
});
