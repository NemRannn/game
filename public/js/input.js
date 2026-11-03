/**
 * Multi-Touch and Mouse/Keyboard Input Controller with Authentic Snake.io Floating Joystick.
 * - Floating joystick: Touching anywhere spawns a joystick under your thumb.
 * - 2nd finger anywhere on screen triggers Boost!
 * - PC: Mouse steering + Left/Right click or Space to Boost.
 */
export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;

    this.targetAngle = 0;
    this.isBoosting = false;

    // Floating Virtual Joystick state (Snake.io style)
    this.joystick = {
      active: false,
      startX: 0,
      startY: 0,
      currX: 0,
      currY: 0,
      radius: 55
    };

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
      if (!this.joystick.active) {
        this.updateMouseAngle();
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (e.target.closest && e.target.closest('.interactive')) return;
      if (e.button === 0 || e.button === 2) {
        this.isBoosting = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.isBoosting = false;
      }
    });

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
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

    window.addEventListener('blur', () => {
      this.isBoosting = false;
      this.joystick.active = false;
      this.steerTouchId = null;
      this.boostTouchId = null;
    });

    // 3. Multi-Touch Controls with Floating Joystick
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
        if (navigator.vibrate) navigator.vibrate(20);
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
        // Finger 1 spawns floating virtual joystick under thumb
        this.steerTouchId = touch.identifier;
        this.joystick.active = true;
        this.joystick.startX = touch.clientX;
        this.joystick.startY = touch.clientY;
        this.joystick.currX = touch.clientX;
        this.joystick.currY = touch.clientY;
      } else if (this.boostTouchId === null) {
        // Finger 2 anywhere on screen triggers boost!
        this.boostTouchId = touch.identifier;
        this.isBoosting = true;
        if (navigator.vibrate) navigator.vibrate(25);
      }
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.steerTouchId && this.joystick.active) {
        const dx = touch.clientX - this.joystick.startX;
        const dy = touch.clientY - this.joystick.startY;
        const dist = Math.hypot(dx, dy);

        // Calculate steer angle
        if (dist > 8) {
          this.targetAngle = Math.atan2(dy, dx);
        }

        // Clamp knob within joystick radius for visual rendering
        const clampedDist = Math.min(dist, this.joystick.radius);
        const angle = Math.atan2(dy, dx);
        this.joystick.currX = this.joystick.startX + Math.cos(angle) * clampedDist;
        this.joystick.currY = this.joystick.startY + Math.sin(angle) * clampedDist;
      }
    }
  }

  handleTouchEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === this.boostTouchId) {
        this.boostTouchId = null;
        this.isBoosting = false;
      }

      if (touch.identifier === this.steerTouchId) {
        this.steerTouchId = null;
        this.joystick.active = false;

        // If boost finger still held, transfer it to steer
        if (this.boostTouchId !== null) {
          this.steerTouchId = this.boostTouchId;
          this.boostTouchId = null;
          this.isBoosting = false;
          // Spawn joystick at second finger's current spot
          this.joystick.active = true;
          this.joystick.startX = touch.clientX;
          this.joystick.startY = touch.clientY;
          this.joystick.currX = touch.clientX;
          this.joystick.currY = touch.clientY;
        }
      }
    }
  }

  getInput() {
    return {
      angle: Math.round(this.targetAngle * 100) / 100,
      boost: this.isBoosting
    };
  }
}
