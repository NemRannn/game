import { getSkinById } from './skins.js';

export class GameRenderer {
  constructor(canvas, minimapCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.minimapCanvas = minimapCanvas;
    this.minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera = { x: 0, y: 0, zoom: 1 };
    this.targetZoom = 1;

    this.particles = [];
    this.blinkTimer = 0;
    this.isBlinking = false;

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());
  }

  initCanvasSize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.minimapCanvas) {
      const miniSize = 120;
      this.minimapCanvas.width = miniSize * this.dpr;
      this.minimapCanvas.height = miniSize * this.dpr;
      this.minimapCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  }

  addParticle(x, y, color, size = 6, speed = 2) {
    const angle = Math.random() * Math.PI * 2;
    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * (Math.random() * speed + 0.5),
      vy: Math.sin(angle) * (Math.random() * speed + 0.5),
      color,
      size,
      alpha: 1,
      life: 1,
      decay: 0.03 + Math.random() * 0.02
    });
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(gameState, myId) {
    if (!gameState) return;

    const me = gameState.me;
    const arenaRadius = gameState.arenaRadius || 2200;

    // 1. Camera follow & zoom
    if (me) {
      this.camera.x += (me.x - this.camera.x) * 0.12;
      this.camera.y += (me.y - this.camera.y) * 0.12;

      // Base zoom scales with mass, Vision powerup zooms out wider
      let baseZoom = Math.max(0.65, 1.05 - Math.sqrt(me.mass || 15) * 0.02);
      if (me.buffs && me.buffs.vision) {
        baseZoom *= 0.75;
      }
      this.targetZoom = baseZoom;
      this.camera.zoom += (this.targetZoom - this.camera.zoom) * 0.08;
    }

    // Blinking timer for cute anime eyes
    this.blinkTimer++;
    if (this.blinkTimer > 180) {
      this.isBlinking = true;
      if (this.blinkTimer > 192) {
        this.isBlinking = false;
        this.blinkTimer = Math.floor(Math.random() * 60);
      }
    }

    const ctx = this.ctx;
    ctx.save();
    // Fill background
    ctx.fillStyle = '#22272e';
    ctx.fillRect(0, 0, this.width, this.height);

    // Camera view transform
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);

    // 2. Render Arena Grid & Border
    this.renderArena(ctx, arenaRadius);

    // 3. Render Food Orbs & Sweets
    this.renderFood(ctx, gameState.food);

    // 4. Render Power-up Capsules
    this.renderPowerups(ctx, gameState.powerups);

    // 5. Render All Snakes (sorted so dead/smaller render behind)
    const snakes = gameState.snakes || [];
    for (const snake of snakes) {
      this.renderSnake(ctx, snake, snake.id === myId, gameState.mode);
    }

    // 6. Render Particles
    this.renderParticles(ctx);

    ctx.restore();

    // 7. Render Minimap Radar
    this.renderMinimap(gameState, myId);
  }

  renderArena(ctx, radius) {
    // Subtle background grid
    const gridSize = 80;
    const left = this.camera.x - (this.width / 2) / this.camera.zoom;
    const right = this.camera.x + (this.width / 2) / this.camera.zoom;
    const top = this.camera.y - (this.height / 2) / this.camera.zoom;
    const bottom = this.camera.y + (this.height / 2) / this.camera.zoom;

    const startX = Math.floor(left / gridSize) * gridSize;
    const endX = Math.ceil(right / gridSize) * gridSize;
    const startY = Math.floor(top / gridSize) * gridSize;
    const endY = Math.ceil(bottom / gridSize) * gridSize;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
    }
    ctx.stroke();

    // Arena boundary circle with cute glowing gradient
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff7675';
    ctx.lineWidth = 14;
    ctx.shadowColor = '#ff7675';
    ctx.shadowBlur = 25;
    ctx.stroke();

    // Outer boundary danger stripes
    ctx.beginPath();
    ctx.arc(0, 0, radius + 20, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 118, 117, 0.3)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  renderFood(ctx, foodList) {
    if (!foodList) return;
    const now = Date.now() * 0.004;

    for (const f of foodList) {
      const bob = Math.sin(now + (f.x * 0.05 + f.y * 0.05)) * 1.5;
      const r = (f.s ? 9 : 4.5) + bob;

      ctx.save();
      ctx.fillStyle = f.c || '#ff7675';
      ctx.shadowColor = f.c || '#ff7675';
      ctx.shadowBlur = f.s ? 15 : 6;

      ctx.beginPath();
      ctx.arc(f.x, f.y, Math.max(2, r), 0, Math.PI * 2);
      ctx.fill();

      // Shiny center highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(f.x - r * 0.3, f.y - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // If it's a sweet candy from dead snake, draw tiny star sparkle
      if (f.s) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨', f.x, f.y - 10);
      }
      ctx.restore();
    }
  }

  renderPowerups(ctx, powerups) {
    if (!powerups) return;
    const now = Date.now() * 0.003;

    for (const pup of powerups) {
      const bob = Math.sin(now * 2 + pup.x) * 4;
      const y = pup.y + bob;

      ctx.save();
      // Glowing halo
      ctx.beginPath();
      ctx.arc(pup.x, y, pup.radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = pup.color || '#48dbfb';
      ctx.shadowColor = pup.color || '#48dbfb';
      ctx.shadowBlur = 20;
      ctx.globalAlpha = 0.4 + Math.sin(now * 3) * 0.2;
      ctx.fill();

      // Capsule circle
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(pup.x, y, pup.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = pup.color || '#48dbfb';
      ctx.stroke();

      // Emoji icon
      ctx.font = '18px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pup.icon || '⭐', pup.x, y);
      ctx.restore();
    }
  }

  renderSnake(ctx, snake, isMe, gameMode) {
    const skin = getSkinById(snake.skin);
    const segs = snake.segments;
    if (!segs || segs.length === 0) return;

    const head = segs[0];
    const r = snake.radius || 14;

    // 1. Draw Body Segments (from tail to head)
    for (let i = segs.length - 1; i >= 1; i--) {
      const seg = segs[i];
      const taper = 0.85 + (1 - i / segs.length) * 0.15;
      const segR = r * taper;

      ctx.save();
      // Segment body color with alternating pattern
      if (skin.pattern === 'rings' && i % 4 < 2) {
        ctx.fillStyle = skin.secondaryColor;
      } else if (skin.pattern === 'rainbow_gradient') {
        const hue = (i * 12 + Date.now() * 0.05) % 360;
        ctx.fillStyle = `hsl(${hue}, 85%, 65%)`;
      } else {
        ctx.fillStyle = (i % 2 === 0) ? skin.bodyColor : skin.primaryColor;
      }

      ctx.beginPath();
      ctx.arc(seg.x, seg.y, segR, 0, Math.PI * 2);
      ctx.fill();

      // Cute inner highlight / pattern
      if (skin.pattern === 'seeds' && i % 3 === 0) {
        // Yellow strawberry seed
        ctx.fillStyle = '#ffeaa7';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (skin.pattern === 'boba_pearls' && i % 3 === 0) {
        // Tapioca black pearl
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 2. Draw Snake Head
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(snake.angle);

    // Boost effect trail
    if (snake.isBoosting) {
      this.addParticle(
        head.x - Math.cos(snake.angle) * r,
        head.y - Math.sin(snake.angle) * r,
        skin.primaryColor,
        4 + Math.random() * 4,
        3
      );
    }

    // Head base circle
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
    ctx.fill();

    // Ears / Accessories
    this.renderEars(ctx, skin, r);

    // Anime Eyes
    this.renderAnimeEyes(ctx, skin, r, snake.isBoosting);

    // Blushing Cheeks
    ctx.fillStyle = skin.blushColor || '#ff7675';
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.ellipse(r * 0.1, -r * 0.65, r * 0.22, r * 0.35, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.1, r * 0.65, r * 0.22, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Shield Aura
    if (snake.buffs && snake.buffs.shield) {
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      ctx.strokeStyle = '#48dbfb';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#48dbfb';
      ctx.shadowBlur = 18;
      ctx.stroke();
    }

    ctx.restore();

    // 3. Floating Name & Icon above Head
    ctx.save();
    ctx.font = 'bold 13px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    let tag = snake.name;
    let nameColor = '#ffffff';

    if (isMe) {
      tag = '⭐ ' + snake.name;
      nameColor = '#ffeaa7';
    } else if (!snake.isBot) {
      tag = (gameMode === 'duo' ? '💕 ' : '❤️ ') + snake.name;
      nameColor = '#ff7675';
    } else if (snake.isHost) {
      tag = '👑 ' + snake.name;
    }

    // Name background pill
    const textWidth = ctx.measureText(tag).width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect(head.x - textWidth / 2 - 6, head.y - r - 26, textWidth + 12, 18, 8);
    ctx.fill();

    ctx.fillStyle = nameColor;
    ctx.fillText(tag, head.x, head.y - r - 12);
    ctx.restore();
  }

  renderEars(ctx, skin, r) {
    if (skin.earType === 'cat') {
      // Pointed pink cat ears
      [-1, 1].forEach(side => {
        ctx.fillStyle = skin.primaryColor;
        ctx.beginPath();
        ctx.moveTo(-r * 0.2, side * r * 0.5);
        ctx.lineTo(-r * 0.6, side * r * 1.15);
        ctx.lineTo(r * 0.3, side * r * 0.9);
        ctx.closePath();
        ctx.fill();

        // Inner pink ear
        ctx.fillStyle = '#ffb8b8';
        ctx.beginPath();
        ctx.moveTo(-r * 0.25, side * r * 0.6);
        ctx.lineTo(-r * 0.5, side * r * 1.05);
        ctx.lineTo(r * 0.15, side * r * 0.85);
        ctx.closePath();
        ctx.fill();
      });
    } else if (skin.earType === 'panda') {
      // Round black panda ears
      [-1, 1].forEach(side => {
        ctx.fillStyle = '#2f3542';
        ctx.beginPath();
        ctx.arc(-r * 0.2, side * r * 0.95, r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (skin.earType === 'corgi') {
      // Tall perky corgi ears
      [-1, 1].forEach(side => {
        ctx.fillStyle = skin.primaryColor;
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, side * r * 0.95, r * 0.25, r * 0.55, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, side * r * 0.95, r * 0.15, r * 0.35, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (skin.earType === 'strawberry_leaf') {
      // Green strawberry crown leaf
      ctx.fillStyle = '#2ed573';
      ctx.beginPath();
      ctx.ellipse(-r * 0.6, 0, r * 0.45, r * 0.25, 0, 0, Math.PI * 2);
      ctx.ellipse(-r * 0.5, -r * 0.4, r * 0.35, r * 0.2, -0.5, 0, Math.PI * 2);
      ctx.ellipse(-r * 0.5, r * 0.4, r * 0.35, r * 0.2, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderAnimeEyes(ctx, skin, r, isBoosting) {
    const eyeOffsetX = r * 0.35;
    const eyeOffsetY = r * 0.45;
    const eyeR = r * 0.36;

    [-1, 1].forEach(side => {
      const ey = side * eyeOffsetY;

      if (this.isBlinking) {
        // Blinking line ^_^
        ctx.strokeStyle = skin.eyeColor || '#2d3436';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(eyeOffsetX, ey, eyeR * 0.8, side > 0 ? 0.2 : -Math.PI + 0.2, side > 0 ? Math.PI - 0.2 : -0.2);
        ctx.stroke();
        return;
      }

      if (isBoosting) {
        // Squinted energetic eye (>_<)
        ctx.strokeStyle = skin.eyeColor || '#2d3436';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(eyeOffsetX - eyeR * 0.5, ey - side * eyeR * 0.5);
        ctx.lineTo(eyeOffsetX + eyeR * 0.6, ey);
        ctx.lineTo(eyeOffsetX - eyeR * 0.5, ey + side * eyeR * 0.5);
        ctx.stroke();
        return;
      }

      // Big anime eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeOffsetX, ey, eyeR, 0, Math.PI * 2);
      ctx.fill();

      // Iris
      ctx.fillStyle = skin.eyeColor || '#2d3436';
      ctx.beginPath();
      ctx.arc(eyeOffsetX + 1.5, ey, eyeR * 0.72, 0, Math.PI * 2);
      ctx.fill();

      // Sparkling shine highlight (top-left)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeOffsetX + 2.5, ey - eyeR * 0.25, eyeR * 0.32, 0, Math.PI * 2);
      ctx.fill();

      // Secondary smaller shine dot (bottom-right)
      ctx.beginPath();
      ctx.arc(eyeOffsetX + 0.5, ey + eyeR * 0.25, eyeR * 0.16, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderParticles(ctx) {
    this.updateParticles();
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderMinimap(gameState, myId) {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const size = 120;
    const center = size / 2;
    const scale = (size / 2 - 4) / (gameState.arenaRadius || 2200);

    ctx.clearRect(0, 0, size, size);

    // Arena boundary
    ctx.beginPath();
    ctx.arc(center, center, center - 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 118, 117, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Snakes dots
    const snakes = gameState.snakes || [];
    for (const s of snakes) {
      const mx = center + s.x * scale;
      const my = center + s.y * scale;

      ctx.beginPath();
      if (s.id === myId) {
        // Player: glowing yellow dot
        ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#feca57';
        ctx.fill();
      } else if (!s.isBot) {
        // Partner: pulsing pink dot
        ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4757';
        ctx.fill();
      } else {
        // Bot: small grey/blue dot
        ctx.arc(mx, my, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      }
    }
  }
}

