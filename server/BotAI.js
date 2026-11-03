/**
 * AI Logic for Casual and Smart Hunter Bot Snakes.
 */
export class BotAI {
  constructor() {
    this.botMemories = new Map();
  }

  /**
   * Compute decision for a bot snake.
   * @param {Snake} bot
   * @param {Object} roomState
   * @returns {{ targetAngle: number, wantsBoost: boolean }}
   */
  computeDecision(bot, roomState) {
    if (!bot.isAlive) {
      return { targetAngle: bot.angle, wantsBoost: false };
    }

    const { arenaRadius, snakes, foodGrid } = roomState;
    const distToCenter = Math.hypot(bot.x, bot.y);

    // 1. Critical Boundary Avoidance: steer inward when near arena border
    if (distToCenter > arenaRadius * 0.8) {
      const angleToCenter = Math.atan2(-bot.y, -bot.x);
      return {
        targetAngle: angleToCenter,
        wantsBoost: distToCenter > arenaRadius * 0.92
      };
    }

    // 2. Body Obstacle Avoidance (Raycast cone in front of head)
    const lookAheadDist = bot.isBoosting ? 120 : 80;
    const frontX = bot.x + Math.cos(bot.angle) * lookAheadDist;
    const frontY = bot.y + Math.sin(bot.angle) * lookAheadDist;

    for (const other of snakes) {
      if (!other.isAlive) continue;

      // Check segments (skip own first 3 segments)
      const startIdx = (other.id === bot.id) ? 4 : 0;
      for (let i = startIdx; i < other.segments.length; i += 2) {
        const seg = other.segments[i];
        const dist = Math.hypot(frontX - seg.x, frontY - seg.y);
        if (dist < (bot.radius + (other.radius || 14) + 15)) {
          // Dangerous obstacle ahead! Evade sideways
          const awayAngle = Math.atan2(bot.y - seg.y, bot.x - seg.x);
          return {
            targetAngle: awayAngle,
            wantsBoost: false
          };
        }
      }
    }

    // 3. Smart Hunter Behavior
    if (bot.botType === 'hunter') {
      // Find nearby prey snake that is smaller
      let nearestPrey = null;
      let minPreyDist = 600;

      for (const other of snakes) {
        if (other.id === bot.id || !other.isAlive) continue;
        const d = Math.hypot(other.x - bot.x, other.y - bot.y);
        if (d < minPreyDist && other.mass < bot.mass * 1.3) {
          minPreyDist = d;
          nearestPrey = other;
        }
      }

      if (nearestPrey) {
        // Predict prey position slightly ahead to intercept and cut them off
        const leadDist = minPreyDist * 0.35;
        const predictX = nearestPrey.x + Math.cos(nearestPrey.angle) * leadDist;
        const predictY = nearestPrey.y + Math.sin(nearestPrey.angle) * leadDist;
        const interceptAngle = Math.atan2(predictY - bot.y, predictX - bot.x);

        // Boost if close enough to execute a cut-off move
        const wantsBoost = minPreyDist < 300 && bot.mass > 18;
        return {
          targetAngle: interceptAngle,
          wantsBoost
        };
      }
    }

    // 4. Food Seeking (for Casual bot or Hunter without target)
    if (foodGrid && typeof foodGrid.queryRadius === 'function') {
      const nearbyFood = foodGrid.queryRadius(bot.x, bot.y, 250);
      if (nearbyFood && nearbyFood.length > 0) {
        // Pick food item with highest value or closest distance
        let bestFood = null;
        let bestScore = -Infinity;

        for (const f of nearbyFood) {
          const d = Math.hypot(f.x - bot.x, f.y - bot.y);
          const score = (f.value || 1) * 50 - d;
          if (score > bestScore) {
            bestScore = score;
            bestFood = f;
          }
        }

        if (bestFood) {
          const foodAngle = Math.atan2(bestFood.y - bot.y, bestFood.x - bot.x);
          return {
            targetAngle: foodAngle,
            wantsBoost: false
          };
        }
      }
    }

    // 5. Default Gentle Wandering
    let memory = this.botMemories.get(bot.id);
    if (!memory || Date.now() > memory.nextChange) {
      memory = {
        angleBias: bot.angle + (Math.random() - 0.5) * 1.2,
        nextChange: Date.now() + 1500 + Math.random() * 2000
      };
      this.botMemories.set(bot.id, memory);
    }

    return {
      targetAngle: memory.angleBias,
      wantsBoost: false
    };
  }

  cleanup(botId) {
    this.botMemories.delete(botId);
  }
}

