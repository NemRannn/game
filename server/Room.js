import { Snake } from './Snake.js';
import { SpatialGrid } from './SpatialGrid.js';
import { BotAI } from './BotAI.js';
import { PowerUpsManager } from './PowerUps.js';

const PASTEL_COLORS = [
  '#ff7675', '#74b9ff', '#55efc4', '#ffeaa7',
  '#fd79a8', '#a29bfe', '#fab1a0', '#00cec9'
];

const BOT_NAMES = [
  'Bé Miu Miu', 'Cún Bông', 'Gấu Mập', 'Khủng Long Nhí',
  'Trà Đào', 'Bé Thỏ Bảy Màu', 'Cá Vàng Mắt Lồi', 'Gà Siêu Tốc',
  'Sóc Chuột Cute', 'Bé Ỉn Hồng', 'Mèo Đi Hài', 'Hổ Con Dễ Thương'
];

const BOT_SKINS = [
  'cat', 'panda', 'corgi', 'dino', 'strawberry', 'boba', 'rainbow', 'chick'
];

function distToSegmentSquared(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return (px - x1) * (px - x1) + (py - y1) * (py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  const dx = px - projX;
  const dy = py - projY;
  return dx * dx + dy * dy;
}

export class Room {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this.code = String(options.code || Math.floor(100000 + Math.random() * 900000));
    this.mode = options.mode || 'ffa'; // 'ffa' | 'duo'
    this.arenaRadius = options.arenaRadius || 2200;
    this.targetBotCount = options.botCount !== undefined ? options.botCount : 8;

    this.snakes = new Map(); // id -> Snake
    this.sockets = new Map(); // id -> Socket

    this.foodGrid = new SpatialGrid(120);
    this.foods = new Map(); // id -> Food

    this.powerupsManager = new PowerUpsManager();
    this.botAI = new BotAI();

    this.targetFoodCount = Math.floor(this.arenaRadius * 0.3);
    this.initFood();
    this.initBots();

    this.tickInterval = null;
    this.lastPowerupSpawn = Date.now();
  }

  get foodCount() {
    return this.foods.size;
  }

  initFood() {
    for (let i = 0; i < this.targetFoodCount; i++) {
      this.spawnFood();
    }
  }

  spawnFood(x, y, value = 1, isSweet = false) {
    if (x === undefined || y === undefined) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * (this.arenaRadius * 0.95);
      x = Math.cos(angle) * dist;
      y = Math.sin(angle) * dist;
    }

    const id = 'f_' + Math.random().toString(36).substring(2, 9);
    const color = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
    const radius = isSweet ? 8 : (value > 2 ? 6 : 4);

    const food = {
      id,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      value,
      color,
      radius,
      isSweet
    };

    this.foods.set(id, food);
    this.foodGrid.insert(food);
    return food;
  }

  initBots() {
    for (let i = 0; i < this.targetBotCount; i++) {
      this.spawnBot();
    }
  }

  spawnBot() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (this.arenaRadius * 0.7);
    const botType = Math.random() < 0.4 ? 'hunter' : 'casual';
    const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const skin = BOT_SKINS[Math.floor(Math.random() * BOT_SKINS.length)];

    const bot = new Snake({
      id: 'bot_' + Math.random().toString(36).substring(2, 9),
      name,
      skin,
      isBot: true,
      botType,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      angle: Math.random() * Math.PI * 2,
      mass: 15 + Math.floor(Math.random() * 25)
    });

    this.snakes.set(bot.id, bot);
    return bot;
  }

  addPlayer(socket, name, skin) {
    const isFirstHuman = this.getHumanCount() === 0;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (this.arenaRadius * 0.5);

    const player = new Snake({
      id: socket.id,
      name: name || 'Người chơi',
      skin: skin || 'cat',
      isBot: false,
      isHost: isFirstHuman,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      angle: Math.random() * Math.PI * 2,
      mass: 16
    });

    this.snakes.set(player.id, player);
    this.sockets.set(socket.id, socket);

    return player;
  }

  respawnPlayer(socketId, name, skin) {
    const existing = this.snakes.get(socketId);
    if (!existing) return null;

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (this.arenaRadius * 0.5);

    const newSnake = new Snake({
      id: socketId,
      name: name || existing.name,
      skin: skin || existing.skin,
      isBot: false,
      isHost: existing.isHost,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      angle: Math.random() * Math.PI * 2,
      mass: 16
    });

    this.snakes.set(socketId, newSnake);
    return newSnake;
  }

  removePlayer(socketId) {
    this.snakes.delete(socketId);
    this.sockets.delete(socketId);

    // If host left, elect next human as host
    let hasHost = false;
    for (const snake of this.snakes.values()) {
      if (!snake.isBot && snake.isHost) {
        hasHost = true;
        break;
      }
    }
    if (!hasHost) {
      for (const snake of this.snakes.values()) {
        if (!snake.isBot) {
          snake.isHost = true;
          break;
        }
      }
    }
  }

  getHumanCount() {
    let count = 0;
    for (const s of this.snakes.values()) {
      if (!s.isBot) count++;
    }
    return count;
  }

  start() {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => this.tick(), 1000 / 30);
    if (this.tickInterval && typeof this.tickInterval.unref === 'function') {
      this.tickInterval.unref();
    }
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  tick() {
    try {
      const allSnakes = Array.from(this.snakes.values());

      // 1. Update all snakes (both AI bots and human players) synchronously
      for (const snake of allSnakes) {
        if (!snake.isAlive) continue;

        let targetAngle = snake.angle;
        let wantsBoost = false;

        if (snake.isBot) {
          const decision = this.botAI.computeDecision(snake, {
            arenaRadius: this.arenaRadius,
            snakes: allSnakes,
            foodGrid: this.foodGrid
          });
          targetAngle = decision.targetAngle;
          wantsBoost = decision.wantsBoost;
        } else {
          targetAngle = snake.desiredAngle !== undefined ? snake.desiredAngle : snake.angle;
          wantsBoost = !!snake.desiredBoost;
        }

        const dropped = snake.update(targetAngle, wantsBoost, this.arenaRadius);
        for (const drop of dropped) {
          this.spawnFood(drop.x, drop.y, drop.value, false);
        }
      }

      // 2. Check food & powerup pickups
      this.checkPickups();

      // 3. Check snake collisions
      this.checkCollisions();

      // 4. Replenish food & bots
      if (this.foods.size < this.targetFoodCount) {
        this.spawnFood();
      }

      let activeBots = 0;
      for (const s of this.snakes.values()) {
        if (s.isBot && s.isAlive) activeBots++;
      }
      if (activeBots < this.targetBotCount) {
        this.spawnBot();
      }

      // 5. Periodic Power-up spawn (every ~12 seconds)
      if (Date.now() - this.lastPowerupSpawn > 12000 && this.powerupsManager.getAll().length < 5) {
        this.powerupsManager.spawn(this.arenaRadius);
        this.lastPowerupSpawn = Date.now();
      }

      // 6. Broadcast snapshot to all connected human clients
      this.broadcastSnapshot();
    } catch (err) {
      console.error(`[Room ${this.code}] Tick error:`, err);
    }
  }

  checkPickups() {
    const powerups = this.powerupsManager.getAll();

    for (const snake of this.snakes.values()) {
      if (!snake.isAlive) continue;

      // Magnet increases pickup range
      const pickupRadius = snake.buffs.magnet > 0 ? (snake.radius + 150) : (snake.radius + 15);
      const nearbyFood = this.foodGrid.queryRadius(snake.x, snake.y, pickupRadius);

      for (const food of nearbyFood) {
        // Eat food
        snake.grow(food.value || 1);
        this.foodGrid.remove(food);
        this.foods.delete(food.id);
      }

      // Check power-up pickup
      for (const pup of powerups) {
        const d = Math.hypot(snake.x - pup.x, snake.y - pup.y);
        if (d < snake.radius + pup.radius) {
          this.powerupsManager.applyToSnake(snake, pup.type);
          this.powerupsManager.remove(pup.id);

          // Inform client of powerup pickup
          const socket = this.sockets.get(snake.id);
          if (socket) {
            socket.emit('powerup_collected', { type: pup.type });
          }
        }
      }
    }
  }

  checkCollisions() {
    const allSnakes = Array.from(this.snakes.values());

    for (let i = 0; i < allSnakes.length; i++) {
      const s1 = allSnakes[i];
      if (!s1.isAlive) continue;

      for (let j = 0; j < allSnakes.length; j++) {
        const s2 = allSnakes[j];
        if (!s2.isAlive) continue;

        // In Snake.io, a snake NEVER dies from its own body/tail!
        if (s1.id === s2.id) {
          continue;
        }

        // DUO CO-OP MODE: Humans never kill each other!
        if (this.mode === 'duo' && !s1.isBot && !s2.isBot) {
          continue;
        }

        const hitRadius = (s1.radius * 0.85 + (s2.radius || 15) * 0.85);
        const hitRadiusSq = hitRadius * hitRadius;

        // 1. Check head-to-head collision
        const headDistSq = (s1.x - s2.x) * (s1.x - s2.x) + (s1.y - s2.y) * (s1.y - s2.y);
        if (headDistSq < hitRadiusSq) {
          if (s1.buffs.shield > 0 && s2.buffs.shield > 0) {
            // Both shielded, bounce off
          } else if (s1.buffs.shield > 0) {
            this.killSnake(s2, s1);
            break;
          } else if (s2.buffs.shield > 0) {
            this.killSnake(s1, s2);
            break;
          } else {
            // Both die or smaller dies
            if (s1.mass < s2.mass) {
              this.killSnake(s1, s2);
              break;
            } else if (s2.mass < s1.mass) {
              this.killSnake(s2, s1);
              break;
            } else {
              this.killSnake(s1, s2);
              this.killSnake(s2, s1);
              break;
            }
          }
        }

        // 2. Check if head of s1 hits ANY body segment capsule of s2
        // Rule: If head of s1 touches body of s2 -> s1 DIES IMMEDIATELY! s2 lives!
        let killed = false;
        const segs = s2.segments;

        for (let segIdx = 1; segIdx < segs.length; segIdx++) {
          const seg1 = segs[segIdx - 1];
          const seg2 = segs[segIdx];

          const dSq = distToSegmentSquared(s1.x, s1.y, seg1.x, seg1.y, seg2.x, seg2.y);
          if (dSq < hitRadiusSq) {
            if (s1.buffs.shield > 0) {
              // Shield protects s1 from body death
              break;
            }

            // Head of s1 crashed into body of s2 -> s1 dies!
            this.killSnake(s1, s2);
            killed = true;
            break;
          }
        }

        if (killed) break;
      }
    }
  }

  killSnake(victim, killer) {
    if (!victim.isAlive) return;
    victim.kill();

    if (victim.isBot) {
      this.botAI.cleanup(victim.id);
    }

    if (killer && killer.id !== victim.id) {
      killer.kills = (killer.kills || 0) + 1;
      killer.score += 150;
    }

    // Convert victim body into dense sweet candy treats (Snake.io authentic)
    for (let i = 0; i < victim.segments.length; i++) {
      const seg = victim.segments[i];
      const scatterX = seg.x + (Math.random() - 0.5) * 6;
      const scatterY = seg.y + (Math.random() - 0.5) * 6;
      this.spawnFood(scatterX, scatterY, 4, true);
    }

    // Notify human victim socket of death
    const socket = this.sockets.get(victim.id);
    if (socket) {
      socket.emit('player_died', {
        killerName: killer ? killer.name : 'Vật cản',
        finalScore: victim.score,
        kills: victim.kills
      });
    }
  }

  broadcastSnapshot() {
    if (this.sockets.size === 0) return;

    const snakesSnapshot = [];
    const leaderboard = [];

    for (const s of this.snakes.values()) {
      if (s.isAlive) {
        snakesSnapshot.push(s.getSnapshot());
        leaderboard.push({
          id: s.id,
          name: s.name,
          score: s.score,
          isHuman: !s.isBot,
          isHost: s.isHost
        });
      }
    }

    leaderboard.sort((a, b) => b.score - a.score);
    const topLeaderboard = leaderboard.slice(0, 10);
    const powerups = this.powerupsManager.getAll();

    // Broadcast tailored, culled snapshot to each human socket
    const viewRadius = 1400; // Covers max view area + zoom buffer

    for (const [socketId, socket] of this.sockets) {
      const me = this.snakes.get(socketId);
      const myX = me ? me.x : 0;
      const myY = me ? me.y : 0;

      // Query nearby food using spatial grid for blazing O(1) performance
      const nearbyFoods = this.foodGrid.queryRadius(myX, myY, viewRadius);
      const foodList = nearbyFoods.map(f => ({
        id: f.id,
        x: f.x,
        y: f.y,
        v: f.value,
        c: f.color,
        s: f.isSweet ? 1 : 0
      }));

      socket.emit('game_tick', {
        t: Date.now(),
        arenaRadius: this.arenaRadius,
        mode: this.mode,
        code: this.code,
        me: me && me.isAlive ? me.getSnapshot() : null,
        snakes: snakesSnapshot,
        food: foodList,
        powerups,
        leaderboard: topLeaderboard
      });
    }
  }
}
