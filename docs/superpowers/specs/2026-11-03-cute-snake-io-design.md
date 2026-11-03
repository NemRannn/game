# Design Document: Cute Multiplayer Snake.io Web Game ("SnakeCute.io")

**Date:** 2026-11-03  
**Status:** Approved by Builder Review & User  
**Target Repository:** `https://github.com/NamRannn/game.git`

---

## 1. Intent & Purpose
Build a high-performance, ultra-smooth, visually charming multiplayer snake game inspired by Snake.io, tailored for two players (the user and their partner) to easily connect and play together over the internet, while supporting bots to keep the game lively. The game must deliver a seamless experience across Mobile (iOS/Android), iPad/Tablet, and Desktop PC, and be 100% free and simple to deploy (Render.com).

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Private 6-Digit Rooms with Dual Game Modes:**
  - Room creator receives an auto-generated 6-digit code (e.g. `582910`) and can select between two game modes:
    1. **Cạnh Tranh Tự Do (Classic FFA):** Full competitive battle where any head-to-body collision is lethal. Players compete for top spot on the leaderboard.
    2. **Cặp Đôi Đồng Lòng (Duo Co-op):** Human players pass through each other's bodies safely (friendly fire disabled), sharing the arena and teaming up to trap and eliminate AI bots!
- **Partner Visual Markers:** Real human players have glowing colored names and cute icons (❤️ for partner, 👑 for room host/leader) above their heads and dedicated pings on the minimap.
- **Continuous Arcade Arena:** Players immediately respawn with a single tap after death; matches run continuously without kicking players out or forcing room resets.
- **Cute / Cartoon Visual Identity:**
  - Cute character skins with large expressive anime eyes that blink, track direction, and react with funny/shocked expressions when boosting, turning sharply, or colliding.
  - Diverse skins: Cute Cat, Panda, Corgi, Baby Dino, Strawberry, Bubble Tea, Rainbow Glow, Chick.
  - Soft pastel yet vibrant cartoon palette, juice particle effects (sparkles, star candies, hearts when eating orbs).
- **Responsive Multi-Platform Controls:**
  - **Mobile / Tablet:** Virtual joystick or intuitive touch-drag follow + **holding second finger anywhere on screen triggers Speed Boost** (authentic Snake.io mechanic) + on-screen cute "⚡ BOOST" button.
  - **Desktop PC:** Mouse pointer steering / Arrow keys / WASD + Spacebar or Left/Right Mouse button to Boost.
- **Power-up Items (Vật phẩm bổ trợ):**
  - 🧲 **Magnet (Nam châm):** Attracts all nearby glowing orbs within extended radius.
  - ⚡ **Speed Surge (Siêu tốc):** Free max speed boost without losing mass orbs.
  - 🛡️ **Shield (Khiên bảo vệ):** Temporary invulnerability to body collisions.
  - 🌟 **2x Score / Mass (Nhân đôi điểm):** Each food orb gives double mass and score.
  - 🔍 **Vision Spyglass (Ống nhòm viễn vọng):** Expands camera zoom-out to see a wider arena.
- **Smart AI Bots (NPC & Hunters):**
  - **Casual NPCs (60%):** Wander, collect pellets, avoid obstacles casually.
  - **Smart Hunter Bots (40%):** Calculate player positions, boost to cut off / trap other snakes ("coiling" and head-cutting maneuvers), hunt orbs from dead snakes.
- **Real-Time HUD:**
  - Live Leaderboard (Top 10 snakes ranked by score/length).
  - Interactive Minimap showing arena boundaries, player dots, partner ping/marker, and high-density food clusters.
  - Current score, length, rank, and active power-up timer bars.
- **Zero-Friction Free Deployment:** Single Node.js server serving both Socket.io backend and optimized static client, deployable to Render.com with 1 click.

### Non-Goals
- Complex user account / database registration (play instantly with just a nickname).
- Microtransactions or in-app purchases.
- Heavy 3D models or bulky game engines (Three.js/Phaser) that cause high download times on mobile.

### Anti-Goals
- Cluttered, intrusive advertising.
- Sluggish touch controls or laggy frame rates on mobile browsers.
- Complex multi-step setup requiring external databases or paid hosting.

---

## 3. Architecture & Approaches Considered

### Approaches Evaluated

#### Approach 1: Unified Node.js + Socket.io + Pure High-Performance Canvas 2D Engine (Selected)
- **Structure:** Monolithic single repository.
  - Server: Express + Socket.io running an authoritative tick loop (30 ticks/s broadcast with client interpolation at 60–120 FPS). Manages rooms, AI bots, food spawning, power-up timers, collision detection.
  - Client: Pure HTML5 Canvas 2D with layered rendering, sub-pixel interpolation, smooth camera tracking, responsive touch handlers, and glassmorphism/cartoon UI overlay.
- **Pros:**
  - Single-command deployment (`npm start`) on free cloud platforms (Render.com, Railway, Fly.io).
  - Works immediately with WebSockets without cross-origin or domain configuration headaches.
  - Extremely lightweight bundle (< 100KB assets), loads in sub-second on mobile 4G/5G.
- **Cons:** Server calculates physics and bot movement; mitigated by efficient grid spatial partitioning for collision queries (handles 50+ snakes and thousands of orbs with negligible CPU).

