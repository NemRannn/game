/**
 * High-performance 2D Spatial Hash Grid for food orbs, powerups, and segment collisions.
 */
export class SpatialGrid {
  /**
   * @param {number} cellSize Size of each square bucket in world coordinates.
   */
  constructor(cellSize = 120) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  _hash(cx, cy) {
    return `${cx},${cy}`;
  }

  _getCellCoords(x, y) {
    return {
      cx: Math.floor(x / this.cellSize),
      cy: Math.floor(y / this.cellSize)
    };
  }

  /**
   * Insert an item into the grid. Item must have x and y properties.
   * @param {Object} item
   */
  insert(item) {
    const { cx, cy } = this._getCellCoords(item.x, item.y);
    const key = this._hash(cx, cy);
    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = new Set();
      this.cells.set(key, bucket);
    }
    bucket.add(item);
    item._gridKey = key;
  }

  /**
   * Remove an item from the grid.
   * @param {Object} item
   */
  remove(item) {
    const key = item._gridKey || this._hash(
      Math.floor(item.x / this.cellSize),
      Math.floor(item.y / this.cellSize)
    );
    const bucket = this.cells.get(key);
    if (bucket) {
      bucket.delete(item);
      if (bucket.size === 0) {
        this.cells.delete(key);
      }
    }
    delete item._gridKey;
  }

  /**
   * Clear all items from the grid.
   */
  clear() {
    this.cells.clear();
  }

  /**
   * Query all items within a circular radius (x, y, radius).
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @returns {Array<Object>}
   */
  queryRadius(x, y, radius) {
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);

    const r2 = radius * radius;
    const results = [];

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const key = this._hash(cx, cy);
        const bucket = this.cells.get(key);
        if (!bucket) continue;

        for (const item of bucket) {
          const dx = item.x - x;
          const dy = item.y - y;
          const combinedR = radius + (item.radius || 0);
          if (dx * dx + dy * dy <= combinedR * combinedR) {
            results.push(item);
          }
        }
      }
    }

    return results;
  }
}
