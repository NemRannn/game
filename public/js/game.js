import { SKINS, getSkinById } from './skins.js';
import { GameRenderer } from './renderer.js';
import { InputManager } from './input.js';
import { audio } from './audio.js';

class GameApp {
  constructor() {
    this.socket = null;
    this.renderer = null;
    this.input = null;

    this.currentSkinIndex = 0;
    this.selectedMode = 'ffa';
    this.roomCode = null;
    this.myId = null;

    this.gameState = null;
    this.lastMass = 0;

    this.fps = 60;
    this.ping = 20;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fpsTimer = performance.now();

    this.initDOM();
    this.initSkinPreview();
    this.initEventListeners();
    this.checkUrlParams();
  }

  initDOM() {
    this.canvas = document.getElementById('game-canvas');
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.hudLayer = document.getElementById('hud-layer');
    this.lobbyModal = document.getElementById('lobby-modal');
    this.joinModal = document.getElementById('join-modal');
    this.gameoverModal = document.getElementById('gameover-modal');

    this.nameInput = document.getElementById('player-name-input');
    const savedName = localStorage.getItem('snakecute_name') || '';
    if (savedName) this.nameInput.value = savedName;

    this.renderer = new GameRenderer(this.canvas, this.minimapCanvas);
    this.input = new InputManager(this.canvas);
  }

