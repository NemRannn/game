/**
 * Multi-Touch and Mouse/Keyboard Input Controller.
 * Special mechanic: Holding 2nd finger anywhere on screen triggers boost (Snake.io authentic).
 */
export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;

    this.targetAngle = 0;
    this.isBoosting = false;

    // Touch tracking: touchId -> { x, y }
    this.activeTouches = new Map();
    this.steerTouchId = null;
    this.boostTouchId = null;

    // Mouse tracking
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;

    this.initListeners();
  }

  initListeners() {
    // 1. Mouse steering & click boost
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.updateMouseAngle();
    });

    window.addEventListener('mousedown', (e) => {
      if (e.target.closest && e.target.closest('.interactive')) return;
      if (e.button === 0 || e.button === 2) { // Left or right click
        this.isBoosting = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.isBoosting = false;
      }
    });

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // Prevent right-click context menu in game
    });

    // 2. Keyboard Spacebar boost & Arrow/WASD steering
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.isBoosting = true;
      }
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.targetAngle = -Math.PI / 2;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.targetAngle = Math.PI / 2;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.targetAngle = Math.PI;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.targetAngle = 0;
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isBoosting = false;
      }
    });

    // Reset boost state if user switches tabs or windows
    window.addEventListener('blur', () => {
      this.isBoosting = false;
      this.activeTouches.clear();
      this.steerTouchId = null;
      this.boostTouchId = null;
    });

    // 3. Multi-Touch Controls (Mobile & iPad)
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });

    // 4. On-screen Mobile Boost Button support
    const mobileBoostBtn = document.getElementById('mobile-boost-btn');
    if (mobileBoostBtn) {
      const startBtnBoost = (e) => {
        e.preventDefault();
        this.isBoosting = true;
        mobileBoostBtn.classList.add('active');
      };
      const endBtnBoost = (e) => {
        e.preventDefault();
        this.isBoosting = false;
        mobileBoostBtn.classList.remove('active');
      };

      mobileBoostBtn.addEventListener('touchstart', startBtnBoost, { passive: false });
      mobileBoostBtn.addEventListener('touchend', endBtnBoost, { passive: false });
      mobileBoostBtn.addEventListener('mousedown', startBtnBoost);
      mobileBoostBtn.addEventListener('mouseup', endBtnBoost);
    }
  }

  updateMouseAngle() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    this.targetAngle = Math.atan2(this.mouseY - cy, this.mouseX - cx);
  }

  handleTouchStart(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (this.steerTouchId === null) {
        // First finger controls steering direction
        this.steerTouchId = touch.identifier;
        this.updateSteerFromTouch(touch);
      } else if (this.boostTouchId === null) {
        // SECOND FINGER triggers boost! (authentic snake.io mechanic)
        this.boostTouchId = touch.identifier;
        this.isBoosting = true;
      }
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.steerTouchId) {
        this.updateSteerFromTouch(touch);
      }
    }
  }

  handleTouchEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === this.boostTouchId) {
        // Second finger released -> stop boosting
        this.boostTouchId = null;
        this.isBoosting = false;
      }

      if (touch.identifier === this.steerTouchId) {
        this.steerTouchId = null;

        // If the boost finger is still on screen, transfer it to steer
        if (this.boostTouchId !== null) {
          this.steerTouchId = this.boostTouchId;
          this.boostTouchId = null;
          this.isBoosting = false;
        }
      }
    }
  }

  updateSteerFromTouch(touch) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    this.targetAngle = Math.atan2(touch.clientY - cy, touch.clientX - cx);
  }

  getInput() {
    return {
      angle: Math.round(this.targetAngle * 100) / 100,
      boost: this.isBoosting
    };
  }
}

