import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SpatialGrid } from '../server/SpatialGrid.js';

test('SpatialGrid inserts items and queries within radius', () => {
  const grid = new SpatialGrid(100); // 100px cell size
  const item1 = { id: 'f1', x: 50, y: 50, radius: 5 };
  const item2 = { id: 'f2', x: 250, y: 250, radius: 5 };
  const item3 = { id: 'f3', x: 70, y: 80, radius: 5 };

  grid.insert(item1);
  grid.insert(item2);
  grid.insert(item3);

  const results = grid.queryRadius(50, 50, 50);
  const ids = results.map(r => r.id);

  assert.ok(ids.includes('f1'), 'Should find item1');
  assert.ok(ids.includes('f3'), 'Should find item3 within radius');
  assert.ok(!ids.includes('f2'), 'Should NOT find item2 out of radius');
});

test('SpatialGrid removes item correctly', () => {
  const grid = new SpatialGrid(100);
  const item = { id: 'f1', x: 50, y: 50, radius: 5 };
  grid.insert(item);
  assert.equal(grid.queryRadius(50, 50, 50).length, 1);

  grid.remove(item);
  assert.equal(grid.queryRadius(50, 50, 50).length, 0);
});

test('SpatialGrid handles boundary items and negative coords safely', () => {
  const grid = new SpatialGrid(100);
  const item = { id: 'f_edge', x: 0, y: 0, radius: 10 };
  grid.insert(item);
  const found = grid.queryRadius(0, 0, 15);
  assert.equal(found.length, 1);
  assert.equal(found[0].id, 'f_edge');
});