  initSkinPreview() {
    const previewCanvas = document.getElementById('skin-preview-canvas');
    if (!previewCanvas) return;
    const ctx = previewCanvas.getContext('2d');
    const skin = SKINS[this.currentSkinIndex];

    ctx.clearRect(0, 0, 110, 110);
    ctx.save();
    ctx.translate(55, 55);

    // Body segments preview
    for (let i = 4; i >= 1; i--) {
      ctx.beginPath();
      ctx.arc(-i * 9, Math.sin(i * 0.8) * 6, 12, 0, Math.PI * 2);
      ctx.fillStyle = (i % 2 === 0) ? skin.bodyColor : skin.primaryColor;
      ctx.fill();
    }

    // Head circle
    ctx.beginPath();
    ctx.arc(6, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = skin.primaryColor;
    ctx.fill();

    // Ears / Accessories
    if (skin.earType === 'cat') {
      [-1, 1].forEach(side => {
        ctx.fillStyle = skin.primaryColor;
        ctx.beginPath();
        ctx.moveTo(0, side * 8);
        ctx.lineTo(-8, side * 18);
        ctx.lineTo(8, side * 14);
        ctx.closePath();
        ctx.fill();
      });
    } else if (skin.earType === 'panda') {
      [-1, 1].forEach(side => {
        ctx.fillStyle = '#2f3542';
        ctx.beginPath();
        ctx.arc(-2, side * 15, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Anime Eyes
    [-1, 1].forEach(side => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, side * 7, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = skin.eyeColor || '#2d3436';
      ctx.beginPath();
      ctx.arc(12, side * 7, 3.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(13.5, side * 7 - 1.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Blushing cheeks
    ctx.fillStyle = skin.blushColor || '#ff7675';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(7, -10, 3.5, 0, Math.PI * 2);
    ctx.arc(7, 10, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Update text badge
    document.getElementById('skin-name-display').textContent = `${skin.name} ${skin.emoji}`;
    document.getElementById('skin-desc-display').textContent = skin.description;
  }

  initEventListeners() {
    // Skin Carousel navigation
    document.getElementById('skin-prev-btn').addEventListener('click', () => {
      this.currentSkinIndex = (this.currentSkinIndex - 1 + SKINS.length) % SKINS.length;
      this.initSkinPreview();
    });
    document.getElementById('skin-next-btn').addEventListener('click', () => {
      this.currentSkinIndex = (this.currentSkinIndex + 1) % SKINS.length;
      this.initSkinPreview();
    });

    // Mode buttons
    const ffaBtn = document.getElementById('mode-ffa-btn');
    const duoBtn = document.getElementById('mode-duo-btn');
    ffaBtn.addEventListener('click', () => {
      this.selectedMode = 'ffa';
      ffaBtn.classList.add('active');
      duoBtn.classList.remove('active');
    });
    duoBtn.addEventListener('click', () => {
      this.selectedMode = 'duo';
      duoBtn.classList.add('active');
      ffaBtn.classList.remove('active');
    });

    // Create Room Button
    document.getElementById('btn-create-room').addEventListener('click', () => {
      this.startConnection('create', null);
    });

    // Quick Play Button
    document.getElementById('btn-quick-play').addEventListener('click', () => {
      this.startConnection('quick', null);
    });

    // Open Join Modal Button
    document.getElementById('btn-open-join').addEventListener('click', () => {
      this.lobbyModal.classList.add('hidden');
      this.joinModal.classList.remove('hidden');
      document.getElementById('join-code-input').focus();
    });

    // Join Modal Actions
    document.getElementById('btn-back-lobby').addEventListener('click', () => {
      this.joinModal.classList.add('hidden');
      this.lobbyModal.classList.remove('hidden');
    });

    document.getElementById('btn-confirm-join').addEventListener('click', () => {
      const code = document.getElementById('join-code-input').value.trim();
      if (!code || code.length !== 6) {
        alert('Vui lòng nhập đúng mã phòng gồm 6 chữ số nhé!');
        return;
      }
      this.startConnection('join', code);
    });

    // Copy Room Link Badge Click
    document.getElementById('room-code-badge').addEventListener('click', () => {
      if (!this.roomCode) return;
      const shareUrl = `${window.location.origin}/?room=${this.roomCode}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          this.showToast(`Đã sao chép link phòng: ${this.roomCode} 💕`);
        }).catch(() => {
          this.showToast(`Mã phòng: ${this.roomCode}`);
        });
      } else {
        prompt('Sao chép mã phòng hoặc link:', shareUrl);
      }
    });

    // Game Over Actions
    document.getElementById('btn-respawn').addEventListener('click', () => {
      if (!this.socket) return;
      const playerName = this.getPlayerName();
      const skinId = SKINS[this.currentSkinIndex].id;

      this.socket.emit('respawn_request', { name: playerName, skin: skinId }, (res) => {
        if (res && res.success) {
          this.gameoverModal.classList.add('hidden');
        }
      });
    });

    document.getElementById('btn-exit-to-lobby').addEventListener('click', () => {
      window.location.href = window.location.pathname;
    });

    // Start render animation frame loop
    requestAnimationFrame((t) => this.renderLoop(t));
  }

  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl && /^\d{6}$/.test(roomFromUrl.trim())) {
      document.getElementById('join-code-input').value = roomFromUrl.trim();
      this.lobbyModal.classList.add('hidden');
      this.joinModal.classList.remove('hidden');
    }
  }

  getPlayerName() {
    const name = this.nameInput.value.trim() || 'Bé Yêu';
    localStorage.setItem('snakecute_name', name);
    return name;
  }

  startConnection(action, roomCode) {
    const playerName = this.getPlayerName();
    const skinId = SKINS[this.currentSkinIndex].id;

    if (!window.io) {
      alert('Đang kết nối tới máy chủ, bạn chờ giây lát nhé!');
      return;
    }

    if (!this.socket) {
      this.socket = window.io();
      this.setupSocketEvents();
    }

    const payload = {
      name: playerName,
      skin: skinId,
      mode: this.selectedMode,
      code: roomCode
    };

    if (action === 'create') {
      this.socket.emit('create_room', payload, (res) => this.onJoinedRoom(res));
    } else if (action === 'join') {
      this.socket.emit('join_room', payload, (res) => {
        if (res && res.success) {
          this.onJoinedRoom(res);
        } else {
          alert(res?.message || 'Không thể vào phòng!');
        }
      });
    } else if (action === 'quick') {
      this.socket.emit('create_room', { ...payload, mode: 'ffa', botCount: 10 }, (res) => this.onJoinedRoom(res));
    }
  }

  onJoinedRoom(res) {
    if (!res || !res.success) return;

    this.roomCode = res.code;
    this.selectedMode = res.mode;
    this.myId = this.socket.id;

    // Hide modals & show HUD
    this.lobbyModal.classList.add('hidden');
    this.joinModal.classList.add('hidden');
    this.hudLayer.style.display = 'block';

    document.getElementById('hud-room-code').textContent = this.roomCode;
    document.getElementById('hud-mode-text').textContent =
      this.selectedMode === 'duo' ? '💕 Cặp Đôi (Duo)' : '⚔️ Cạnh Tranh (FFA)';

    // Start 30Hz input send loop
    setInterval(() => {
      if (this.socket && this.input) {
        this.socket.emit('player_input', this.input.getInput());
      }
    }, 1000 / 30);
  }

  setupSocketEvents() {
    this.socket.on('game_tick', (state) => {
      this.gameState = state;

      // Audio feedback when mass increases (eating orbs)
      if (state.me) {
        if (this.lastMass > 0 && state.me.mass > this.lastMass + 0.2) {
          audio.playEat();
        }
        this.lastMass = state.me.mass;
        this.updateHUD(state);
      }
    });

    this.socket.on('powerup_collected', (data) => {
      audio.playPowerup();
      this.showToast(`Nhặt được vật phẩm: ${data.type.toUpperCase()}! ✨`);
    });

    this.socket.on('player_died', (data) => {
      audio.playDie();
      document.getElementById('gameover-reason').textContent = `Bạn đã bị ${data.killerName} chặn đầu!`;
      document.getElementById('gameover-score').textContent = data.finalScore || 0;
      document.getElementById('gameover-kills').textContent = data.kills || 0;
      this.gameoverModal.classList.remove('hidden');
    });

    this.socket.on('pong', (ms) => {
      this.ping = ms;
    });
  }

  updateHUD(state) {
    const me = state.me;
    if (!me) return;

    // Score & Length
    document.getElementById('hud-score').textContent = me.score;
    document.getElementById('hud-length').textContent = me.segments ? me.segments.length : 18;

    // Leaderboard
    const lbEl = document.getElementById('leaderboard-list');
    lbEl.innerHTML = '';
    const lb = state.leaderboard || [];

    lb.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'lb-item';
      if (item.id === this.myId) {
        li.classList.add('is-me');
      } else if (item.isHuman) {
        li.classList.add('is-partner');
      }

      const icon = item.id === this.myId ? '⭐' : (item.isHuman ? '❤️' : '•');
      li.innerHTML = `<span>${idx + 1}. ${icon} ${item.name}</span><span>${item.score}</span>`;
      lbEl.appendChild(li);
    });

    // Active Buffs container
    const buffsContainer = document.getElementById('hud-buffs-container');
    buffsContainer.innerHTML = '';
    const buffNames = {
      magnet: '🧲 Nam Châm',
      shield: '🛡️ Khiên Bảo Vệ',
      speed: '⚡ Siêu Tốc',
      double: '🌟 x2 Điểm',
      vision: '🔍 Viễn Vọng'
    };

    for (const b in me.buffs) {
      if (me.buffs[b]) {
        const pill = document.createElement('div');
        pill.className = 'buff-pill';
        pill.textContent = buffNames[b] || b;
        buffsContainer.appendChild(pill);
      }
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 118, 117, 0.95);
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 0.9rem;
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      z-index: 9999;
      pointer-events: none;
      animation: popIn 0.2s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2200);
  }

  renderLoop(time) {
    this.frameCount++;
    if (time - this.fpsTimer >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = time;
      const fpsPingEl = document.getElementById('hud-fps-ping');
      if (fpsPingEl) {
        fpsPingEl.textContent = `${this.fps} FPS | ${this.ping}ms`;
      }
    }

    if (this.renderer && this.gameState) {
      this.renderer.render(this.gameState, this.myId);
    }

    requestAnimationFrame((t) => this.renderLoop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});

