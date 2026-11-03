/**
 * Authoritative Snake Entity for server simulation.
 */
export class Snake {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this.id = options.id || Math.random().toString(36).substring(2, 9);
    this.name = options.name || 'Bé Rắn';
    this.skin = options.skin || 'cat';
    this.isBot = !!options.isBot;
    this.botType = options.botType || 'casual'; // 'casual' | 'hunter'
    this.isHost = !!options.isHost;

    this.x = options.x || 0;
    this.y = options.y || 0;
    this.angle = options.angle || 0;
    this.targetAngle = this.angle;

    this.isAlive = true;
    this.isBoosting = false;

    // Mass & Score
    this.mass = options.mass || 15;
    this.score = 0;
    this.kills = 0;

    // Movement parameters
    this.baseSpeed = 4.2;
    this.boostSpeed = 8.4;
    this.turnRate = 0.12; // Max angle delta per tick (~30Hz)
    this.segmentSpacing = 7; // Distance between recorded segment nodes
    this.radius = 14;

    // Active power-up durations in ticks (~30 ticks/s)
    this.buffs = {
      magnet: 0,
      shield: 0,
      speed: 0,
      double: 0,
      vision: 0
    };

    // Body segments array: [{x, y}]
    this.segments = [];
    const initialSegmentsCount = 18;
    for (let i = 0; i < initialSegmentsCount; i++) {
      this.segments.push({
        x: this.x - Math.cos(this.angle) * (i * this.segmentSpacing),
        y: this.y - Math.sin(this.angle) * (i * this.segmentSpacing)
      });
    }

    // Boost drop counter
    this.boostDropCounter = 0;
  }

  get targetSegmentsCount() {
    return Math.floor(18 + this.mass * 1.5);
  }

  updateRadius() {
    this.radius = Math.min(32, 14 + Math.sqrt(this.mass) * 0.5);
  }

  /**
   * Advance snake physics by 1 tick (~1/30th second).
   * @param {number} targetAngle Target orientation angle (-PI to PI)
   * @param {boolean} wantsBoost True if player/bot requests boost
   * @param {number} arenaRadius Radius of circular arena
   * @returns {Array<Object>} Dropped orbs if boosting
   */
  update(targetAngle, wantsBoost, arenaRadius = 2500) {
    if (!this.isAlive) return [];

    const droppedOrbs = [];

    // Smooth turn towards target angle
    this.targetAngle = targetAngle;
    let diff = this.targetAngle - this.angle;
    // Normalize diff to [-PI, PI]
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    const maxTurn = this.turnRate;
    if (Math.abs(diff) < maxTurn) {
      this.angle = this.targetAngle;
    } else {
      this.angle += Math.sign(diff) * maxTurn;
    }

    // Boost conditions
    const hasSpeedBuff = this.buffs.speed > 0;
    this.isBoosting = (wantsBoost || hasSpeedBuff) && (this.mass > 12 || hasSpeedBuff);

    const currentSpeed = this.isBoosting ? this.boostSpeed : this.baseSpeed;

    // Move head
    this.x += Math.cos(this.angle) * currentSpeed;
    this.y += Math.sin(this.angle) * currentSpeed;

    // Arena boundary containment (Circular)
    const distFromCenter = Math.hypot(this.x, this.y);
    if (distFromCenter > arenaRadius) {
      const clampAngle = Math.atan2(this.y, this.x);
      this.x = Math.cos(clampAngle) * arenaRadius;
      this.y = Math.sin(clampAngle) * arenaRadius;
    }

    // Update body segments following head with distance constraint
    this.segments[0] = { x: this.x, y: this.y };
    for (let i = 1; i < this.segments.length; i++) {
      const prev = this.segments[i - 1];
      const curr = this.segments[i];
      const dx = prev.x - curr.x;
      const dy = prev.y - curr.y;
      const dist = Math.hypot(dx, dy);

      if (dist > this.segmentSpacing) {
        const factor = (dist - this.segmentSpacing) / dist;
        curr.x += dx * factor;
        curr.y += dy * factor;
      }
    }

    // Manage length/mass scaling
    const targetCount = this.targetSegmentsCount;
    if (this.segments.length < targetCount) {
      const tail = this.segments[this.segments.length - 1];
      this.segments.push({ x: tail.x, y: tail.y });
    } else if (this.segments.length > targetCount && this.segments.length > 18) {
      this.segments.pop();
    }

    // Boost mass drop (unless has Speed Surge buff)
    if (this.isBoosting && !hasSpeedBuff) {
      this.boostDropCounter++;
      if (this.boostDropCounter >= 4) {
        this.boostDropCounter = 0;
        this.mass = Math.max(10, this.mass - 0.4);
        const tail = this.segments[this.segments.length - 1];
        droppedOrbs.push({
          x: tail.x + (Math.random() - 0.5) * 8,
          y: tail.y + (Math.random() - 0.5) * 8,
          value: 1,
          color: '#ff9ff3',
          radius: 5
        });
      }
    }

    // Tick buffs down
    for (const buff in this.buffs) {
      if (this.buffs[buff] > 0) {
        this.buffs[buff]--;
      }
    }

    this.updateRadius();
    this.score = Math.floor(this.mass * 10 + this.kills * 100);

    return droppedOrbs;
  }

  grow(amount) {
    const multiplier = this.buffs.double > 0 ? 2 : 1;
    this.mass += amount * multiplier;
    this.updateRadius();
  }

  kill() {
    this.isAlive = false;
  }

  getSnapshot() {
    return {
      id: this.id,
      name: this.name,
      skin: this.skin,
      isBot: this.isBot,
      isHost: this.isHost,
      x: Math.round(this.x * 10) / 10,
      y: Math.round(this.y * 10) / 10,
      angle: Math.round(this.angle * 100) / 100,
      isBoosting: this.isBoosting,
      radius: Math.round(this.radius),
      mass: Math.round(this.mass),
      score: this.score,
      buffs: {
        shield: this.buffs.shield > 0,
        magnet: this.buffs.magnet > 0,
        speed: this.buffs.speed > 0,
        double: this.buffs.double > 0,
        vision: this.buffs.vision > 0
      },
      segments: this.segments.map(s => ({
        x: Math.round(s.x * 10) / 10,
        y: Math.round(s.y * 10) / 10
      }))
    };
  }
}
