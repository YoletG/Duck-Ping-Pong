/**
 * Duck Ping Pong 🦆🏓
 * A retro arcade pond game where you rally a duck against an AI bot paddle.
 * Includes multiple duck skins, persistent points, margin-based rewards,
 * normal friendly ducks & spinning red evil ducks flowing in from the sides,
 * a Tuxedo Duck with forward-leaning blonde hair (only 1 at a time!),
 * and two Helmet-&-Suit Security Ducks that arrest any duck it touches!
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
  const MAX_SIDE_DUCKS = 14;

  // --- Duck Skins Catalog ---
  const SKINS = {
    classic: {
      id: 'classic',
      name: 'Classic Ducky',
      unlockPoints: 0,
      description: 'The iconic bright yellow pond rubber ducky.',
      headGrad: ['#fff3b0', '#ffbe0b', '#fb8500'],
      bodyGrad: ['#ffe066', '#ffbe0b', '#fb8500'],
      billColor: '#ff5400',
      wingColor: '#f77f00',
      eyeColor: '#111111',
      particleColor: '#ffbe0b',
      soundType: 'classic'
    },
    mallard: {
      id: 'mallard',
      name: 'Wild Mallard',
      unlockPoints: 150,
      description: 'Glossy emerald green head, white collar, and chestnut body.',
      headGrad: ['#2d6a4f', '#1b4332', '#081c15'],
      bodyGrad: ['#8d6e63', '#6d4c41', '#4e342e'],
      billColor: '#f3c011',
      wingColor: '#1d3557',
      eyeColor: '#000000',
      collar: true,
      particleColor: '#2d6a4f',
      soundType: 'mallard'
    },
    shades: {
      id: 'shades',
      name: 'Cool Shades',
      unlockPoints: 300,
      description: 'Way too cool for the pond with sleek dark sunglasses.',
      headGrad: ['#fff3b0', '#ffbe0b', '#fb8500'],
      bodyGrad: ['#ffe066', '#ffbe0b', '#fb8500'],
      billColor: '#ff5400',
      wingColor: '#f77f00',
      eyeColor: '#111111',
      sunglasses: true,
      particleColor: '#ffd166',
      soundType: 'cool'
    },
    flamingo: {
      id: 'flamingo',
      name: 'Pink Flamingo',
      unlockPoints: 450,
      description: 'Elegant pastel pink plumage with a stylish curved bill.',
      headGrad: ['#ffccd5', '#ff758f', '#c9184a'],
      bodyGrad: ['#ffb3c1', '#ff758f', '#c9184a'],
      billColor: '#ff4d6d',
      billTip: '#2b2b2b',
      wingColor: '#c9184a',
      eyeColor: '#2b2b2b',
      particleColor: '#ff758f',
      soundType: 'squeak'
    },
    ninja: {
      id: 'ninja',
      name: 'Shadow Ninja',
      unlockPoints: 600,
      description: 'Stealthy obsidian duck with a red headband and glowing eyes.',
      headGrad: ['#343a40', '#212529', '#0d1117'],
      bodyGrad: ['#343a40', '#212529', '#0d1117'],
      billColor: '#495057',
      wingColor: '#161b22',
      eyeColor: '#ffbe0b',
      eyeGlow: true,
      headband: true,
      particleColor: '#495057',
      soundType: 'ninja'
    },
    galaxy: {
      id: 'galaxy',
      name: 'Galaxy Scoop',
      unlockPoints: 700,
      description: 'Swirling celestial cosmic nebula with twinkling starlight and a blooming flower on its head.',
      headGrad: ['#e0aaff', '#7b2cbf', '#10002b'],
      bodyGrad: ['#9d4edd', '#3c096c', '#03071e'],
      billColor: '#4cc9f0',
      wingColor: '#5a189a',
      eyeColor: '#72efdd',
      eyeGlow: true,
      galaxyFlower: true,
      galaxyStars: true,
      sparkles: true,
      particleColor: '#c77dff',
      soundType: 'galaxy'
    },
    golden: {
      id: 'golden',
      name: 'Golden Emperor',
      unlockPoints: 800,
      description: 'Radiant golden champion crowned with a royal ruby jewel.',
      headGrad: ['#fff9db', '#ffd700', '#e0a96d'],
      bodyGrad: ['#fff3bf', '#ffc107', '#b08900'],
      billColor: '#ff9e00',
      wingColor: '#ffd700',
      eyeColor: '#2b1700',
      crown: true,
      sparkles: true,
      particleColor: '#ffd700',
      soundType: 'royal'
    },
    cyber: {
      id: 'cyber',
      name: 'Mecha Cyber-Duck',
      unlockPoints: 1000,
      description: 'High-tech titanium duck with an electric neon cyan visor.',
      headGrad: ['#495057', '#343a40', '#212529'],
      bodyGrad: ['#343a40', '#212529', '#161b22'],
      billColor: '#00f5d4',
      wingColor: '#00bbf9',
      eyeColor: '#00f5d4',
      visor: true,
      particleColor: '#00f5d4',
      soundType: 'cyber'
    }
  };

  // --- Sound Synthesizer (Web Audio API) ---
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.lastBounceTime = 0;
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

    playQuack(speedMultiplier = 1, soundType = 'classic') {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      let baseFreq = 420;
      let filterQ = 4.0;
      let oscType1 = 'sawtooth';
      let oscType2 = 'triangle';

      if (soundType === 'mallard') {
        baseFreq = 310;
        filterQ = 5.0;
      } else if (soundType === 'squeak') {
        baseFreq = 620;
        filterQ = 3.0;
      } else if (soundType === 'ninja') {
        baseFreq = 260;
        oscType1 = 'square';
      } else if (soundType === 'royal') {
        baseFreq = 540;
        oscType1 = 'triangle';
        oscType2 = 'sine';
      } else if (soundType === 'cyber') {
        baseFreq = 480;
        oscType1 = 'sawtooth';
        oscType2 = 'square';
      } else if (soundType === 'galaxy') {
        baseFreq = 560;
        oscType1 = 'sine';
        oscType2 = 'triangle';
        filterQ = 2.0;
      }

      baseFreq *= Math.min(1.4, Math.max(0.8, speedMultiplier));

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 1.5, now);
      filter.Q.setValueAtTime(filterQ, now);

      osc.type = oscType1;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.18);

      osc2.type = oscType2;
      osc2.frequency.setValueAtTime(baseFreq * 1.4, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.18);

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

    // Suave, classy low quack for Tuxedo Duck
    playSuaveQuack() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, now);
      filter.Q.setValueAtTime(3.5, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.22);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    }

    // Comical police siren for the escort ducks ("wee-woo wee-woo")
    playPoliceSiren() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const tones = [680, 860, 680, 860];
      tones.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.18, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.15);
      });
    }

    // Demonic / Evil pitch-shifted quack
    playEvilQuack() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.25);
      filter.Q.setValueAtTime(5.0, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.22);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(185, now);
      osc2.frequency.exponentialRampToValueAtTime(100, now + 0.22);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.28);
      osc2.stop(now + 0.28);
    }

    playEvilEntrance() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.16);
      osc.frequency.linearRampToValueAtTime(80, now + 0.38);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    }

    // Electric zap / shock sound for stunned paddle
    playZap() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.08);
      osc.frequency.linearRampToValueAtTime(320, now + 0.16);
      osc.frequency.linearRampToValueAtTime(60, now + 0.28);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    }

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

    playBounce() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      if (this.lastBounceTime && now - this.lastBounceTime < 0.04) return;
      this.lastBounceTime = now;
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

      const notes = won ? [261.63, 329.63, 392.00, 523.25, 659.25] : [392.00, 329.63, 261.63, 196.00];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = won ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);

        gain.gain.setValueAtTime(0.22, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.24);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.26);
      });
    }

    playUnlock() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.22);
      });
    }
  }

  const sfx = new SoundFX();

  // --- Particles ---
  class Particle {
    constructor(x, y, type, color = '#ffbe0b') {
      this.x = x;
      this.y = y;
      this.type = type; // 'water', 'feather', 'quackWave', 'sparkle'
      this.color = color;
      this.life = 1.0;

      if (type === 'feather') {
        this.vx = (Math.random() - 0.5) * 3.5;
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
      } else if (type === 'sparkle') {
        this.vx = (Math.random() - 0.5) * 2.5;
        this.vy = (Math.random() - 0.5) * 2.5;
        this.decay = 0.04 + Math.random() * 0.03;
        this.size = 3 + Math.random() * 4;
      } else if (type === 'zap') {
        this.vx = (Math.random() - 0.5) * 5.5;
        this.vy = (Math.random() - 0.5) * 5.5;
        this.decay = 0.06 + Math.random() * 0.04;
        this.size = 2 + Math.random() * 3;
      } else {
        // Water droplet
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
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
      } else if (this.type === 'quackWave') {
        ctx.globalAlpha = Math.max(0, this.life * 0.7);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.type === 'sparkle') {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'zap') {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + (Math.random() - 0.5) * 14, this.y + (Math.random() - 0.5) * 14);
        ctx.stroke();
        ctx.shadowBlur = 0;
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

  // --- Side Duck Class (Normal & Spinning Evil Ducks entering from sides) ---
  class SideDuck {
    constructor(side, isEvil = false) {
      this.side = side;
      this.isEvil = isEvil;
      this.radius = 18;
      this.x = side === 'left' ? -25 : CANVAS_WIDTH + 25;
      this.y = Math.random() * (CANVAS_HEIGHT - 180) + 90;

      const baseSpeed = 2.3 + Math.random() * 1.3;
      this.vx = side === 'left' ? baseSpeed : -baseSpeed;
      this.vy = (Math.random() - 0.5) * 2.4;

      this.facingRight = this.vx > 0;
      this.rotation = isEvil ? Math.random() * Math.PI * 2 : 0;
      this.spinSpeed = isEvil ? (4.0 + Math.random() * 4.0) * (Math.random() < 0.5 ? 1 : -1) : 0;
      this.wingAngle = 0;
      this.hitFlash = 0;
      this.active = true;
      this.bobTime = Math.random() * 10;
    }

    update(dt) {
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      this.bobTime += dt * 4;

      if (this.isEvil) {
        this.rotation += this.spinSpeed * dt;
        this.wingAngle = Math.sin(this.rotation * 4);
      } else {
        this.facingRight = this.vx > 0;
        this.rotation = Math.sin(this.bobTime) * 0.08;
        this.wingAngle = Math.sin(this.bobTime * 2);
      }

      const topBank = 22;
      const bottomBank = CANVAS_HEIGHT - 22;
      if (this.y - this.radius <= topBank) {
        this.y = topBank + this.radius;
        this.vy = Math.abs(this.vy);
        sfx.playBounce();
      } else if (this.y + this.radius >= bottomBank) {
        this.y = bottomBank - this.radius;
        this.vy = -Math.abs(this.vy);
        sfx.playBounce();
      }

      if (this.hitFlash > 0) this.hitFlash -= dt * 4;

      if (this.x < -110 || this.x > CANVAS_WIDTH + 110) {
        this.active = false;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      if (this.isEvil) {
        ctx.rotate(this.rotation);

        ctx.fillStyle = 'rgba(217, 4, 41, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        const bodyGrad = ctx.createRadialGradient(2, -2, 2, 0, 0, 20);
        bodyGrad.addColorStop(0, '#ff4d6d');
        bodyGrad.addColorStop(0.5, '#d90429');
        bodyGrad.addColorStop(1, '#590d22');
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : bodyGrad;
        ctx.beginPath();
        ctx.ellipse(-2, 4, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#800f2f';
        ctx.beginPath();
        ctx.moveTo(-14, 2);
        ctx.lineTo(-24, -4);
        ctx.lineTo(-17, 0);
        ctx.lineTo(-26, 4);
        ctx.lineTo(-14, 6);
        ctx.closePath();
        ctx.fill();

        ctx.save();
        ctx.translate(-4, 2);
        ctx.rotate(this.wingAngle * 0.35);
        ctx.fillStyle = '#590d22';
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const headGrad = ctx.createRadialGradient(7, -6, 2, 6, -5, 13);
        headGrad.addColorStop(0, '#ff758f');
        headGrad.addColorStop(0.6, '#d90429');
        headGrad.addColorStop(1, '#370617');
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : headGrad;
        ctx.beginPath();
        ctx.arc(7, -7, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffb703';
        ctx.beginPath();
        ctx.moveTo(3, -16);
        ctx.lineTo(6, -25);
        ctx.lineTo(9, -17);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(8, -16);
        ctx.lineTo(13, -23);
        ctx.lineTo(14, -15);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#1b1b1e';
        ctx.beginPath();
        ctx.moveTo(14, -8);
        ctx.lineTo(26, -5);
        ctx.lineTo(24, -1);
        ctx.lineTo(13, -3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ef233c';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.moveTo(8, -12);
        ctx.lineTo(14, -9);
        ctx.lineTo(13, -6);
        ctx.lineTo(7, -9);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#d90429';
        ctx.beginPath();
        ctx.arc(11, -8.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        if (!this.facingRight) {
          ctx.scale(-1, 1);
        }
        ctx.rotate(this.rotation);

        ctx.fillStyle = 'rgba(224, 247, 250, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        const bodyGrad = ctx.createRadialGradient(2, -2, 3, 0, 2, 18);
        bodyGrad.addColorStop(0, '#ffe066');
        bodyGrad.addColorStop(0.7, '#ffbe0b');
        bodyGrad.addColorStop(1, '#fb8500');
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : bodyGrad;
        ctx.beginPath();
        ctx.ellipse(-2, 3, 15, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-13, 2);
        ctx.quadraticCurveTo(-20, -2, -18, -8);
        ctx.quadraticCurveTo(-12, -3, -8, 0);
        ctx.closePath();
        ctx.fill();

        ctx.save();
        ctx.translate(-3, 1);
        ctx.rotate(this.wingAngle * 0.28);
        ctx.fillStyle = '#f77f00';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const headGrad = ctx.createRadialGradient(7, -6, 2, 6, -5, 12);
        headGrad.addColorStop(0, '#fff3b0');
        headGrad.addColorStop(0.8, '#ffbe0b');
        headGrad.addColorStop(1, '#fb8500');
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : headGrad;
        ctx.beginPath();
        ctx.arc(6, -6, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.moveTo(5, -15);
        ctx.quadraticCurveTo(7, -19, 9, -17);
        ctx.quadraticCurveTo(8, -15, 7, -15);
        ctx.fill();

        ctx.fillStyle = '#ff5400';
        ctx.beginPath();
        ctx.moveTo(13, -7);
        ctx.quadraticCurveTo(23, -4, 20, -1);
        ctx.quadraticCurveTo(15, 0, 12, -3);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(9, -8, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(10, -8, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(10.8, -8.8, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- The Trump Duck Class (Forward-Leaning Blonde Hair & Tuxedo, Only 1 at a time!) ---
  class TuxedoDuck {
    constructor(side) {
      this.side = side;
      this.radius = 21;
      this.x = side === 'left' ? -30 : CANVAS_WIDTH + 30;
      this.y = Math.random() * (CANVAS_HEIGHT - 180) + 90;

      const baseSpeed = 2.6 + Math.random() * 1.0;
      this.vx = side === 'left' ? baseSpeed : -baseSpeed;
      this.vy = (Math.random() - 0.5) * 2.2;

      this.facingRight = this.vx > 0;
      this.wingAngle = 0;
      this.hitFlash = 0;
      this.active = true;
      this.bobTime = Math.random() * 10;
    }

    update(dt) {
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      this.bobTime += dt * 3.5;
      this.facingRight = this.vx > 0;
      this.wingAngle = Math.sin(this.bobTime * 2);

      const topBank = 24;
      const bottomBank = CANVAS_HEIGHT - 24;
      if (this.y - this.radius <= topBank) {
        this.y = topBank + this.radius;
        this.vy = Math.abs(this.vy);
        sfx.playBounce();
      } else if (this.y + this.radius >= bottomBank) {
        this.y = bottomBank - this.radius;
        this.vy = -Math.abs(this.vy);
        sfx.playBounce();
      }

      if (this.hitFlash > 0) this.hitFlash -= dt * 4;

      if (this.x < -120 || this.x > CANVAS_WIDTH + 120) {
        this.active = false;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      if (!this.facingRight) ctx.scale(-1, 1);

      // Dignified golden/blue water shadow
      ctx.fillStyle = 'rgba(255, 209, 102, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tailored Black Tuxedo Jacket Body
      ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#141416';
      ctx.beginPath();
      ctx.ellipse(-2, 4, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Black Tuxedo Tails
      ctx.fillStyle = '#141416';
      ctx.beginPath();
      ctx.moveTo(-14, 2);
      ctx.lineTo(-24, -2);
      ctx.lineTo(-20, 5);
      ctx.lineTo(-25, 9);
      ctx.lineTo(-12, 6);
      ctx.closePath();
      ctx.fill();

      // White Dress Shirt Front (Triangle)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(9, -2);
      ctx.lineTo(4, 12);
      ctx.lineTo(-2, -2);
      ctx.closePath();
      ctx.fill();

      // Tiny Black Buttons
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(3.5, 4, 1, 0, Math.PI * 2);
      ctx.arc(3.5, 8, 1, 0, Math.PI * 2);
      ctx.fill();

      // Red Silk Bowtie
      ctx.fillStyle = '#d90429';
      ctx.beginPath();
      ctx.moveTo(3.5, -2);
      ctx.lineTo(0, -5);
      ctx.lineTo(0, 1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(3.5, -2);
      ctx.lineTo(7, -5);
      ctx.lineTo(7, 1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3.5, -2, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Black Tuxedo Wing
      ctx.save();
      ctx.translate(-4, 2);
      ctx.rotate(this.wingAngle * 0.22);
      ctx.fillStyle = '#212529';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Head (Cream / Pale Gold Duck)
      ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#ffea00';
      ctx.beginPath();
      ctx.arc(8, -7, 11, 0, Math.PI * 2);
      ctx.fill();

      // FORWARD-LEANING BLONDE HAIRCUT (Voluminous golden blonde quiff / swoosh leaning boldly forward)
      ctx.save();
      const blondeGrad = ctx.createLinearGradient(0, -26, 26, -16);
      blondeGrad.addColorStop(0, '#fff3b0');  // Pale sunlight blonde at top
      blondeGrad.addColorStop(0.35, '#ffd60a'); // Radiant golden blonde
      blondeGrad.addColorStop(0.75, '#ffb703'); // Warm honey blonde
      blondeGrad.addColorStop(1, '#d48b00');  // Deep blonde contour
      ctx.fillStyle = blondeGrad;

      // Base forward-leaning blonde wave
      ctx.beginPath();
      ctx.moveTo(-1, -13);
      ctx.quadraticCurveTo(2, -26, 11, -27);  // High crest arching forward
      ctx.quadraticCurveTo(20, -27, 26, -19); // Dramatic forward swoop extending past forehead
      ctx.lineTo(28, -17);                   // Sharp forward-pointing tip
      ctx.quadraticCurveTo(20, -15, 14, -12); // Underside returning toward forehead
      ctx.lineTo(4, -13);
      ctx.closePath();
      ctx.fill();

      // Upper forward-leaning blonde lock (giving layered volume)
      ctx.fillStyle = '#fff066';
      ctx.beginPath();
      ctx.moveTo(3, -22);
      ctx.quadraticCurveTo(12, -29, 23, -24);
      ctx.lineTo(27, -18);
      ctx.quadraticCurveTo(18, -21, 10, -18);
      ctx.closePath();
      ctx.fill();

      // Forward-pointing blonde tip accent
      ctx.fillStyle = '#fff9a6';
      ctx.beginPath();
      ctx.moveTo(15, -23);
      ctx.lineTo(28, -17);
      ctx.lineTo(20, -16);
      ctx.closePath();
      ctx.fill();

      // Combed forward hair texture strands
      ctx.strokeStyle = 'rgba(180, 115, 0, 0.45)';
      ctx.lineWidth = 1.1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(2, -18);
      ctx.quadraticCurveTo(10, -25, 23, -20);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(5, -14);
      ctx.quadraticCurveTo(13, -20, 25, -17);
      ctx.stroke();

      // Sunlight gloss & highlight sheen tracing the forward lean
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(6, -24);
      ctx.quadraticCurveTo(14, -27, 24, -22);
      ctx.stroke();

      ctx.strokeStyle = '#fff8cc';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(10, -21);
      ctx.quadraticCurveTo(18, -23, 26, -19);
      ctx.stroke();

      // Dark golden perimeter definition
      ctx.strokeStyle = '#b07d05';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-1, -13);
      ctx.quadraticCurveTo(2, -26, 11, -27);
      ctx.quadraticCurveTo(20, -27, 26, -19);
      ctx.lineTo(28, -17);
      ctx.quadraticCurveTo(20, -15, 14, -12);
      ctx.stroke();
      ctx.restore();

      // Elegant Orange Bill
      ctx.fillStyle = '#ff7b00';
      ctx.beginPath();
      ctx.moveTo(15, -7);
      ctx.quadraticCurveTo(27, -5, 24, -1);
      ctx.quadraticCurveTo(18, 0, 14, -3);
      ctx.closePath();
      ctx.fill();

      // Cool Dark Sunglasses
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.roundRect(8, -11, 10, 5, 1.5);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(9, -10);
      ctx.lineTo(12, -7);
      ctx.stroke();
      ctx.restore();

      // "THE TRUMP DUCK" Gold Floating Nametag
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelText = 'THE TRUMP DUCK';
      const textMetrics = ctx.measureText(labelText);
      const boxW = textMetrics.width + 12;
      const boxH = 16;
      const boxY = -34;

      // Dark glass container with gold border
      ctx.fillStyle = 'rgba(15, 18, 28, 0.88)';
      ctx.beginPath();
      ctx.roundRect(-boxW / 2, boxY, boxW, boxH, 6);
      ctx.fill();

      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Golden text
      ctx.fillStyle = '#ffd166';
      ctx.shadowColor = 'rgba(255, 209, 102, 0.6)';
      ctx.shadowBlur = 4;
      ctx.fillText(labelText, 0, boxY + boxH / 2);
      ctx.restore();
    }
  }

  // --- Helper to Render a Guard Duck in Tactical Helmet & Dark Suit ---
  function drawGuardDuck(ctx, x, y, facingRight, wingAngle) {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) ctx.scale(-1, 1);

    // Dark Security Suit Body
    ctx.fillStyle = '#0d1b2a';
    ctx.beginPath();
    ctx.ellipse(-2, 4, 15, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // White Shirt Collar & Black Tie
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(8, -1);
    ctx.lineTo(3, 8);
    ctx.lineTo(-1, -1);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(3.5, 0);
    ctx.lineTo(2, 7);
    ctx.lineTo(5, 7);
    ctx.closePath();
    ctx.fill();

    // Wing flapping
    ctx.save();
    ctx.translate(-3, 2);
    ctx.rotate(wingAngle * 0.4);
    ctx.fillStyle = '#1b263b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Head
    ctx.fillStyle = '#ffbe0b';
    ctx.beginPath();
    ctx.arc(6, -6, 10, 0, Math.PI * 2);
    ctx.fill();

    // Orange Beak
    ctx.fillStyle = '#ff5400';
    ctx.beginPath();
    ctx.moveTo(13, -6);
    ctx.lineTo(21, -3);
    ctx.lineTo(13, 0);
    ctx.closePath();
    ctx.fill();

    // Agent Sunglasses
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.roundRect(6, -9, 8, 4.5, 1.5);
    ctx.fill();

    // TACTICAL SECURITY HELMET
    ctx.fillStyle = '#1b263b';
    ctx.beginPath();
    ctx.arc(6, -8, 12, Math.PI * 0.85, Math.PI * 2.15);
    ctx.lineTo(16, -9);
    ctx.lineTo(-4, -9);
    ctx.closePath();
    ctx.fill();

    // Helmet Brim & Visor
    ctx.fillStyle = '#415a77';
    ctx.beginPath();
    ctx.roundRect(-3, -11, 20, 3.5, 1.5);
    ctx.fill();

    // Helmet Chin Strap
    ctx.strokeStyle = '#0d1b2a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.quadraticCurveTo(6, 2, 11, -5);
    ctx.stroke();

    // Gold Security Badge on Helmet
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(6, -14, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Arrest Escort Class (Two Helmet-&-Suit Ducks apprehend & carry duck away) ---
  class ArrestEscort {
    constructor(targetDuck) {
      this.targetDuck = targetDuck;
      this.x = targetDuck.x;
      this.y = targetDuck.y;

      // Two guards start above and swoop in
      this.leftGuardY = this.y - 140;
      this.rightGuardY = this.y - 140;
      this.phase = 'swoop'; // 'swoop' -> 'lift'
      this.timer = 0;
      this.wingAngle = 0;
      this.sirenFlash = 0;
      this.finished = false;
    }

    update(dt) {
      this.timer += dt;
      this.wingAngle = Math.sin(this.timer * 15);
      this.sirenFlash += dt * 10;

      if (this.phase === 'swoop') {
        // Guards dive down fast to flank the target duck
        this.leftGuardY += (this.y - this.leftGuardY) * 0.22;
        this.rightGuardY += (this.y - this.rightGuardY) * 0.22;

        if (Math.abs(this.leftGuardY - this.y) < 6) {
          this.leftGuardY = this.y;
          this.rightGuardY = this.y;
          this.phase = 'lift';
        }
      } else {
        // LIFT PHASE: Both guards carry the arrested duck straight UP!
        const liftSpeed = 5.2 * 60 * dt;
        this.y -= liftSpeed;
        this.leftGuardY = this.y;
        this.rightGuardY = this.y;
        this.targetDuck.y = this.y;

        // Fully carried off screen
        if (this.y < -80) {
          this.finished = true;
        }
      }
    }

    draw(ctx) {
      ctx.save();

      // Flashing Police Beacon Glow (Red & Blue alternating)
      const flashColor = Math.sin(this.sirenFlash) > 0 ? 'rgba(230, 57, 70, 0.45)' : 'rgba(58, 134, 255, 0.45)';
      ctx.fillStyle = flashColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 20, 32, 0, Math.PI * 2);
      ctx.fill();

      // "APPREHENDED!" badge text over duck
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚨 APPREHENDED! 🚨', this.x, this.y - 34);

      ctx.font = 'bold 9.5px sans-serif';
      ctx.fillStyle = '#ffd166';
      ctx.fillText('By The Trump Duck', this.x, this.y - 20);

      // Draw the apprehended target duck in center (with surprised eyes)
      ctx.save();
      ctx.translate(this.x, this.y);
      this.targetDuck.draw(ctx);

      // Funny panic sweat drop
      ctx.fillStyle = '#00b4d8';
      ctx.beginPath();
      ctx.arc(14, -18, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Guard 1 (Left): Flanking and facing right
      drawGuardDuck(ctx, this.x - 26, this.leftGuardY, true, this.wingAngle);

      // Guard 2 (Right): Flanking and facing left
      drawGuardDuck(ctx, this.x + 26, this.rightGuardY, false, this.wingAngle);

      ctx.restore();
    }
  }

  // --- Pond Decorative Elements ---
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

  function drawRounded(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
  }

  // --- Static Duck Renderer (Main Duck & Skins) ---
  function renderDuck(ctx, x, y, skin, facingRight = true, squishX = 1, squishY = 1, wingAngle = 0) {
    ctx.save();
    ctx.translate(x, y);

    if (!facingRight) {
      ctx.scale(-1, 1);
    }
    ctx.scale(squishX, squishY);

    ctx.fillStyle = 'rgba(224, 247, 250, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const bodyGrad = ctx.createRadialGradient(2, -2, 4, 0, 4, 24);
    bodyGrad.addColorStop(0, skin.bodyGrad[0]);
    bodyGrad.addColorStop(0.7, skin.bodyGrad[1]);
    bodyGrad.addColorStop(1, skin.bodyGrad[2]);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(-2, 4, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.quadraticCurveTo(-24, -2, -22, -10);
    ctx.quadraticCurveTo(-14, -4, -10, 0);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(-4, 2);
    ctx.rotate(wingAngle * 0.25);
    ctx.fillStyle = skin.wingColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const headGrad = ctx.createRadialGradient(9, -8, 2, 8, -6, 14);
    headGrad.addColorStop(0, skin.headGrad[0]);
    headGrad.addColorStop(0.8, skin.headGrad[1]);
    headGrad.addColorStop(1, skin.headGrad[2]);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(8, -8, 12, 0, Math.PI * 2);
    ctx.fill();

    if (skin.galaxyStars) {
      ctx.save();
      // Cosmic spiral nebula dust on duck body
      ctx.strokeStyle = 'rgba(199, 125, 255, 0.55)';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-2, 4, 9, 0.4, Math.PI * 1.3);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(76, 201, 240, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-2, 4, 5, Math.PI * 0.8, Math.PI * 1.9);
      ctx.stroke();

      // Twinkling miniature galaxy stars on body & head
      const drawStar = (sx, sy, size, color = '#ffffff') => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(sx, sy - size);
        ctx.lineTo(sx + size * 0.35, sy - size * 0.35);
        ctx.lineTo(sx + size, sy);
        ctx.lineTo(sx + size * 0.35, sy + size * 0.35);
        ctx.lineTo(sx, sy + size);
        ctx.lineTo(sx - size * 0.35, sy + size * 0.35);
        ctx.lineTo(sx - size, sy);
        ctx.lineTo(sx - size * 0.35, sy - size * 0.35);
        ctx.closePath();
        ctx.fill();
      };

      drawStar(-6, 2, 2.5, '#ffffff');
      drawStar(3, 8, 2.0, '#72efdd');
      drawStar(-11, 6, 1.8, '#f72585');
      drawStar(-1, 10, 1.5, '#ffffff');
      drawStar(-17, -3, 1.4, '#e0aaff');
      drawStar(4, -11, 2.0, '#ffffff');
      drawStar(10, -5, 1.6, '#4cc9f0');
      drawStar(7, -13, 1.2, '#f72585');
      ctx.restore();
    }

    if (skin.collar) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(4, 2, 8, 2.5, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!skin.crown && !skin.headband && !skin.galaxyFlower) {
      ctx.fillStyle = skin.headGrad[1];
      ctx.beginPath();
      ctx.moveTo(6, -18);
      ctx.quadraticCurveTo(8, -23, 11, -21);
      ctx.quadraticCurveTo(10, -18, 8, -18);
      ctx.fill();
    }

    if (skin.headband) {
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.roundRect(0, -15, 18, 4.5, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-2, -13);
      ctx.lineTo(-12, -17);
      ctx.lineTo(-10, -12);
      ctx.lineTo(-14, -8);
      ctx.closePath();
      ctx.fill();
    }

    if (skin.crown) {
      ctx.fillStyle = '#ffbe0b';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(3, -27);
      ctx.lineTo(7, -21);
      ctx.lineTo(12, -28);
      ctx.lineTo(14, -18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b08900';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.arc(7, -20, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (skin.galaxyFlower) {
      // Blooming celestial flower atop duck's head
      ctx.save();
      const fx = 7;
      const fy = -19;

      // Small leafy base
      ctx.fillStyle = '#48cae4';
      ctx.beginPath();
      ctx.ellipse(fx - 4, fy + 2, 3.5, 1.8, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Soft blossom glow
      ctx.shadowColor = '#ff70a6';
      ctx.shadowBlur = 5;

      // 5 radiant blooming petals
      const petalCount = 5;
      const petalDist = 5.2;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI * 2) / petalCount - Math.PI / 2;
        const px = fx + Math.cos(angle) * petalDist;
        const py = fy + Math.sin(angle) * petalDist;

        const pGrad = ctx.createRadialGradient(px, py, 1, px, py, 4.5);
        pGrad.addColorStop(0, '#ffffff');
        pGrad.addColorStop(0.5, '#ff70a6');
        pGrad.addColorStop(1, '#c9184a');
        ctx.fillStyle = pGrad;

        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Golden glowing center core
      ctx.shadowColor = '#ffe66d';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#ffe66d';
      ctx.beginPath();
      ctx.arc(fx, fy, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Starlight center highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(fx + 0.6, fy - 0.6, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.fillStyle = skin.billColor;
    ctx.beginPath();
    ctx.moveTo(16, -9);
    ctx.quadraticCurveTo(28, -6, 25, -2);
    ctx.quadraticCurveTo(18, 0, 15, -4);
    ctx.closePath();
    ctx.fill();

    if (skin.billTip) {
      ctx.fillStyle = skin.billTip;
      ctx.beginPath();
      ctx.moveTo(21, -7);
      ctx.quadraticCurveTo(28, -6, 25, -2);
      ctx.quadraticCurveTo(22, -1, 20, -4);
      ctx.closePath();
      ctx.fill();
    }

    if (skin.visor) {
      ctx.fillStyle = '#00f5d4';
      ctx.shadowColor = '#00f5d4';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(8, -13, 11, 6, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (skin.sunglasses) {
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.roundRect(8, -13, 10, 6, 1.5);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(10, -12);
      ctx.lineTo(13, -8);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(12, -10, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = skin.eyeColor;
      if (skin.eyeGlow) {
        ctx.shadowColor = skin.eyeColor;
        ctx.shadowBlur = 6;
      }
      ctx.beginPath();
      ctx.arc(13.2, -10, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(14, -11, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- Main Game Class ---
  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');

      // Scoreboard & Header Elements
      this.playerScoreEl = document.getElementById('playerScore');
      this.botScoreEl = document.getElementById('botScore');
      this.rallyCountEl = document.getElementById('rallyCount');
      this.playerPointsEl = document.getElementById('playerPoints');
      this.pointsBadgeEl = document.getElementById('pointsBadge');
      this.pointsChangeAnimEl = document.getElementById('pointsChangeAnim');
      this.difficultySelect = document.getElementById('difficulty');
      this.soundToggleBtn = document.getElementById('soundToggle');
      this.pauseBtn = document.getElementById('pauseBtn');
      this.restartBtn = document.getElementById('restartBtn');
      this.skinsBtn = document.getElementById('skinsBtn');
      this.skinUnlockedCountEl = document.getElementById('skinUnlockedCount');
      this.activeSkinNameEl = document.getElementById('activeSkinName');
      this.normalDuckCountEl = document.getElementById('normalDuckCount');
      this.evilDuckCountEl = document.getElementById('evilDuckCount');
      this.tuxedoStatusEl = document.getElementById('tuxedoStatus');
      this.tuxedoBadgeEl = document.getElementById('tuxedoBadge');

      // Overlay Elements
      this.overlay = document.getElementById('gameOverlay');
      this.overlayTitle = document.getElementById('overlayTitle');
      this.overlayMsg = document.getElementById('overlayMessage');
      this.overlayDuck = document.getElementById('overlayDuck');
      this.actionBtn = document.getElementById('actionBtn');
      this.overlayRestartBtn = document.getElementById('overlayRestartBtn');
      this.resultBreakdown = document.getElementById('resultBreakdown');
      this.breakdownScore = document.getElementById('breakdownScore');
      this.breakdownMargin = document.getElementById('breakdownMargin');
      this.breakdownPointsDelta = document.getElementById('breakdownPointsDelta');
      this.breakdownNewTotal = document.getElementById('breakdownNewTotal');
      this.tipsBox = document.getElementById('tipsBox');

      // Skins Modal Elements
      this.skinsModal = document.getElementById('skinsModal');
      this.skinsGrid = document.getElementById('skinsGrid');
      this.closeSkinsBtn = document.getElementById('closeSkinsBtn');
      this.skinsModalPoints = document.getElementById('skinsModalPoints');

      // Persistence & State
      this.points = this.loadPoints();
      this.currentSkinId = this.loadCurrentSkin();
      this.playerScore = 0;
      this.botScore = 0;
      this.rally = 0;
      this.bestRally = 0;
      this.state = 'MENU';
      this.difficulty = 'medium';

      // Objects
      this.particles = [];
      this.sideDucks = [];
      this.sideSpawnTimer = 0;
      this.nextSideSpawnDelay = 1.0;
      this.lastSideEntranceSound = 0;

      // Tuxedo Duck & Escort System (strictly 1 at a time!)
      this.tuxedoDuck = null;
      this.tuxedoSpawnTimer = 0;
      this.nextTuxedoSpawnDelay = 8.0;
      this.arrestEscorts = [];

      this.time = 0;

      // Player Paddle
      this.player = {
        x: PADDLE_INSET,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        targetY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        color: '#e63946',
        hitFlash: 0,
        stunTimer: 0
      };

      // Bot Paddle
      this.bot = {
        x: CANVAS_WIDTH - PADDLE_INSET - PADDLE_WIDTH,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: 6.8,
        color: '#3a86ff',
        hitFlash: 0,
        stunTimer: 0
      };

      // Main Duck (The duck you play the game with!)
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
        wingAngle: 0
      };

      this.keys = { up: false, down: false };

      this.initEvents();
      this.setDifficulty(this.difficultySelect.value);
      this.updatePointsUI();
      this.updateSkinBadge();
      this.render();
    }

    loadPoints() {
      const stored = localStorage.getItem('duckPong_points');
      if (stored !== null) {
        const val = parseInt(stored, 10);
        return isNaN(val) ? 100 : val;
      }
      return 100;
    }

    savePoints() {
      localStorage.setItem('duckPong_points', this.points.toString());
    }

    loadCurrentSkin() {
      const stored = localStorage.getItem('duckPong_skin');
      return (stored && SKINS[stored]) ? stored : 'classic';
    }

    saveCurrentSkin(skinId) {
      this.currentSkinId = skinId;
      localStorage.setItem('duckPong_skin', skinId);
      this.updateSkinBadge();
    }

    getSkin() {
      return SKINS[this.currentSkinId] || SKINS.classic;
    }

    updatePointsUI(pointsDelta = null) {
      this.playerPointsEl.textContent = this.points;
      this.skinsModalPoints.textContent = `${this.points} ⭐`;

      if (pointsDelta !== null) {
        this.pointsBadgeEl.classList.remove('bump');
        void this.pointsBadgeEl.offsetWidth;
        this.pointsBadgeEl.classList.add('bump');

        this.pointsChangeAnimEl.className = 'points-change-anim';
        if (pointsDelta > 0) {
          this.pointsChangeAnimEl.textContent = `+${pointsDelta} ⭐`;
          this.pointsChangeAnimEl.classList.add('show-gain');
        } else if (pointsDelta < 0) {
          this.pointsChangeAnimEl.textContent = `${pointsDelta} ⭐`;
          this.pointsChangeAnimEl.classList.add('show-loss');
        }
      }
    }

    updateSkinBadge() {
      const skin = this.getSkin();
      this.activeSkinNameEl.textContent = skin.name;

      let unlockedCount = 0;
      const totalSkins = Object.keys(SKINS).length;
      Object.values(SKINS).forEach((s) => {
        if (this.points >= s.unlockPoints) unlockedCount++;
      });
      this.skinUnlockedCountEl.textContent = `${unlockedCount}/${totalSkins}`;
    }

    initEvents() {
      const updateMousePos = (clientY) => {
        if (this.player.stunTimer > 0) return; // Stunned: paddle frozen!
        const rect = this.canvas.getBoundingClientRect();
        const scaleY = this.canvas.height / rect.height;
        const relativeY = (clientY - rect.top) * scaleY;
        this.player.targetY = Math.max(10, Math.min(CANVAS_HEIGHT - this.player.height - 10, relativeY - this.player.height / 2));
      };

      this.canvas.addEventListener('mousemove', (e) => {
        if (this.state === 'PLAYING') {
          updateMousePos(e.clientY);
        }
      });

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

      window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'Space', 'KeyW', 'KeyS'].includes(e.code)) {
          e.preventDefault();
        }

        if (e.code === 'KeyW' || e.code === 'ArrowUp') {
          this.keys.up = true;
        } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
          this.keys.down = true;
        } else if (e.code === 'KeyP') {
          this.togglePause();
        } else if (e.code === 'KeyR') {
          this.restartGame();
        } else if (e.code === 'Space') {
          if (this.state === 'MENU' || this.state === 'GAMEOVER') {
            this.startGame();
          } else if (this.state === 'PAUSED') {
            this.togglePause();
          }
        } else if (e.code === 'Escape') {
          if (!this.skinsModal.classList.contains('hidden')) {
            this.closeSkins();
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        if (['ArrowUp', 'ArrowDown', 'Space', 'KeyW', 'KeyS'].includes(e.code)) {
          e.preventDefault();
        }
        if (e.code === 'KeyW' || e.code === 'ArrowUp') {
          this.keys.up = false;
        } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
          this.keys.down = false;
        }
      });

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

      if (this.restartBtn) {
        this.restartBtn.addEventListener('click', () => {
          this.restartGame();
        });
      }

      if (this.overlayRestartBtn) {
        this.overlayRestartBtn.addEventListener('click', () => {
          this.restartGame();
        });
      }

      this.soundToggleBtn.addEventListener('click', () => {
        sfx.init();
        const isMuted = sfx.toggleMute();
        this.soundToggleBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
        this.soundToggleBtn.classList.toggle('active', isMuted);
      });

      this.difficultySelect.addEventListener('change', (e) => {
        this.setDifficulty(e.target.value);
      });

      this.skinsBtn.addEventListener('click', () => {
        this.openSkins();
      });

      this.closeSkinsBtn.addEventListener('click', () => {
        this.closeSkins();
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

    openSkins() {
      sfx.init();
      if (this.state === 'PLAYING') {
        this.togglePause();
      }
      this.buildSkinsGrid();
      this.skinsModal.classList.remove('hidden');
    }

    closeSkins() {
      this.skinsModal.classList.add('hidden');
    }

    buildSkinsGrid() {
      this.skinsGrid.innerHTML = '';
      this.skinsModalPoints.textContent = `${this.points} ⭐`;

      Object.values(SKINS).forEach((skin) => {
        const isUnlocked = this.points >= skin.unlockPoints;
        const isEquipped = skin.id === this.currentSkinId;

        const card = document.createElement('div');
        card.className = `skin-item ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}`;

        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 100;
        previewCanvas.height = 70;
        previewCanvas.className = 'skin-preview-canvas';
        const pCtx = previewCanvas.getContext('2d');
        renderDuck(pCtx, 50, 40, skin, true, 1, 1, 0);

        const nameEl = document.createElement('div');
        nameEl.className = 'skin-name';
        nameEl.textContent = skin.name;

        const descEl = document.createElement('div');
        descEl.className = 'skin-desc';
        descEl.textContent = skin.description;

        const badgeEl = document.createElement('div');
        badgeEl.className = `skin-status-badge ${isEquipped ? 'badge-equipped' : (isUnlocked ? 'badge-unlocked' : 'badge-locked')}`;
        badgeEl.textContent = isEquipped ? 'Equipped' : (isUnlocked ? 'Unlocked' : `Requires ${skin.unlockPoints} ⭐`);

        const actionBtn = document.createElement('button');
        actionBtn.className = `btn skin-btn ${isEquipped ? 'btn-equip' : (isUnlocked ? 'btn-equip' : 'btn-locked')}`;
        actionBtn.textContent = isEquipped ? '✓ In Use' : (isUnlocked ? 'Equip Skin' : `Locked (${skin.unlockPoints - this.points} to go)`);
        actionBtn.disabled = !isUnlocked || isEquipped;

        actionBtn.addEventListener('click', () => {
          if (isUnlocked && !isEquipped) {
            this.saveCurrentSkin(skin.id);
            sfx.playUnlock();
            this.buildSkinsGrid();
          }
        });

        card.appendChild(previewCanvas);
        card.appendChild(nameEl);
        card.appendChild(descEl);
        card.appendChild(badgeEl);
        card.appendChild(actionBtn);

        this.skinsGrid.appendChild(card);
      });
    }

    startGame() {
      this.playerScore = 0;
      this.botScore = 0;
      this.rally = 0;
      this.bestRally = 0;
      this.sideDucks = [];
      this.tuxedoDuck = null;
      this.arrestEscorts = [];
      this.particles = [];
      this.player.y = CANVAS_HEIGHT / 2 - this.player.height / 2;
      this.player.targetY = this.player.y;
      this.player.stunTimer = 0;
      this.bot.y = CANVAS_HEIGHT / 2 - this.bot.height / 2;
      this.bot.stunTimer = 0;
      this.pauseBtn.textContent = '⏸ Pause';
      if (this.overlayRestartBtn) {
        this.overlayRestartBtn.classList.add('hidden');
      }
      this.updateScoreboard();

      this.resultBreakdown.classList.add('hidden');
      this.tipsBox.classList.remove('hidden');
      this.overlay.classList.add('hidden');
      this.state = 'PLAYING';
      this.serveDuck(1);

      if (!this.running) {
        this.running = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
      } else {
        this.lastFrameTime = performance.now();
      }
    }

    restartGame() {
      sfx.init();
      sfx.playQuack(1.2, 'classic');
      this.startGame();
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.overlayTitle.textContent = 'Game Paused';
        this.overlayMsg.textContent = 'Take a breather by the lily pond.';
        this.overlayDuck.textContent = '☕';
        this.resultBreakdown.classList.add('hidden');
        this.tipsBox.classList.remove('hidden');
        this.actionBtn.textContent = 'Resume';
        if (this.overlayRestartBtn) {
          this.overlayRestartBtn.classList.remove('hidden');
        }
        this.overlay.classList.remove('hidden');
        this.pauseBtn.textContent = '▶ Resume';
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.overlay.classList.add('hidden');
        if (this.overlayRestartBtn) {
          this.overlayRestartBtn.classList.add('hidden');
        }
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

      const angle = (Math.random() * 0.6 - 0.3);
      this.duck.vx = direction * this.duck.speed * Math.cos(angle);
      this.duck.vy = this.duck.speed * Math.sin(angle);
      this.duck.facingRight = this.duck.vx > 0;

      this.rally = 0;
      this.rallyCountEl.textContent = '0';
      this.spawnWaterSplash(this.duck.x, this.duck.y, 8);

      // Maintain duck flood across serves (keep existing ducks and flood in a new wave!)
      if (this.sideDucks.length > 8) {
        this.sideDucks = this.sideDucks.slice(-8);
      }
      this.sideSpawnTimer = 0;
      this.nextSideSpawnDelay = 0.8;

      // Flood in a starting wave of ducks on serve (adjusted 20% pacing)
      const initialSurge = Math.min(2, MAX_SIDE_DUCKS - this.sideDucks.length);
      for (let w = 0; w < initialSurge; w++) {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const isEvil = Math.random() < 0.15;
        const surgeDuck = new SideDuck(side, isEvil);
        surgeDuck.x += (side === 'left' ? -w * 32 : w * 32);
        this.sideDucks.push(surgeDuck);
      }

      this.tuxedoDuck = null;
      this.tuxedoSpawnTimer = 0;
      this.nextTuxedoSpawnDelay = 7.0;
      this.arrestEscorts = [];

      this.updateScoreboard();
    }

    spawnWaterSplash(x, y, count = 6) {
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(x, y, 'water'));
      }
    }

    spawnFeathers(x, y, count = 4, color = null) {
      const skin = this.getSkin();
      const featherColor = color || skin.particleColor;
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(x, y, 'feather', featherColor));
      }
      if (skin.sparkles && !color) {
        for (let i = 0; i < 4; i++) {
          const sColor = (skin.id === 'galaxy')
            ? (['#c77dff', '#72efdd', '#ff70a6', '#ffffff'][i % 4])
            : (skin.particleColor || '#fff3b0');
          this.particles.push(new Particle(x, y, 'sparkle', sColor));
        }
      }
    }

    triggerQuackWave(x, y, color = null) {
      const skin = this.getSkin();
      this.particles.push(new Particle(x, y, 'quackWave', color || skin.particleColor));
    }

    updateScoreboard() {
      this.playerScoreEl.textContent = this.playerScore;
      this.botScoreEl.textContent = this.botScore;
      this.rallyCountEl.textContent = this.rally;

      if (this.normalDuckCountEl && this.evilDuckCountEl) {
        const normalCount = this.sideDucks.filter(d => !d.isEvil).length;
        const evilCount = this.sideDucks.filter(d => d.isEvil).length;
        this.normalDuckCountEl.textContent = normalCount;
        this.evilDuckCountEl.textContent = evilCount;
      }

      if (this.tuxedoStatusEl && this.tuxedoBadgeEl) {
        const hasTuxedo = this.tuxedoDuck !== null;
        this.tuxedoStatusEl.textContent = hasTuxedo ? '1 Trump Duck' : '0';
        if (hasTuxedo) {
          this.tuxedoBadgeEl.classList.add('active');
        } else {
          this.tuxedoBadgeEl.classList.remove('active');
        }
      }
    }

    checkMatchEnd() {
      if (this.playerScore >= WINNING_SCORE || this.botScore >= WINNING_SCORE) {
        this.state = 'GAMEOVER';
        const won = this.playerScore >= WINNING_SCORE;
        sfx.playFanfare(won);

        const scoreDifference = this.playerScore - this.botScore;
        let pointsDelta = 0;

        if (won) {
          const baseWin = 25;
          const marginBonus = scoreDifference * 15;
          const diffMult = this.difficulty === 'hard' ? 2.0 : (this.difficulty === 'medium' ? 1.5 : 1.0);
          pointsDelta = Math.round((baseWin + marginBonus) * diffMult);
        } else {
          // Losses NEVER reduce permanent points!
          // Award a friendly +5 ⭐ effort bonus so your points are strictly permanent and cumulative
          pointsDelta = 5;
        }

        const oldPoints = this.points;
        this.points = Math.max(0, this.points + pointsDelta);
        this.savePoints();
        this.updatePointsUI(pointsDelta);
        this.updateSkinBadge();

        let newlyUnlocked = [];
        Object.values(SKINS).forEach((skin) => {
          if (oldPoints < skin.unlockPoints && this.points >= skin.unlockPoints) {
            newlyUnlocked.push(skin.name);
          }
        });

        this.overlayTitle.textContent = won ? '🏆 Victory on the Pond!' : '🦆 Quacked Out!';
        this.overlayDuck.textContent = won ? '🥇' : '😵';

        let msg = won
          ? `You dominated the pond against Robo-Duck!<br>Longest rally: <strong>${this.bestRally}</strong> hits.`
          : `Robo-Duck got the best of you this round.<br>Longest rally: <strong>${this.bestRally}</strong> hits.`;

        if (newlyUnlocked.length > 0) {
          msg += `<br><span style="color: #52b788; font-weight: bold;">🎉 New Skin Unlocked: ${newlyUnlocked.join(', ')}!</span>`;
          sfx.playUnlock();
        }
        this.overlayMsg.innerHTML = msg;

        this.breakdownScore.textContent = `${this.playerScore} - ${this.botScore}`;
        this.breakdownMargin.textContent = won
          ? `Won by +${scoreDifference} point${scoreDifference > 1 ? 's' : ''}`
          : `Lost by ${Math.abs(scoreDifference)} point${Math.abs(scoreDifference) > 1 ? 's' : ''}`;

        this.breakdownPointsDelta.textContent = `+${pointsDelta} ⭐`;
        this.breakdownPointsDelta.className = 'points-gain';
        this.breakdownNewTotal.textContent = `${this.points} ⭐`;

        this.resultBreakdown.classList.remove('hidden');
        this.tipsBox.classList.add('hidden');
        this.actionBtn.textContent = 'Play Again';
        this.overlay.classList.remove('hidden');

        this.sideDucks = [];
        this.tuxedoDuck = null;
        this.arrestEscorts = [];
        this.updateScoreboard();
        return true;
      }
      return false;
    }

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
      // 1. Player Paddle Update
      if (this.player.stunTimer > 0) {
        this.player.stunTimer = Math.max(0, this.player.stunTimer - dt);
        this.player.targetY = this.player.y;
        if (Math.random() < 0.25) {
          this.particles.push(new Particle(this.player.x + Math.random() * this.player.width, this.player.y + Math.random() * this.player.height, 'zap', '#ffd166'));
        }
      } else {
        if (this.keys.up) {
          this.player.targetY = Math.max(10, this.player.targetY - 12);
        }
        if (this.keys.down) {
          this.player.targetY = Math.min(CANVAS_HEIGHT - this.player.height - 10, this.player.targetY + 12);
        }
        this.player.y += (this.player.targetY - this.player.y) * 0.22;
      }

      // 2. AI Bot Paddle update
      if (this.bot.stunTimer > 0) {
        this.bot.stunTimer = Math.max(0, this.bot.stunTimer - dt);
        if (Math.random() < 0.25) {
          this.particles.push(new Particle(this.bot.x + Math.random() * this.bot.width, this.bot.y + Math.random() * this.bot.height, 'zap', '#00f5d4'));
        }
      } else {
        let targetBotY = this.bot.y;
        if (this.duck.vx > 0) {
          const timeToReach = (this.bot.x - this.duck.x) / this.duck.vx;
          if (timeToReach > 0 && timeToReach < 2.5) {
            let predictedY = this.duck.y + this.duck.vy * timeToReach;
            while (predictedY < 20 || predictedY > CANVAS_HEIGHT - 20) {
              if (predictedY < 20) predictedY = 40 - predictedY;
              if (predictedY > CANVAS_HEIGHT - 20) predictedY = (CANVAS_HEIGHT - 20) * 2 - predictedY;
            }
            targetBotY = predictedY - this.bot.height / 2;
          } else {
            targetBotY = this.duck.y - this.bot.height / 2;
          }
        } else {
          targetBotY = CANVAS_HEIGHT / 2 - this.bot.height / 2;
        }

        const botDiff = targetBotY - this.bot.y;
        if (Math.abs(botDiff) > 4) {
          this.bot.y += Math.sign(botDiff) * Math.min(this.bot.speed, Math.abs(botDiff));
        }
        this.bot.y = Math.max(10, Math.min(CANVAS_HEIGHT - this.bot.height - 10, this.bot.y));
      }

      // 3. Main Duck Physics (The duck you play the game with!)
      this.duck.x += this.duck.vx;
      this.duck.y += this.duck.vy;

      this.duck.wingAngle = Math.sin(this.time * this.duck.speed * 2.5);
      this.duck.squishX += (1 - this.duck.squishX) * 0.15;
      this.duck.squishY += (1 - this.duck.squishY) * 0.15;

      const skin = this.getSkin();
      if ((skin.sparkles || skin.visor) && Math.random() < 0.25) {
        const pColor = (skin.id === 'galaxy')
          ? (['#c77dff', '#72efdd', '#ff70a6', '#ffffff'][Math.floor(Math.random() * 4)])
          : skin.particleColor;
        this.particles.push(new Particle(this.duck.x, this.duck.y, 'sparkle', pColor));
      }

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

      // 4. Main Duck Paddle Collisions
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

      // 5. SIDE DUCKS SPAWNER (CONTINUOUS DUCK FLOOD: Normal & Rare Evil Ducks)
      this.sideSpawnTimer += dt;
      if (this.sideSpawnTimer >= this.nextSideSpawnDelay && this.sideDucks.length < MAX_SIDE_DUCKS) {
        this.sideSpawnTimer = 0;
        // Paced cadence (every 0.9s to 1.8s) with 20% fewer ducks flooding in
        this.nextSideSpawnDelay = 0.9 + Math.random() * 0.9;

        // Flood in: spawn 1 to 2 ducks (rarely 3) in balanced waves (20% reduction)
        const waveCount = Math.random() < 0.38 ? 2 : (Math.random() < 0.08 ? 3 : 1);
        let spawnedAny = false;
        let hasEvil = false;

        for (let s = 0; s < waveCount && this.sideDucks.length < MAX_SIDE_DUCKS; s++) {
          // Stream in from left, right, or alternating sides
          const side = (s === 1 && Math.random() < 0.7)
            ? (this.sideDucks.length > 0 && this.sideDucks[this.sideDucks.length - 1].side === 'left' ? 'right' : 'left')
            : (Math.random() < 0.5 ? 'left' : 'right');
          // Rare evil ducks (only ~15% chance, friendly ducks make up the rest!)
          const isEvil = Math.random() < 0.15;
          if (isEvil) hasEvil = true;

          const newSideDuck = new SideDuck(side, isEvil);
          // Stagger spawn x coordinate slightly so they enter in a natural stream
          newSideDuck.x += (side === 'left' ? -s * 32 : s * 32);
          this.sideDucks.push(newSideDuck);
          this.spawnWaterSplash(newSideDuck.x, newSideDuck.y, 5);
          spawnedAny = true;
        }

        if (spawnedAny) {
          if (!this.lastSideEntranceSound || (this.time - this.lastSideEntranceSound > 0.4)) {
            this.lastSideEntranceSound = this.time;
            if (hasEvil) {
              sfx.playEvilEntrance();
            } else {
              sfx.playQuack(1.1, 'classic');
            }
          }
          this.updateScoreboard();
        }
      }

      // 6. TUXEDO DUCK SPAWNER (Strictly ONLY ONE at a time!)
      if (this.tuxedoDuck === null) {
        this.tuxedoSpawnTimer += dt;
        if (this.tuxedoSpawnTimer >= this.nextTuxedoSpawnDelay) {
          this.tuxedoSpawnTimer = 0;
          this.nextTuxedoSpawnDelay = 10.0 + Math.random() * 6.0;
          const side = Math.random() < 0.5 ? 'left' : 'right';
          this.tuxedoDuck = new TuxedoDuck(side);
          sfx.playSuaveQuack();
          this.spawnWaterSplash(this.tuxedoDuck.x, this.tuxedoDuck.y, 8);
          this.updateScoreboard();
        }
      } else {
        // Update Tuxedo Duck
        this.tuxedoDuck.update(dt);
        if (!this.tuxedoDuck.active) {
          this.tuxedoDuck = null;
          this.tuxedoSpawnTimer = 0;
          this.nextTuxedoSpawnDelay = 12.0 + Math.random() * 6.0;
          this.updateScoreboard();
        } else {
          // Tuxedo Duck Paddle Collisions
          if (
            this.tuxedoDuck.vx < 0 &&
            this.tuxedoDuck.x - this.tuxedoDuck.radius <= pRight &&
            this.tuxedoDuck.x + this.tuxedoDuck.radius >= this.player.x &&
            this.tuxedoDuck.y >= pTop - 10 &&
            this.tuxedoDuck.y <= pBottom + 10
          ) {
            this.tuxedoDuck.vx = Math.abs(this.tuxedoDuck.vx) * 1.05 + 0.3;
            this.tuxedoDuck.hitFlash = 1.0;
            this.player.hitFlash = 1.0;
            sfx.playPaddleHit();
            sfx.playSuaveQuack();
          }

          if (
            this.tuxedoDuck.vx > 0 &&
            this.tuxedoDuck.x + this.tuxedoDuck.radius >= bLeft &&
            this.tuxedoDuck.x - this.tuxedoDuck.radius <= bLeft + this.bot.width &&
            this.tuxedoDuck.y >= bTop - 10 &&
            this.tuxedoDuck.y <= bBottom + 10
          ) {
            this.tuxedoDuck.vx = -Math.abs(this.tuxedoDuck.vx) * 1.05 - 0.3;
            this.tuxedoDuck.hitFlash = 1.0;
            this.bot.hitFlash = 1.0;
            sfx.playPaddleHit();
            sfx.playSuaveQuack();
          }

          // EXEMPTION: Tuxedo Duck vs Main Duck (the duck you play with)
          // Main duck is immune to arrest! They just bounce off each other normally.
          const tdx = this.duck.x - this.tuxedoDuck.x;
          const tdy = this.duck.y - this.tuxedoDuck.y;
          const tdist = Math.hypot(tdx, tdy);
          const tMinDist = this.duck.radius + this.tuxedoDuck.radius;

          if (tdist < tMinDist && tdist > 0) {
            const tnx = tdx / tdist;
            const tny = tdy / tdist;
            const toverlap = tMinDist - tdist;
            this.duck.x += tnx * toverlap * 0.5;
            this.duck.y += tny * toverlap * 0.5;
            this.tuxedoDuck.x -= tnx * toverlap * 0.5;
            this.tuxedoDuck.y -= tny * toverlap * 0.5;

            const tkx = this.duck.vx - this.tuxedoDuck.vx;
            const tky = this.duck.vy - this.tuxedoDuck.vy;
            const tp = 2 * (tnx * tkx + tny * tky) / 2;
            this.duck.vx -= tp * tnx * 0.85;
            this.duck.vy -= tp * tny * 0.85;
            this.tuxedoDuck.vx += tp * tnx * 0.85;
            this.tuxedoDuck.vy += tp * tny * 0.85;

            this.duck.facingRight = this.duck.vx > 0;
            this.tuxedoDuck.hitFlash = 1.0;
            sfx.playPaddleHit();
            sfx.playSuaveQuack();
            this.triggerQuackWave(this.tuxedoDuck.x, this.tuxedoDuck.y, '#ffd166');
          }

          // ARREST TRIGGER: Whatever OTHER duck the Tuxedo Duck touches
          // will be taken away by two ducks wearing helmets and suits!
          for (let i = this.sideDucks.length - 1; i >= 0; i--) {
            const sideDuck = this.sideDucks[i];
            const adx = sideDuck.x - this.tuxedoDuck.x;
            const ady = sideDuck.y - this.tuxedoDuck.y;
            const adist = Math.hypot(adx, ady);
            if (adist < sideDuck.radius + this.tuxedoDuck.radius) {
              // Apprehend this duck!
              this.arrestEscorts.push(new ArrestEscort(sideDuck));
              this.sideDucks.splice(i, 1);
              sfx.playPoliceSiren();
              sfx.playSuaveQuack();
              this.triggerQuackWave(this.tuxedoDuck.x, this.tuxedoDuck.y, '#ffd166');
              this.updateScoreboard();
              break;
            }
          }
        }
      }

      // 7. UPDATE ARREST ESCORTS (Helmet-&-Suit ducks taking duck away)
      for (let i = this.arrestEscorts.length - 1; i >= 0; i--) {
        const escort = this.arrestEscorts[i];
        escort.update(dt);
        if (escort.finished) {
          this.points += 20;
          this.updatePointsUI(20);
          this.spawnFeathers(escort.x, 25, 6, '#ffd700');
          this.arrestEscorts.splice(i, 1);
        }
      }

      // 8. SIDE DUCKS: Update, Collisions & Interactions
      for (let i = 0; i < this.sideDucks.length; i++) {
        const duck = this.sideDucks[i];
        duck.update(dt);

        if (Math.random() < 0.22) {
          this.particles.push(new Particle(duck.x, duck.y, 'sparkle', duck.isEvil ? '#ef233c' : '#ffd166'));
        }

        // A. Paddle Hits
        if (
          duck.vx < 0 &&
          duck.x - duck.radius <= pRight &&
          duck.x + duck.radius >= this.player.x &&
          duck.y >= pTop - 10 &&
          duck.y <= pBottom + 10
        ) {
          duck.vx = Math.abs(duck.vx) * 1.1 + 0.4;
          const hitOffset = (duck.y - (this.player.y + this.player.height / 2)) / (this.player.height / 2);
          duck.vy += hitOffset * 2.5;
          duck.hitFlash = 1.0;
          this.player.hitFlash = 1.0;

          sfx.playPaddleHit();
          if (duck.isEvil) {
            // EVIL DUCK STUNS THE PLAYER PADDLE! (Never reduces permanent points)
            this.player.stunTimer = 1.25;
            sfx.playEvilQuack();
            sfx.playZap();
            this.triggerQuackWave(duck.x, duck.y, '#ef233c');
            this.spawnFeathers(duck.x, duck.y, 6, '#ef233c');
            for (let p = 0; p < 8; p++) {
              this.particles.push(new Particle(this.player.x + Math.random() * this.player.width, this.player.y + Math.random() * this.player.height, 'zap', '#ffd166'));
            }
          } else {
            sfx.playQuack(1.0, 'classic');
            this.triggerQuackWave(duck.x, duck.y, '#ffd166');
            this.spawnFeathers(duck.x, duck.y, 4, '#ffbe0b');
            this.points += 5;
            this.updatePointsUI(5);
          }
        }

        if (
          duck.vx > 0 &&
          duck.x + duck.radius >= bLeft &&
          duck.x - duck.radius <= bLeft + this.bot.width &&
          duck.y >= bTop - 10 &&
          duck.y <= bBottom + 10
        ) {
          duck.vx = -Math.abs(duck.vx) * 1.1 - 0.4;
          const hitOffset = (duck.y - (this.bot.y + this.bot.height / 2)) / (this.bot.height / 2);
          duck.vy += hitOffset * 2.5;
          duck.hitFlash = 1.0;
          this.bot.hitFlash = 1.0;

          sfx.playPaddleHit();
          if (duck.isEvil) {
            // Evil duck stuns bot paddle too!
            this.bot.stunTimer = 1.25;
            sfx.playEvilQuack();
            sfx.playZap();
            this.spawnFeathers(duck.x, duck.y, 6, '#ef233c');
            for (let p = 0; p < 8; p++) {
              this.particles.push(new Particle(this.bot.x + Math.random() * this.bot.width, this.bot.y + Math.random() * this.bot.height, 'zap', '#00f5d4'));
            }
          } else {
            sfx.playQuack(1.0, 'classic');
            this.spawnFeathers(duck.x, duck.y, 4, '#ffbe0b');
          }
        }

        // B. Side Duck vs Main Duck Collision
        const dx = this.duck.x - duck.x;
        const dy = this.duck.y - duck.y;
        const dist = Math.hypot(dx, dy);
        const minDist = this.duck.radius + duck.radius;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;

          const overlap = minDist - dist;
          this.duck.x += nx * overlap * 0.5;
          this.duck.y += ny * overlap * 0.5;
          duck.x -= nx * overlap * 0.5;
          duck.y -= ny * overlap * 0.5;

          const kx = this.duck.vx - duck.vx;
          const ky = this.duck.vy - duck.vy;
          const p = 2 * (nx * kx + ny * ky) / 2;

          this.duck.vx -= p * nx * 0.85;
          this.duck.vy -= p * ny * 0.85;
          duck.vx += p * nx * 0.85;
          duck.vy += p * ny * 0.85;

          this.duck.facingRight = this.duck.vx > 0;
          duck.hitFlash = 1.0;
          this.duck.squishX = 0.7;
          this.duck.squishY = 1.3;

          sfx.playPaddleHit();
          if (duck.isEvil) {
            sfx.playEvilQuack();
            sfx.playQuack(1.0, this.getSkin().soundType);
            this.triggerQuackWave(this.duck.x, this.duck.y, '#ffd166');
            this.triggerQuackWave(duck.x, duck.y, '#ef233c');
            this.spawnFeathers(duck.x, duck.y, 5, '#ef233c');
          } else {
            sfx.playQuack(1.0, 'classic');
            sfx.playQuack(1.1, this.getSkin().soundType);
            this.triggerQuackWave(this.duck.x, this.duck.y, '#ffd166');
            this.spawnFeathers(duck.x, duck.y, 5, '#ffbe0b');
          }
        }

        // C. Side Duck vs Side Duck Collision
        for (let j = i + 1; j < this.sideDucks.length; j++) {
          const other = this.sideDucks[j];
          const sdx = other.x - duck.x;
          const sdy = other.y - duck.y;
          const sdist = Math.hypot(sdx, sdy);
          const sMinDist = duck.radius + other.radius;

          if (sdist < sMinDist && sdist > 0) {
            const snx = sdx / sdist;
            const sny = sdy / sdist;
            const soverlap = sMinDist - sdist;
            duck.x -= snx * soverlap * 0.5;
            duck.y -= sny * soverlap * 0.5;
            other.x += snx * soverlap * 0.5;
            other.y += sny * soverlap * 0.5;

            const skx = duck.vx - other.vx;
            const sky = duck.vy - other.vy;
            const sp = 2 * (snx * skx + sny * sky) / 2;
            duck.vx -= sp * snx * 0.85;
            duck.vy -= sp * sny * 0.85;
            other.vx += sp * snx * 0.85;
            other.vy += sp * sny * 0.85;

            duck.hitFlash = 0.8;
            other.hitFlash = 0.8;
            sfx.playBounce();
            this.spawnFeathers(duck.x, duck.y, 3, duck.isEvil ? '#ef233c' : '#ffbe0b');
            this.spawnFeathers(other.x, other.y, 3, other.isEvil ? '#ef233c' : '#ffbe0b');
          }
        }

        // D. Out of bounds
        if (duck.x > CANVAS_WIDTH + 45) {
          this.points += 15;
          this.updatePointsUI(15);
          this.spawnFeathers(CANVAS_WIDTH, duck.y, 6, duck.isEvil ? '#ffd700' : '#48cae4');
          duck.active = false;
        } else if (duck.x < -45) {
          duck.active = false;
        }
      }

      const prevCount = this.sideDucks.length;
      this.sideDucks = this.sideDucks.filter(e => e.active);
      if (prevCount !== this.sideDucks.length) {
        this.updateScoreboard();
      }

      // 9. Main Duck Scoring
      if (this.duck.x < -40) {
        this.botScore++;
        sfx.playSplash();
        this.updateScoreboard();
        if (!this.checkMatchEnd()) {
          this.serveDuck(-1);
        }
      } else if (this.duck.x > CANVAS_WIDTH + 40) {
        this.playerScore++;
        sfx.playSplash();
        this.updateScoreboard();
        if (!this.checkMatchEnd()) {
          this.serveDuck(1);
        }
      }

      // 10. Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        if (!this.particles[i].update()) {
          this.particles.splice(i, 1);
        }
      }

      if (this.player.hitFlash > 0) this.player.hitFlash -= dt * 4;
      if (this.bot.hitFlash > 0) this.bot.hitFlash -= dt * 4;
    }

    handlePaddleHit(paddle, dir) {
      const paddleCenter = paddle.y + paddle.height / 2;
      const hitOffset = (this.duck.y - paddleCenter) / (paddle.height / 2);
      const clampedOffset = Math.max(-1, Math.min(1, hitOffset));

      this.duck.speed = Math.min(MAX_DUCK_SPEED, this.duck.speed * SPEED_INCREMENT);

      const maxAngle = (55 * Math.PI) / 180;
      const bounceAngle = clampedOffset * maxAngle;

      this.duck.vx = dir * this.duck.speed * Math.cos(bounceAngle);
      this.duck.vy = this.duck.speed * Math.sin(bounceAngle);
      this.duck.facingRight = this.duck.vx > 0;

      this.duck.squishX = 0.65;
      this.duck.squishY = 1.35;
      paddle.hitFlash = 1.0;

      this.rally++;
      if (this.rally > this.bestRally) {
        this.bestRally = this.rally;
      }
      this.rallyCountEl.textContent = this.rally;

      const skin = this.getSkin();
      sfx.playPaddleHit();
      sfx.playQuack(this.duck.speed / INITIAL_DUCK_SPEED, skin.soundType);
      this.triggerQuackWave(this.duck.x, this.duck.y);
      this.spawnFeathers(this.duck.x, this.duck.y, 4);
      this.spawnWaterSplash(this.duck.x, this.duck.y, 4);
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      this.drawPondBackground(ctx);
      this.drawLilyPads(ctx);
      this.drawCenterNet(ctx);
      this.drawParticles(ctx);
      this.drawPaddles(ctx);

      // Draw Side Ducks (Normal & Evil)
      for (let i = 0; i < this.sideDucks.length; i++) {
        this.sideDucks[i].draw(ctx);
      }

      // Draw Tuxedo Duck (Only 1 at a time!)
      if (this.tuxedoDuck !== null) {
        this.tuxedoDuck.draw(ctx);
      }

      // Draw Escort Ducks (Ducks in Helmets and Suits arresting targets)
      for (let i = 0; i < this.arrestEscorts.length; i++) {
        this.arrestEscorts[i].draw(ctx);
      }

      // Draw Main Game Duck
      this.drawCurrentDuck(ctx);
    }

    drawPondBackground(ctx) {
      const waterGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      waterGrad.addColorStop(0, '#0f4c75');
      waterGrad.addColorStop(0.5, '#1b6ca8');
      waterGrad.addColorStop(1, '#0f4c75');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

      ctx.fillStyle = '#5d4037';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 14);
      ctx.fillRect(0, CANVAS_HEIGHT - 14, CANVAS_WIDTH, 14);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      for (let x = 0; x < CANVAS_WIDTH; x += 30) {
        ctx.fillRect(x, 0, 2, 14);
        ctx.fillRect(x, CANVAS_HEIGHT - 14, 2, 14);
      }

      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(0, 12, CANVAS_WIDTH, 2);
      ctx.fillRect(0, CANVAS_HEIGHT - 14, CANVAS_WIDTH, 2);
    }

    drawLilyPads(ctx) {
      lilyPads.forEach((pad) => {
        ctx.save();
        ctx.translate(pad.x, pad.y);
        ctx.rotate(pad.angle);

        ctx.fillStyle = '#2d6a4f';
        ctx.beginPath();
        ctx.arc(0, 0, pad.size, 0.35, Math.PI * 2 - 0.35);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#40916c';
        ctx.beginPath();
        ctx.arc(0, 0, pad.size * 0.7, 0.35, Math.PI * 2 - 0.35);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 14);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 14);
      ctx.stroke();
      ctx.setLineDash([]);

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
      const drawSinglePaddle = (paddle, isPlayer) => {
        ctx.save();
        const isStunned = paddle.stunTimer > 0;
        const jitterX = isStunned ? (Math.random() - 0.5) * 4 : 0;
        const jitterY = isStunned ? (Math.random() - 0.5) * 4 : 0;
        ctx.translate(jitterX, jitterY);

        ctx.fillStyle = '#8d6e63';
        drawRounded(ctx, paddle.x + (isPlayer ? -10 : paddle.width), paddle.y + paddle.height * 0.3, 10, paddle.height * 0.4, 3);
        ctx.fill();

        let bladeColor = paddle.color;
        if (paddle.hitFlash > 0) {
          bladeColor = '#ffffff';
        } else if (isStunned) {
          bladeColor = (Math.floor(this.time * 25) % 2 === 0) ? '#ffea00' : '#ffd166';
        }
        ctx.fillStyle = bladeColor;

        if (isStunned) {
          ctx.shadowColor = '#ffd166';
          ctx.shadowBlur = 18;
        } else {
          ctx.shadowColor = isPlayer ? 'rgba(230, 57, 70, 0.5)' : 'rgba(58, 134, 255, 0.5)';
          ctx.shadowBlur = paddle.hitFlash > 0 ? 15 : 6;
        }

        drawRounded(ctx, paddle.x, paddle.y, paddle.width, paddle.height, 9);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = isStunned ? '#ffea00' : '#d7ccc8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Stunned Electric Lightning Arcs & Floating Label
        if (isStunned) {
          ctx.strokeStyle = '#00f5d4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const px = paddle.x + (isPlayer ? paddle.width : 0);
          ctx.moveTo(px, paddle.y + 8);
          ctx.lineTo(px + (isPlayer ? 7 : -7), paddle.y + 24);
          ctx.lineTo(px + (isPlayer ? -2 : 2), paddle.y + 45);
          ctx.lineTo(px + (isPlayer ? 9 : -9), paddle.y + 70);
          ctx.lineTo(px, paddle.y + paddle.height - 8);
          ctx.stroke();

          // Floating Stun Badge above paddle
          ctx.fillStyle = '#ffea00';
          ctx.font = 'bold 12px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          const labelX = isPlayer ? paddle.x + paddle.width / 2 + 10 : paddle.x + paddle.width / 2 - 10;
          ctx.fillText(`⚡ STUNNED!`, labelX, paddle.y - 12);
        }

        ctx.restore();
      };

      drawSinglePaddle(this.player, true);
      drawSinglePaddle(this.bot, false);
    }

    drawCurrentDuck(ctx) {
      const skin = this.getSkin();
      renderDuck(
        ctx,
        this.duck.x,
        this.duck.y,
        skin,
        this.duck.facingRight,
        this.duck.squishX,
        this.duck.squishY,
        this.duck.wingAngle
      );
    }

    drawParticles(ctx) {
      for (const p of this.particles) {
        p.draw(ctx);
      }
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    new Game();
  });
})();
