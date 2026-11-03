export const POWERUP_TYPES = [
  'magnet',  // 🧲 Attracts orbs in large radius
  'shield',  // 🛡️ Invulnerable to head-to-body collisions
  'speed',   // ⚡ Boost without mass cost
  'double',  // 🌟 2x mass from orbs
  'vision'   // 🔍 Zoom out camera
];

export const POWERUP_CONFIG = {
  magnet: { duration: 300, icon: '🧲', color: '#ff6b6b', name: 'Nam Châm' },
  shield: { duration: 250, icon: '🛡️', color: '#48dbfb', name: 'Khiên Bảo Vệ' },
  speed:  { duration: 200, icon: '⚡', color: '#feca57', name: 'Siêu Tốc' },
  double: { duration: 350, icon: '🌟', color: '#ff9ff3', name: 'x2 Điểm' },
  vision: { duration: 300, icon: '🔍', color: '#1dd1a1', name: 'Viễn Vọng' }
};

export class PowerUpsManager {
  constructor() {
    this.powerups = new Map();
  }

  /**
   * Spawn a powerup within the arena radius
   * @param {number} arenaRadius
   * @returns {Object}
   */
  spawn(arenaRadius) {
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    // Random position within 85% of arena radius
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (arenaRadius * 0.85);

    const powerup = {
      id: 'pup_' + Math.random().toString(36).substring(2, 9),
      type,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      radius: 18,
      icon: POWERUP_CONFIG[type].icon,
      color: POWERUP_CONFIG[type].color,
      createdAt: Date.now(),
      duration: POWERUP_CONFIG[type].duration
    };

    this.powerups.set(powerup.id, powerup);
    return powerup;
  }

  applyToSnake(snake, type) {
    const config = POWERUP_CONFIG[type];
    if (!config) return;

    if (snake.buffs) {
      snake.buffs[type] = config.duration;
    }
  }

  remove(id) {
    this.powerups.delete(id);
  }

  getAll() {
    return Array.from(this.powerups.values());
  }
}
