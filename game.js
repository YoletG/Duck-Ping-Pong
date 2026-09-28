/**
 * Duck Ping Pong 🦆🏓
 * A retro arcade pond game where you rally a duck against an AI bot paddle.
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 560;
  const WINNING_SCORE = 7;
  const INITIAL_DUCK_SPEED = 7;
  const MAX_DUCK_SPEED = 16;
  const SPEED_INCREMENT = 1.05;

  const PADDLE_WIDTH = 18;
  const PADDLE_HEIGHT = 100;
  const PADDLE_INSET = 35;

  // --- Sound Synthesizer (Web Audio API) ---
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }

    // Realistic comical duck quack sound
    playQuack(speedMultiplier = 1) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Formant filter for duck-like nasal resonance
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, now);
      filter.Q.setValueAtTime(4.0, now);

      // Pitch sweep downward for quack
      const baseFreq = 420 * Math.min(1.4, Math.max(0.8, speedMultiplier));
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.18);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.18);

      // Envelope
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.24);
      osc2.stop(now + 0.24);
    }

    // Wooden paddle thwack
    playPaddleHit() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    }

    // Water bounce (top/bottom banks)
    playBounce() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    }

    // Splash sound when point is scored
    playSplash() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    }

    playFanfare(won) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const notes = won ? [261.63, 329.63, 392.00, 523.25] : [392.00, 329.63, 261.63, 196.00];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = won ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.25);
      });
    }
  }

  const sfx = new SoundFX();

  // --- Particle Systems ---
  class Particle {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type; // 'water', 'feather', 'quackWave'
      this.life = 1.0;

      if (type === 'feather') {
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = -Math.random() * 3 - 1;
        this.gravity = 0.08;
        this.decay = 0.015 + Math.random() * 0.01;
        this.angle = Math.random() * Math.PI * 2;
        this.angularVel = (Math.random() - 0.5) * 0.2;
        this.size = 8 + Math.random() * 6;
      } else if (type === 'quackWave') {
        this.radius = 10;
        this.maxRadius = 55;
        this.decay = 0.04;
      } else {
        // Water droplet / bubble
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.radius = 2 + Math.random() * 4;
        this.decay = 0.03 + Math.random() * 0.02;
      }
    }

    update() {
      this.life -= this.decay;
      if (this.type === 'feather') {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.angle += this.angularVel;
      } else if (this.type === 'quackWave') {
        this.radius += 2.5;
      } else {
        this.x += this.vx;
        this.y += this.vy;
      }
      return this.life > 0;
    }

    draw(ctx) {
      ctx.save();
      if (this.type === 'feather') {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fb5607';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
      } else if (this.type === 'quackWave') {
        ctx.globalAlpha = Math.max(0, this.life * 0.7);
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.globalAlpha = Math.max(0, this.life * 0.6);
        ctx.fillStyle = '#e0f7fa';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // --- Pond Decorative Elements (Lily Pads & Flowers) ---
  const lilyPads = [
    { x: 180, y: 110, size: 28, angle: 0.3, flower: true },
    { x: 260, y: 440, size: 24, angle: 2.1, flower: false },
    { x: 680, y: 130, size: 30, angle: 1.2, flower: true },
    { x: 620, y: 470, size: 26, angle: 3.8, flower: true },
    { x: 450, y: 60, size: 20, angle: 0.8, flower: false },
    { x: 450, y: 500, size: 22, angle: 4.2, flower: false },
    { x: 120, y: 280, size: 18, angle: 1.8, flower: false },
    { x: 780, y: 310, size: 20, angle: 2.9, flower: false }
  ];

  // --- Game State & Classes ---
  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');

      // DOM Elements
      this.playerScoreEl = document.getElementById('playerScore');
      this.botScoreEl = document.getElementById('botScore');
      this.rallyCountEl = document.getElementById('rallyCount');
      this.difficultySelect = document.getElementById('difficulty');
      this.soundToggleBtn = document.getElementById('soundToggle');
      this.pauseBtn = document.getElementById('pauseBtn');
      this.overlay = document.getElementById('gameOverlay');
      this.overlayTitle = document.getElementById('overlayTitle');
      this.overlayMsg = document.getElementById('overlayMessage');
      this.overlayDuck = document.getElementById('overlayDuck');
      this.actionBtn = document.getElementById('actionBtn');

      // State
      this.playerScore = 0;
      this.botScore = 0;
      this.rally = 0;
      this.bestRally = 0;
      this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'ROUND_WAIT', 'GAMEOVER'
      this.difficulty = 'medium';

      // Objects
      this.particles = [];
      this.time = 0;

      // Player Paddle
      this.player = {
        x: PADDLE_INSET,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        vy: 0,
        targetY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        color: '#e63946',
        hitFlash: 0
      };

      // Bot Paddle
      this.bot = {
        x: CANVAS_WIDTH - PADDLE_INSET - PADDLE_WIDTH,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        vy: 0,
        speed: 6.5,
        predictionError: 0,
        color: '#3a86ff',
        hitFlash: 0
      };

      // Duck (Ball)
      this.duck = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: 20,
        vx: 0,
        vy: 0,
        speed: INITIAL_DUCK_SPEED,
        squishX: 1,
        squishY: 1,
        facingRight: true,
        wingAngle: 0,
        quackAnim: 0
      };

      // Keyboard Controls
      this.keys = {
        up: false,
        down: false
      };

      this.initEvents();
      this.setDifficulty(this.difficultySelect.value);
      this.render();
    }

    initEvents() {
      // Window resize / scale tracking for accurate mouse coordinates
      const updateMousePos = (clientY) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleY = this.canvas.height / rect.height;
        const relativeY = (clientY - rect.top) * scaleY;
        this.player.targetY = Math.max(10, Math.min(CANVAS_HEIGHT - this.player.height - 10, relativeY - this.player.height / 2));
      };

      // Mouse controls
      this.canvas.addEventListener('mousemove', (e) => {
        if (this.state === 'PLAYING' || this.state === 'ROUND_WAIT') {
          updateMousePos(e.clientY);
        }
      });

      // Touch controls
      this.canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          e.preventDefault();
          updateMousePos(e.touches[0].clientY);
        }
      }, { passive: false });

      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          updateMousePos(e.touches[0].clientY);
        }
      });

      // Keyboard
      window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp') {
          this.keys.up = true;
        } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
          this.keys.down = true;
        } else if (e.code === 'KeyP') {
          this.togglePause();
        } else if (e.code === 'Space') {
          if (this.state === 'MENU' || this.state === 'GAMEOVER') {
            this.startGame();
          } else if (this.state === 'PAUSED') {
            this.togglePause();
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp') {
          this.keys.up = false;
        } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
          this.keys.down = false;
        }
      });

      // Buttons
      this.actionBtn.addEventListener('click', () => {
        sfx.init();
        if (this.state === 'MENU' || this.state === 'GAMEOVER') {
          this.startGame();
        } else if (this.state === 'PAUSED') {
          this.togglePause();
        }
      });

      this.pauseBtn.addEventListener('click', () => {
        this.togglePause();
      });

      this.soundToggleBtn.addEventListener('click', () => {
        sfx.init();
        const isMuted = sfx.toggleMute();
        this.soundToggleBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
        this.soundToggleBtn.classList.toggle('active', isMuted);
      });

      this.difficultySelect.addEventListener('change', (e) => {
        this.setDifficulty(e.target.value);
      });
    }

    setDifficulty(level) {
      this.difficulty = level;
      if (level === 'easy') {
        this.bot.speed = 4.8;
      } else if (level === 'medium') {
        this.bot.speed = 6.8;
      } else if (level === 'hard') {
        this.bot.speed = 9.2;
      }
    }

    startGame() {
      this.playerScore = 0;
      this.botScore = 0;
      this.rally = 0;
      this.bestRally = 0;
      this.updateScoreboard();

      this.overlay.classList.add('hidden');
      this.state = 'PLAYING';
      this.serveDuck(1); // Serve towards player first

      if (!this.running) {
        this.running = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
      }
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.overlayTitle.textContent = 'Game Paused';
        this.overlayMsg.textContent = 'Take a breather by the lily pond.';
        this.overlayDuck.textContent = '☕';
        this.actionBtn.textContent = 'Resume';
        this.overlay.classList.remove('hidden');
        this.pauseBtn.textContent = '▶ Resume';
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.overlay.classList.add('hidden');
        this.pauseBtn.textContent = '⏸ Pause';
        this.lastFrameTime = performance.now();
      }
    }

    serveDuck(direction = 1) {
      this.duck.x = CANVAS_WIDTH / 2;
      this.duck.y = CANVAS_HEIGHT / 2;
      this.duck.speed = INITIAL_DUCK_SPEED;
      this.duck.squishX = 1;
      this.duck.squishY = 1;

      // Random gentle starting vertical angle
      const angle = (Math.random() * 0.6 - 0.3);
      this.duck.vx = direction * this.duck.speed * Math.cos(angle);
      this.duck.vy = this.duck.speed * Math.sin(angle);
      this.duck.facingRight = this.duck.vx > 0;

      this.rally = 0;
      this.rallyCountEl.textContent = '0';

      // Small water splash ripple in the center
      this.spawnWaterSplash(this.duck.x, this.duck.y, 8);
    }

    spawnWaterSplash(x, y, count = 6) {
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(x, y, 'water'));
      }
    }

    spawnFeathers(x, y, count = 4) {
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(x, y, 'feather'));
      }
    }

    triggerQuackWave(x, y) {
      this.particles.push(new Particle(x, y, 'quackWave'));
    }

    updateScoreboard() {
      this.playerScoreEl.textContent = this.playerScore;
      this.botScoreEl.textContent = this.botScore;
      this.rallyCountEl.textContent = this.rally;
    }

    checkMatchEnd() {
      if (this.playerScore >= WINNING_SCORE || this.botScore >= WINNING_SCORE) {
        this.state = 'GAMEOVER';
        const won = this.playerScore >= WINNING_SCORE;
        sfx.playFanfare(won);

        this.overlayTitle.textContent = won ? '🏆 Duck Champion!' : '🦆 Quacked Out!';
        this.overlayDuck.textContent = won ? '🥇' : '😵';
        this.overlayMsg.innerHTML = won
          ? `You defeated Robo-Duck <strong>${this.playerScore} - ${this.botScore}</strong>!<br>Best rally: <strong>${this.bestRally}</strong> hits.`
          : `Robo-Duck took the pond <strong>${this.botScore} - ${this.playerScore}</strong>.<br>Best rally: <strong>${this.bestRally}</strong> hits.`;
        this.actionBtn.textContent = 'Play Again';
        this.overlay.classList.remove('hidden');
        return true;
      }
      return false;
    }

    // --- Main Game Loop ---
    gameLoop(now) {
      const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = now;
      this.time += dt;

      if (this.state === 'PLAYING') {
        this.update(dt);
      }

      this.render();
      requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
      // 1. Update Player Paddle with Keyboard if active
      if (this.keys.up) {
        this.player.targetY = Math.max(10, this.player.targetY - 12);
      }
      if (this.keys.down) {
        this.player.targetY = Math.min(CANVAS_HEIGHT - this.player.height - 10, this.player.targetY + 12);
      }

      // Smooth interpolation for player paddle
      this.player.y += (this.player.targetY - this.player.y) * 0.22;

      // 2. AI Bot Paddle update
      let targetBotY = this.bot.y;
      if (this.duck.vx > 0) {
        // Duck approaching bot: predict intercept
        const timeToReach = (this.bot.x - this.duck.x) / this.duck.vx;
        if (timeToReach > 0 && timeToReach < 2.5) {
          let predictedY = this.duck.y + this.duck.vy * timeToReach;
          // Simple bank bounce estimation
          while (predictedY < 20 || predictedY > CANVAS_HEIGHT - 20) {
            if (predictedY < 20) predictedY = 40 - predictedY;
            if (predictedY > CANVAS_HEIGHT - 20) predictedY = (CANVAS_HEIGHT - 20) * 2 - predictedY;
          }
          targetBotY = predictedY - this.bot.height / 2;
        } else {
          targetBotY = this.duck.y - this.bot.height / 2;
        }
      } else {
        // Duck moving away: drift back to center slowly
        targetBotY = CANVAS_HEIGHT / 2 - this.bot.height / 2;
      }

      // Add difficulty margin
      const botDiff = targetBotY - this.bot.y;
      if (Math.abs(botDiff) > 4) {
        this.bot.y += Math.sign(botDiff) * Math.min(this.bot.speed, Math.abs(botDiff));
      }
      this.bot.y = Math.max(10, Math.min(CANVAS_HEIGHT - this.bot.height - 10, this.bot.y));

      // 3. Update Duck Physics
      this.duck.x += this.duck.vx;
      this.duck.y += this.duck.vy;

      // Wing flapping animation speed proportional to duck speed
      this.duck.wingAngle = Math.sin(this.time * this.duck.speed * 2.5);

      // Restore squish smoothly
      this.duck.squishX += (1 - this.duck.squishX) * 0.15;
      this.duck.squishY += (1 - this.duck.squishY) * 0.15;

      // Top and Bottom Wall Bounces
      const topBank = 22;
      const bottomBank = CANVAS_HEIGHT - 22;
      if (this.duck.y - this.duck.radius <= topBank) {
        this.duck.y = topBank + this.duck.radius;
        this.duck.vy = Math.abs(this.duck.vy);
        this.duck.squishY = 0.7;
        this.duck.squishX = 1.3;
        sfx.playBounce();
        this.spawnWaterSplash(this.duck.x, this.duck.y, 4);
      } else if (this.duck.y + this.duck.radius >= bottomBank) {
        this.duck.y = bottomBank - this.duck.radius;
        this.duck.vy = -Math.abs(this.duck.vy);
        this.duck.squishY = 0.7;
        this.duck.squishX = 1.3;
        sfx.playBounce();
        this.spawnWaterSplash(this.duck.x, this.duck.y, 4);
      }

      // 4. Paddle Collision: Player (Left)
      const pRight = this.player.x + this.player.width;
      const pTop = this.player.y;
      const pBottom = this.player.y + this.player.height;

      if (
        this.duck.vx < 0 &&
        this.duck.x - this.duck.radius <= pRight &&
        this.duck.x + this.duck.radius >= this.player.x &&
        this.duck.y >= pTop - 10 &&
        this.duck.y <= pBottom + 10
      ) {
        this.handlePaddleHit(this.player, 1);
      }

      // 5. Paddle Collision: Bot (Right)
      const bLeft = this.bot.x;
      const bTop = this.bot.y;
      const bBottom = this.bot.y + this.bot.height;

      if (
        this.duck.vx > 0 &&
        this.duck.x + this.duck.radius >= bLeft &&
        this.duck.x - this.duck.radius <= bLeft + this.bot.width &&
        this.duck.y >= bTop - 10 &&
        this.duck.y <= bBottom + 10
      ) {
        this.handlePaddleHit(this.bot, -1);
      }

      // 6. Scoring (Left or Right out of bounds)
      if (this.duck.x < -40) {
        // Bot scored
        this.botScore++;
        sfx.playSplash();
        this.updateScoreboard();
        if (!this.checkMatchEnd()) {
          this.serveDuck(-1); // Serve towards bot
        }
      } else if (this.duck.x > CANVAS_WIDTH + 40) {
        // Player scored
        this.playerScore++;
        sfx.playSplash();
        this.updateScoreboard();
        if (!this.checkMatchEnd()) {
          this.serveDuck(1); // Serve towards player
        }
      }

      // 7. Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        if (!this.particles[i].update()) {
          this.particles.splice(i, 1);
        }
      }

      // Decrement paddle flashes
      if (this.player.hitFlash > 0) this.player.hitFlash -= dt * 4;
      if (this.bot.hitFlash > 0) this.bot.hitFlash -= dt * 4;
    }

    handlePaddleHit(paddle, dir) {
      // Calculate impact point relative to center (-1 = top edge, 0 = center, 1 = bottom edge)
      const paddleCenter = paddle.y + paddle.height / 2;
      const hitOffset = (this.duck.y - paddleCenter) / (paddle.height / 2);
      const clampedOffset = Math.max(-1, Math.min(1, hitOffset));

      // Speed up slightly on each hit up to cap
      this.duck.speed = Math.min(MAX_DUCK_SPEED, this.duck.speed * SPEED_INCREMENT);

      // Max rebound angle: 55 degrees
      const maxAngle = (55 * Math.PI) / 180;
      const bounceAngle = clampedOffset * maxAngle;

      this.duck.vx = dir * this.duck.speed * Math.cos(bounceAngle);
      this.duck.vy = this.duck.speed * Math.sin(bounceAngle);
      this.duck.facingRight = this.duck.vx > 0;

      // Squish animation on hit
      this.duck.squishX = 0.65;
      this.duck.squishY = 1.35;
      paddle.hitFlash = 1.0;

      // Rally increment
      this.rally++;
      if (this.rally > this.bestRally) {
        this.bestRally = this.rally;
      }
      this.rallyCountEl.textContent = this.rally;

      // Audio & Visual juice
      sfx.playPaddleHit();
      sfx.playQuack(this.duck.speed / INITIAL_DUCK_SPEED);
      this.triggerQuackWave(this.duck.x, this.duck.y);
      this.spawnFeathers(this.duck.x, this.duck.y, 3);
      this.spawnWaterSplash(this.duck.x, this.duck.y, 4);
    }

    // --- Render Pipeline ---
    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      this.drawPondBackground(ctx);
      this.drawLilyPads(ctx);
      this.drawCenterNet(ctx);
      this.drawParticles(ctx);
      this.drawPaddles(ctx);
      this.drawDuck(ctx);
    }

    drawPondBackground(ctx) {
      // Water gradient
      const waterGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      waterGrad.addColorStop(0, '#0f4c75');
      waterGrad.addColorStop(0.5, '#1b6ca8');
      waterGrad.addColorStop(1, '#0f4c75');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Gentle animated caustic wave highlights
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const yBase = 90 + i * 110;
        const waveOffset = Math.sin(this.time * 1.5 + i) * 15;
        ctx.beginPath();
        ctx.moveTo(0, yBase + waveOffset);
        for (let x = 0; x < CANVAS_WIDTH; x += 80) {
          const dy = Math.sin((x / 120) + this.time + i) * 6;
          ctx.lineTo(x, yBase + dy);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Wooden dock boundary (top & bottom edges)
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 14);
      ctx.fillRect(0, CANVAS_HEIGHT - 14, CANVAS_WIDTH, 14);

      // Planks pattern
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      for (let x = 0; x < CANVAS_WIDTH; x += 30) {
        ctx.fillRect(x, 0, 2, 14);
        ctx.fillRect(x, CANVAS_HEIGHT - 14, 2, 14);
      }

      // Edge highlights
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(0, 12, CANVAS_WIDTH, 2);
      ctx.fillRect(0, CANVAS_HEIGHT - 14, CANVAS_WIDTH, 2);
    }

    drawLilyPads(ctx) {
      lilyPads.forEach((pad) => {
        ctx.save();
        ctx.translate(pad.x, pad.y);
        ctx.rotate(pad.angle);

        // Lily pad leaf
        ctx.fillStyle = '#2d6a4f';
        ctx.beginPath();
        ctx.arc(0, 0, pad.size, 0.35, Math.PI * 2 - 0.35);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Inner lighter rim
        ctx.fillStyle = '#40916c';
        ctx.beginPath();
        ctx.arc(0, 0, pad.size * 0.7, 0.35, Math.PI * 2 - 0.35);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Lotus flower on top
        if (pad.flower) {
          ctx.fillStyle = '#ff758f';
          for (let p = 0; p < 5; p++) {
            ctx.save();
            ctx.rotate((p * Math.PI * 2) / 5);
            ctx.beginPath();
            ctx.ellipse(pad.size * 0.3, 0, 6, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.fillStyle = '#ffe66d';
          ctx.beginPath();
          ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });
    }

    drawCenterNet(ctx) {
      // Net rope
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 14);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 14);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating cork buoys along the net
      for (let y = 35; y < CANVAS_HEIGHT - 20; y += 45) {
        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d48b00';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    drawPaddles(ctx) {
      const drawRounded = (x, y, w, h, r) => {
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, w, h, r);
        } else {
          ctx.rect(x, y, w, h);
        }
      };

      const drawSinglePaddle = (paddle, isPlayer) => {
        ctx.save();

        // Handle
        ctx.fillStyle = '#8d6e63';
        drawRounded(paddle.x + (isPlayer ? -10 : paddle.width), paddle.y + paddle.height * 0.3, 10, paddle.height * 0.4, 3);
        ctx.fill();

        // Rubber blade
        let bladeColor = paddle.color;
        if (paddle.hitFlash > 0) {
          bladeColor = '#ffffff';
        }
        ctx.fillStyle = bladeColor;
        ctx.shadowColor = isPlayer ? 'rgba(230, 57, 70, 0.5)' : 'rgba(58, 134, 255, 0.5)';
        ctx.shadowBlur = paddle.hitFlash > 0 ? 15 : 6;

        drawRounded(paddle.x, paddle.y, paddle.width, paddle.height, 9);
        ctx.fill();

        // Wood edge trim
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#d7ccc8';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      };

      drawSinglePaddle(this.player, true);
      drawSinglePaddle(this.bot, false);
    }

    drawDuck(ctx) {
      ctx.save();
      ctx.translate(this.duck.x, this.duck.y);

      // Facing orientation (flip horizontally if going left)
      if (!this.duck.facingRight) {
        ctx.scale(-1, 1);
      }

      // Apply squish & stretch
      ctx.scale(this.duck.squishX, this.duck.squishY);

      // Water ripple beneath duck
      ctx.fillStyle = 'rgba(224, 247, 250, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Duck Body
      const bodyGrad = ctx.createRadialGradient(2, -2, 4, 0, 4, 24);
      bodyGrad.addColorStop(0, '#ffe066');
      bodyGrad.addColorStop(0.7, '#ffbe0b');
      bodyGrad.addColorStop(1, '#fb8500');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(-2, 4, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Upturned tail feather
      ctx.beginPath();
      ctx.moveTo(-16, 2);
      ctx.quadraticCurveTo(-24, -2, -22, -10);
      ctx.quadraticCurveTo(-14, -4, -10, 0);
      ctx.closePath();
      ctx.fill();

      // Wing (animated flap)
      ctx.save();
      ctx.translate(-4, 2);
      ctx.rotate(this.duck.wingAngle * 0.25);
      ctx.fillStyle = '#f77f00';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Duck Head
      const headGrad = ctx.createRadialGradient(9, -8, 2, 8, -6, 14);
      headGrad.addColorStop(0, '#fff3b0');
      headGrad.addColorStop(0.8, '#ffbe0b');
      headGrad.addColorStop(1, '#fb8500');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(8, -8, 12, 0, Math.PI * 2);
      ctx.fill();

      // Top tuft feather
      ctx.fillStyle = '#ffbe0b';
      ctx.beginPath();
      ctx.moveTo(6, -18);
      ctx.quadraticCurveTo(8, -23, 11, -21);
      ctx.quadraticCurveTo(10, -18, 8, -18);
      ctx.fill();

      // Duck Bill / Beak
      ctx.fillStyle = '#ff5400';
      ctx.beginPath();
      ctx.moveTo(16, -9);
      ctx.quadraticCurveTo(28, -6, 25, -2);
      ctx.quadraticCurveTo(18, 0, 15, -4);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(12, -10, 4, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(13.2, -10, 2, 0, Math.PI * 2);
      ctx.fill();

      // Eye sparkle highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(14, -11, 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawParticles(ctx) {
      for (const p of this.particles) {
        p.draw(ctx);
      }
    }
  }

  // Launch once DOM is ready
  window.addEventListener('DOMContentLoaded', () => {
    new Game();
  });
})();