#### Approach 2: Separated React/Vite Frontend + Node.js Backend
- Client deployed on Vercel, Server deployed on Render.
- **Trade-off:** Requires configuring CORS, dual environment variables, handling free-tier cold boot disconnects across two domains, adding unnecessary build complexity for a fast-paced canvas game.

#### Approach 3: Peer-to-Peer WebRTC (PeerJS)
- Direct browser-to-browser connection without server cost.
- **Trade-off:** High risk of connection drops when mobile devices background the browser or switch mobile cell towers; host player's phone has to compute bot AI, draining battery.

### Decision
**Approach 1 is selected** for rock-solid reliability, low latency, effortless free deployment on Render, and highest frame rates across devices.

---

## 4. Detailed Component Specifications

### 4.1 Room Management System
- **Room Code:** 6-digit random numeric code (e.g., `481920`).
- **Game Mode Selection:**
  - Mode 1: Cạnh Tranh (FFA)
  - Mode 2: Cặp Đôi (Duo Co-op)
- **Modes of Entry:**
  - *Create Room:* Generates 6-digit code, allows selecting Mode & bot count.
  - *Join Room:* Simple input box for the 6-digit code or direct URL `?room=481920`.
  - *Quick Play:* Instant casual room with bots.
- **Player Limit:** 1 to 20 players per room. Seamlessly supports 2 human players with bots filling the arena.

### 4.2 Snake Physics & Controls
- **Movement:** Velocity vector with smooth turn rate limit (angular interpolation) preventing instant snap turns.
- **Body Dynamics:** Segment chain with distance constraints and spring interpolation for silky serpentine motion.
- **Boost Mechanic:**
  - Accelerates from base speed ($1.0\times$) to boost speed ($2.0\times$).
  - Drops small glowing mass orbs behind while boosting.
  - **Mobile Touch Control:**
    - Finger 1: Drags anywhere or uses virtual floating joystick to steer.
    - Finger 2 (multi-touch): Pressing and holding a 2nd finger anywhere triggers boost.
    - Alternative on-screen cute "⚡ BOOST" button for single-hand accessibility.
  - **Desktop Controls:** Mouse pointer for angle, Spacebar or Left Mouse Click to boost.

### 4.3 Cute Visual System & Skins
- **Skin Selection:**
  1. 🐱 **Mèo Kitty:** Pink/white body, cat ears on head, cute whiskers, blinks.
  2. 🐼 **Gấu Panda:** Black/white fluffy rings, panda ears, bamboo leaf accessory.
  3. 🐶 **Corgi Năng Động:** Orange/white body, perky dog ears, heart butt pattern.
  4. 🦖 **Khủng Long Con:** Pastel mint green with soft dorsal plates and friendly eyes.
  5. 🍓 **Bé Dâu Tây:** Red with yellow seeds, green leafy collar.
  6. 🧋 **Trà Sữa Trân Châu:** Caramel brown with floating tapioca dots along the body.
  7. 🌈 **Cầu Vồng Pastel:** Shifting gradient glowing bands.
  8. 🐥 **Gà Con Chíp Chíp:** Bright sunshine yellow with tiny orange beak.
- **Expression Engine:**
  - Default: Big anime eyes with glowing specular highlights that blink periodically.
  - Boosting: Eyes squint with determined fire/speed lines.
  - Danger / Near Head Collision: Shocked wide eyes with sweat drops.
  - Death: Swirling spiral dizzy eyes (`@_@`) and pop into star candies and cupcakes.

### 4.4 Food & Power-ups
- **Orbs:** Floating pastel glowing pellets that wobble with sinusoidal buoyancy.
- **Dead Snake Remains:** Large star/heart/cupcake sweets containing the lost snake's mass.
- **Power-up Capsules:**
  - 🧲 Magnet, ⚡ Speed Surge, 🛡️ Shield, 🌟 2x Multiplier, 🔍 Vision Spyglass.
  - Appear periodically on the map with distinctive bouncing icons.
  - Active duration indicator displayed above snake head and in HUD.

### 4.5 AI Bot Intelligence
- **NPC Bot:** Wanders using Perlin/smooth simplex noise, turns away from arena borders, avoids snake bodies with raycast cones.
- **Smart Hunter Bot:**
  - Evaluates threat radius.
  - Identifies smaller snakes nearby or vulnerable head positions.
  - Executes boost interception to cut off player paths.
  - Retreats when dangerously close to bigger snake bodies.

### 4.6 Deployment Configuration
- **Platform:** Render.com (Web Service, Free Plan)
- **Start Command:** `npm start` (runs `node server.js`)
- **Port:** Auto-reads `process.env.PORT || 3000`
- **Zero Config:** Works straight out of the box with Git Push to `https://github.com/NamRannn/game.git`.

---

## 5. Builder Calls (Decided)
1. **Loop Model:** Continuous arcade respawn loop (player taps "Chơi Lại" / "Hồi Sinh" immediately upon death without resetting the room).
2. **Identification:** Real human players highlighted with a glowing border, player name tag, and ❤️ icon for partner / 👑 icon for host.
3. **Quick Play:** Spins up an instant private room with 10 bots, allowing instant practice without typing room codes.
4. **Collision Tuning:** Spatial hash grid on server to guarantee 60fps performance with 50+ snakes and 1000+ food pellets.
