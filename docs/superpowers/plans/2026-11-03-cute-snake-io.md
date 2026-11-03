# Cute Multiplayer Snake.io ("SnakeCute.io") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a smooth, cartoon-cute multiplayer Snake.io web game supporting 6-digit private rooms with dual modes (FFA & Duo Co-op), smart/casual AI bots, power-ups, multi-touch controls (2nd finger boost), and 1-click free Render.com deployment.

**Architecture:** Monolithic Node.js + Express + Socket.io server running authoritative 30Hz game loops with spatial hash grid partitioning, serving a pure HTML5 Canvas 2D client with sub-pixel interpolation (60–120 FPS), multi-touch support, and procedural cute skin rendering.

**Tech Stack:** Node.js (v24), Express, Socket.io, Node.js native test runner (`node:test`), HTML5 Canvas 2D, Web Audio API, Vanilla JavaScript, CSS3 Glassmorphism.

**Spec:** [`docs/superpowers/specs/2026-11-03-cute-snake-io-design.md`](file:///c:/Game/docs/superpowers/specs/2026-11-03-cute-snake-io-design.md)

---

## Global Constraints

- **Platform:** Node.js >= 20.0.0; zero build-step frontend (runs directly from `public/`).
- **Room Code:** 6-digit numeric string (100000 to 999999).
- **Game Modes:** `ffa` (Competitive Free-For-All) and `duo` (Human Partner Co-op with no friendly fire).
- **Multi-Touch:** 2nd finger anywhere on screen triggers boost acceleration on mobile/tablet.
- **Port:** Configured via `process.env.PORT || 3000` for seamless Render.com deployment.
- **Git Remote:** `https://github.com/NamRannn/game.git`.

---

## Review Focus

1. **Simultaneous 2nd-finger touch:** On mobile browsers, touching a 2nd finger must reliably trigger boost and releasing it must stop boost without disrupting the 1st finger steering vector.
2. **Duo Co-op Collision Bypass:** When mode is `duo`, head-to-body collision between two human players must pass through cleanly without killing either snake.
3. **Room Code Collision & Re-join:** Two rooms must never share the same 6-digit code, and room codes must be case-insensitive/sanitized.
4. **Spatial Hash Query Edge Cases:** Snakes or food items exactly on grid cell boundaries or crossing the arena boundary must not trigger negative index errors or dropped collisions.
5. **Cold Disconnect / Empty Room Cleanup:** When all human players leave a room, the bot interval and tick loop must be properly cleared to prevent memory leaks on free hosting tiers.

---

## Task Decomposition

### Task 1: Project Scaffolding & Git Setup
**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Consumes: None
- Produces: Project package configuration with `npm start` and `npm test` scripts.

- [ ] **Step 1: Create `.gitignore` for Node.js**
- [ ] **Step 2: Create `package.json` with Express and Socket.io**
- [ ] **Step 3: Create `README.md` with features and Render.com 1-click deployment guide**
- [ ] **Step 4: Initialize Git repository and add remote `https://github.com/NamRannn/game.git`**
- [ ] **Step 5: Install dependencies via `npm install` and verify `npm test` runs**

---

### Task 2: Core Server Entities & Spatial Hash Grid
**Files:**
- Create: `server/SpatialGrid.js`
- Create: `server/Snake.js`
- Test: `tests/spatial.test.js`
- Test: `tests/snake.test.js`

**Interfaces:**
- Consumes: None
- Produces:
  - `SpatialGrid`: `insert(item)`, `remove(item)`, `queryRadius(x, y, radius)`
  - `Snake`: `update(targetAngle, isBoosting, arenaSize)`, `grow(amount)`, `kill()`, `getSegments()`

- [ ] **Step 1: Write tests for `SpatialGrid` querying items within a radius**
- [ ] **Step 2: Run test to verify it fails (`node --test tests/spatial.test.js`)**
- [ ] **Step 3: Implement `server/SpatialGrid.js`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Write tests for `Snake` movement, body segment lag, and boosting length consumption**
- [ ] **Step 6: Run test to verify it fails (`node --test tests/snake.test.js`)**
- [ ] **Step 7: Implement `server/Snake.js` with smooth angular interpolation**
- [ ] **Step 8: Run test to verify it passes**
- [ ] **Step 9: Commit: `git commit -m "feat(server): add SpatialGrid and Snake physics model"`**

---

### Task 3: Power-ups, Food System & Bot AI Logic
**Files:**
- Create: `server/PowerUps.js`
- Create: `server/BotAI.js`
- Test: `tests/bot.test.js`

**Interfaces:**
- Consumes: `Snake`, `SpatialGrid`
- Produces:
  - `BotAI`: `updateBot(botSnake, roomState)` (supports Casual Wanderer & Smart Hunter behaviors)
  - `PowerUps`: `spawnPowerUp(arenaSize)`, `applyPowerUp(snake, type)`, `tickPowerUps(snake)`

- [ ] **Step 1: Write test for BotAI decision making (avoiding walls, chasing food, hunting snakes)**
- [ ] **Step 2: Run test to verify it fails (`node --test tests/bot.test.js`)**
- [ ] **Step 3: Implement `server/PowerUps.js` for Magnet, Shield, Speed Surge, 2x Score, Vision**
- [ ] **Step 4: Implement `server/BotAI.js` for Casual NPCs and Smart Hunters**
- [ ] **Step 5: Run tests to verify pass (`node --test tests/bot.test.js`)**
- [ ] **Step 6: Commit: `git commit -m "feat(server): add PowerUps manager and intelligent Bot AI"`**

---

### Task 4: Room Management & Authoritative Game Loop (FFA vs Duo)
**Files:**
- Create: `server/Room.js`
- Create: `server/GameServer.js`
- Test: `tests/room.test.js`

**Interfaces:**
- Consumes: `Snake`, `SpatialGrid`, `BotAI`, `PowerUps`
- Produces:
  - `Room`: `addPlayer(socket, name, skin)`, `removePlayer(socketId)`, `tick()`, `getSnapshot()`
  - Collision checking respecting `mode === 'duo'` (human friendly fire bypass) vs `mode === 'ffa'`

- [ ] **Step 1: Write test for 6-digit room creation, player joining, and Duo mode friendly fire immunity**
- [ ] **Step 2: Run test to verify it fails (`node --test tests/room.test.js`)**
- [ ] **Step 3: Implement `server/Room.js` with 30Hz tick loop and collision resolution**
- [ ] **Step 4: Implement `server/GameServer.js` managing room lifecycle and Socket.io event dispatch**
- [ ] **Step 5: Run test to verify it passes (`node --test tests/room.test.js`)**
- [ ] **Step 6: Commit: `git commit -m "feat(server): add Room manager with 6-digit codes and Duo/FFA modes"`**

---

### Task 5: Express Server & WebSocket Handlers
**Files:**
- Create: `server.js`

**Interfaces:**
- Consumes: `server/GameServer.js`
- Produces: Web server listening on `PORT`, serving static files from `public/`

- [ ] **Step 1: Implement `server.js` connecting Express, Socket.io, and `GameServer`**
- [ ] **Step 2: Test launching server locally and verify HTTP + WebSocket handshake**
- [ ] **Step 3: Commit: `git commit -m "feat(server): configure Express and Socket.io HTTP server"`**

---

### Task 6: Client UI, Lobby & Skin Customizer
**Files:**
- Create: `public/index.html`
- Create: `public/css/style.css`
- Create: `public/js/skins.js`

**Interfaces:**
- Consumes: None
- Produces: Responsive UI with Room Creation (6 digits), Mode Selection (FFA / Duo), 8 Cute Skins preview, Leaderboard, Minimap, Game Over overlay.

- [ ] **Step 1: Build `public/index.html` with mobile-first viewport, lobby dialogs, HUD and Canvas**
- [ ] **Step 2: Style with `public/css/style.css` featuring pastel glassmorphism, cute cartoon badges, and responsive touch layout**
- [ ] **Step 3: Create `public/js/skins.js` defining color palettes, ear shapes, and cute accessories for all 8 skins**
- [ ] **Step 4: Verify visually on desktop and mobile viewports**
- [ ] **Step 5: Commit: `git commit -m "feat(client): create responsive cute UI, lobby and skin selector"`**

---

### Task 7: Client Graphics Engine & Cute Expression Renderer
**Files:**
- Create: `public/js/renderer.js`
- Create: `public/js/audio.js`

**Interfaces:**
- Consumes: `skins.js`
- Produces:
  - `Renderer`: Canvas 2D render loop, camera follow, cute blinking eyes, boost particles, food orbs, powerup icons, minimap, leaderboard
  - `AudioSystem`: Web Audio API procedural sound effects (eat, boost, dead pop, powerup)

- [ ] **Step 1: Implement `public/js/audio.js` with zero-asset cute procedural sounds**
- [ ] **Step 2: Implement `public/js/renderer.js` with smooth interpolation, blinking anime eyes, expressions, and candy particles**
- [ ] **Step 3: Verify render loop runs at 60–120 FPS smoothly**
- [ ] **Step 4: Commit: `git commit -m "feat(client): implement cute Canvas 2D renderer and Web Audio SFX"`**

---

### Task 8: Client Multi-Touch Controls & Network Synchronization
**Files:**
- Create: `public/js/input.js`
- Create: `public/js/game.js`

**Interfaces:**
- Consumes: `renderer.js`, `audio.js`, `input.js`
- Produces: Full interactive gameplay loop, 2nd-finger hold boost, mouse/touch steering, live HUD updates.

- [ ] **Step 1: Implement `public/js/input.js` supporting 1st finger steer + 2nd finger hold boost (Snake.io mechanic)**
- [ ] **Step 2: Implement `public/js/game.js` connecting Socket.io, handling state snapshots, respawn, and UI triggers**
- [ ] **Step 3: Test multi-player connection with 2 browser tabs simulating 2 players in a 6-digit room**
- [ ] **Step 4: Commit: `git commit -m "feat(client): implement multi-touch controls and real-time game client"`**

---

### Task 9: End-to-End Verification, GitHub Push & Render Deployment Guide
**Files:**
- Create: `DEPLOYMENT.md`
- Verify: Full game flow locally and git push to remote

- [ ] **Step 1: Run all backend tests (`npm test`)**
- [ ] **Step 2: Perform end-to-end verification of room creation, joining with 6 digits, bots, powerups, and 2-finger boost**
- [ ] **Step 3: Create `DEPLOYMENT.md` detailing step-by-step 1-click free deployment on Render.com**
- [ ] **Step 4: Push complete codebase to `https://github.com/NamRannn/game.git` on `main` branch**

