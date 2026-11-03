import { test } from 'node:test';
import assert from 'node:assert/strict';
import { app, gameServer } from '../server.js';

test('server.js exports app and gameServer instances', () => {
  assert.ok(app);
  assert.ok(gameServer);
  assert.equal(typeof gameServer.createRoom, 'function');
});
