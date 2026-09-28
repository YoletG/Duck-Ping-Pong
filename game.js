/**
 * Duck Ping Pong 🦆🏓
 * A retro arcade pond game where you rally a duck against an AI bot paddle.
 * Includes multiple duck skins, persistent points, margin-based rewards,
 * normal friendly ducks & spinning red evil ducks flowing in from the sides,
 * and zero-scroll arrow controls!
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

    // Ominous rumble/whoosh as evil duck slowly enters
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

  // --- Side Duck Class (Enters from sides: Normal yellow ducks & spinning red evil ducks) ---
  class SideDuck {
    constructor(side, isEvil = false) {
      this.side = side; // 'left' or 'right'
      this.isEvil = isEvil;
      this.radius = 18;
      this.x = side === 'left' ? -25 : CANVAS_WIDTH + 25;
      this.y = Math.random() * (CANVAS_HEIGHT - 180) + 90;

      // Slowly glides across from the side
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
        // Continuous spinning animation for evil ducks
        this.rotation += this.spinSpeed * dt;
        this.wingAngle = Math.sin(this.rotation * 4);
      } else {
        // Natural swimming orientation & wing flapping for normal ducks
        this.facingRight = this.vx > 0;
        this.rotation = Math.sin(this.bobTime) * 0.08;
        this.wingAngle = Math.sin(this.bobTime * 2);
      }

      // Bounce off top and bottom pond banks
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

      // Exited far off stage
      if (this.x < -110 || this.x > CANVAS_WIDTH + 110) {
        this.active = false;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      if (this.isEvil) {
        // EVIL DUCK: Continuous 360-degree spinning!
        ctx.rotate(this.rotation);

        // Fiery reddish sinister aura
        ctx.fillStyle = 'rgba(217, 4, 41, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        // Deep Red/Crimson Body Gradient
        const bodyGrad = ctx.createRadialGradient(2, -2, 2, 0, 0, 20);
        bodyGrad.addColorStop(0, '#ff4d6d');
        bodyGrad.addColorStop(0.5, '#d90429');
        bodyGrad.addColorStop(1, '#590d22');
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : bodyGrad;
        ctx.beginPath();
        ctx.ellipse(-2, 4, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spiky fiery dark tail
        ctx.fillStyle = '#800f2f';
        ctx.beginPath();
        ctx.moveTo(-14, 2);
        ctx.lineTo(-24, -4);
        ctx.lineTo(-17, 0);
        ctx.lineTo(-26, 4);
        ctx.lineTo(-14, 6);
        ctx.closePath();
        ctx.fill();

        // Wing (dark red/crimson)
        ctx.save();
        ctx.translate(-4, 2);
        ctx.rotate(this.wingAngle * 0.35);
        ctx.fillStyle = '#590d22';
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Evil Duck Head
        const headGrad = ctx.createRadialGradient(7, -6, 2, 6, -5, 13);
        headGrad.addColorStop(0, '#ff758f');
        headGrad.addColorStop(0.6, '#d90429');
        headGrad.addColorStop(1, '#370617');
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : headGrad;
        ctx.beginPath();
        ctx.arc(7, -7, 11, 0, Math.PI * 2);
        ctx.fill();

        // Evil Horns / Fiery Spikes on Head
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

        // Sharp Dark Beak
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

        // Sinister Slanted Evil Eye
        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.moveTo(8, -12);
        ctx.lineTo(14, -9);
        ctx.lineTo(13, -6);
        ctx.lineTo(7, -9);
        ctx.closePath();
        ctx.fill();

        // Red slit pupil
        ctx.fillStyle = '#d90429';
        ctx.beginPath();
        ctx.arc(11, -8.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // NORMAL DUCK: Peaceful, smiling yellow ducky!
        if (!this.facingRight) {
          ctx.scale(-1, 1);
        }
        ctx.rotate(this.rotation);

        // Water ripple beneath duck
        ctx.fillStyle = 'rgba(224, 247, 250, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Plump Sunny Yellow Body Gradient
        const bodyGrad = ctx.createRadialGradient(2, -2, 3, 0, 2, 18);
        bodyGrad.addColorStop(0, '#ffe066');
        bodyGrad.addColorStop(0.7, '#ffbe0b');
        bodyGrad.addColorStop(1, '#fb8500');
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : bodyGrad;
        ctx.beginPath();
        ctx.ellipse(-2, 3, 15, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cute upturned tail feather
        ctx.beginPath();
        ctx.moveTo(-13, 2);
        ctx.quadraticCurveTo(-20, -2, -18, -8);
        ctx.quadraticCurveTo(-12, -3, -8, 0);
        ctx.closePath();
        ctx.fill();

        // Flapping Orange Wing
        ctx.save();
        ctx.translate(-3, 1);
        ctx.rotate(this.wingAngle * 0.28);
        ctx.fillStyle = '#f77f00';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Round Yellow Head
        const headGrad = ctx.createRadialGradient(7, -6, 2, 6, -5, 12);
        headGrad.addColorStop(0, '#fff3b0');
        headGrad.addColorStop(0.8, '#ffbe0b');
        headGrad.addColorStop(1, '#fb8500');
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : headGrad;
        ctx.beginPath();
        ctx.arc(6, -6, 10, 0, Math.PI * 2);
        ctx.fill();

        // Cute tuft feather on top
        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.moveTo(5, -15);
        ctx.quadraticCurveTo(7, -19, 9, -17);
        ctx.quadraticCurveTo(8, -15, 7, -15);
        ctx.fill();

        // Friendly Orange Bill
        ctx.fillStyle = '#ff5400';
        ctx.beginPath();
        ctx.moveTo(13, -7);
        ctx.quadraticCurveTo(23, -4, 20, -1);
        ctx.quadraticCurveTo(15, 0, 12, -3);
        ctx.closePath();
        ctx.fill();

        // Big friendly cartoon eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(9, -8, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(10, -8, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(10.8, -8.8, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

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

  // Helper for safe rounded rectangles
  function drawRounded(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
  }

  // --- Static Duck Renderer (Used on Game Canvas & Skin Previews) ---
  function renderDuck(ctx, x, y, skin, facingRight = true, squishX = 1, squishY = 1, wingAngle = 0) {
    ctx.save();
    ctx.translate(x, y);

    if (!facingRight) {
      ctx.scale(-1, 1);
    }
    ctx.scale(squishX, squishY);

    // Water ripple / shadow beneath duck
    ctx.fillStyle = 'rgba(224, 247, 250, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Duck Body
    const bodyGrad = ctx.createRadialGradient(2, -2, 4, 0, 4, 24);
    bodyGrad.addColorStop(0, skin.bodyGrad[0]);
    bodyGrad.addColorStop(0.7, skin.bodyGrad[1]);
    bodyGrad.addColorStop(1, skin.bodyGrad[2]);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(-2, 4, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail Feather
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.quadraticCurveTo(-24, -2, -22, -10);
    ctx.quadraticCurveTo(-14, -4, -10, 0);
    ctx.closePath();
    ctx.fill();

    // Wing
    ctx.save();
    ctx.translate(-4, 2);
    ctx.rotate(wingAngle * 0.25);
    ctx.fillStyle = skin.wingColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Duck Head
    const headGrad = ctx.createRadialGradient(9, -8, 2, 8, -6, 14);
    headGrad.addColorStop(0, skin.headGrad[0]);
    headGrad.addColorStop(0.8, skin.headGrad[1]);
    headGrad.addColorStop(1, skin.headGrad[2]);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(8, -8, 12, 0, Math.PI * 2);
    ctx.fill();

    // Mallard White Neck Collar
    if (skin.collar) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(4, 2, 8, 2.5, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top tuft feather (if not wearing crown or headband)
    if (!skin.crown && !skin.headband) {
      ctx.fillStyle = skin.headGrad[1];
      ctx.beginPath();
      ctx.moveTo(6, -18);
      ctx.quadraticCurveTo(8, -23, 11, -21);
      ctx.quadraticCurveTo(10, -18, 8, -18);
      ctx.fill();
    }

    // Ninja Headband
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

    // Golden Emperor Crown
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

      // Ruby Jewel
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.arc(7, -20, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Duck Bill / Beak
    ctx.fillStyle = skin.billColor;
    ctx.beginPath();
    ctx.moveTo(16, -9);
    ctx.quadraticCurveTo(28, -6, 25, -2);
    ctx.quadraticCurveTo(18, 0, 15, -4);
    ctx.closePath();
    ctx.fill();

    // Flamingo Black Bill Tip
    if (skin.billTip) {
      ctx.fillStyle = skin.billTip;
      ctx.beginPath();
      ctx.moveTo(21, -7);
      ctx.quadraticCurveTo(28, -6, 25, -2);
      ctx.quadraticCurveTo(22, -1, 20, -4);
      ctx.closePath();
      ctx.fill();
    }

    // Cyber Visor
    if (skin.visor) {
      ctx.fillStyle = '#00f5d4';
      ctx.shadowColor = '#00f5d4';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(8, -13, 11, 6, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (skin.sunglasses) {
      // Cool Sunglasses
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
      // Standard Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(12, -10, 4, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = skin.eyeColor;
      if (skin.eyeGlow) {
        ctx.shadowColor = skin.eyeColor;
        ctx.shadowBlur = 6;
      }
      ctx.beginPath();
      ctx.arc(13.2, -10, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Sparkle
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
      this.skinsBtn = document.getElementById('skinsBtn');
      this.skinUnlockedCountEl = document.getElementById('skinUnlockedCount');
      this.activeSkinNameEl = document.getElementById('activeSkinName');
      this.normalDuckCountEl = document.getElementById('normalDuckCount');
      this.evilDuckCountEl = document.getElementById('evilDuckCount');

      // Overlay Elements
      this.overlay = document.getElementById('gameOverlay');
      this.overlayTitle = document.getElementById('overlayTitle');
      this.overlayMsg = document.getElementById('overlayMessage');
      this.overlayDuck = document.getElementById('overlayDuck');
      this.actionBtn = document.getElementById('actionBtn');
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
      this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
      this.difficulty = 'medium';

      // Objects
      this.particles = [];
      this.sideDucks = [];
      this.sideSpawnTimer = 0;
      this.nextSideSpawnDelay = 4.0;
      this.time = 0;

      // Player Paddle
      this.player = {
        x: PADDLE_INSET,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
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
        speed: 6.8,
        color: '#3a86ff',
        hitFlash: 0
      };

      // Main Duck
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

    // --- Persistence Handlers ---
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

    // --- Events & Inputs (Zero Scroll Glitch) ---
    initEvents() {
      const updateMousePos = (clientY) => {
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

      // KEYBOARD: Prevent default browser page scrolling on Arrow keys and Space
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

    // --- Skins Closet Modal ---
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

    // --- Game Lifecycle ---
    startGame() {
      this.playerScore = 0;
      this.botScore = 0;
      this.rally = 0;
      this.bestRally = 0;
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
      }
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

      const angle = (Math.random() * 0.6 - 0.3);
      this.duck.vx = direction * this.duck.speed * Math.cos(angle);
      this.duck.vy = this.duck.speed * Math.sin(angle);
      this.duck.facingRight = this.duck.vx > 0;

      this.rally = 0;
      this.rallyCountEl.textContent = '0';
      this.spawnWaterSplash(this.duck.x, this.duck.y, 8);

      // Reset side ducks timers for the new rally
      this.sideDucks = [];
      this.sideSpawnTimer = 0;
      this.nextSideSpawnDelay = 3.5;
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
          this.particles.push(new Particle(x, y, 'sparkle', '#fff3b0'));
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
    }

    // --- End Match & Point Calculation based on Margin ---
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
          const deficit = Math.abs(scoreDifference);
          const baseLoss = 15;
          const marginPenalty = deficit * 8;
          const diffDiscount = this.difficulty === 'hard' ? 0.75 : (this.difficulty === 'medium' ? 1.0 : 1.25);
          pointsDelta = -Math.round((baseLoss + marginPenalty) * diffDiscount);
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

        this.breakdownPointsDelta.textContent = pointsDelta > 0 ? `+${pointsDelta} ⭐` : `${pointsDelta} ⭐`;
        this.breakdownPointsDelta.className = pointsDelta > 0 ? 'points-gain' : 'points-loss';
        this.breakdownNewTotal.textContent = `${this.points} ⭐`;

        this.resultBreakdown.classList.remove('hidden');
        this.tipsBox.classList.add('hidden');
        this.actionBtn.textContent = 'Play Again';
        this.overlay.classList.remove('hidden');

        // Clear side ducks on match end
        this.sideDucks = [];
        this.updateScoreboard();
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
      // 1. Player Paddle Update
      if (this.keys.up) {
        this.player.targetY = Math.max(10, this.player.targetY - 12);
      }
      if (this.keys.down) {
        this.player.targetY = Math.min(CANVAS_HEIGHT - this.player.height - 10, this.player.targetY + 12);
      }
      this.player.y += (this.player.targetY - this.player.y) * 0.22;

      // 2. AI Bot Paddle update
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

      // 3. Main Duck Physics
      this.duck.x += this.duck.vx;
      this.duck.y += this.duck.vy;

      this.duck.wingAngle = Math.sin(this.time * this.duck.speed * 2.5);
      this.duck.squishX += (1 - this.duck.squishX) * 0.15;
      this.duck.squishY += (1 - this.duck.squishY) * 0.15;

      const skin = this.getSkin();
      if ((skin.sparkles || skin.visor) && Math.random() < 0.25) {
        this.particles.push(new Particle(this.duck.x, this.duck.y, 'sparkle', skin.particleColor));
      }

      // Main Duck Wall bounces
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

      // 4. Main Duck Paddle Collision: Player
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

      // Main Duck Paddle Collision: Bot
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

      // 5. SIDE DUCKS: Spawn slowly from the sides (both normal and evil ducks!)
      this.sideSpawnTimer += dt;
      if (this.sideSpawnTimer >= this.nextSideSpawnDelay && this.sideDucks.length < 5) {
        this.sideSpawnTimer = 0;
        this.nextSideSpawnDelay = 4.5 + Math.random() * 3.5; // Next duck in 4.5 - 8 seconds
        const side = Math.random() < 0.5 ? 'left' : 'right';
        // 50% chance of Normal friendly duck, 50% chance of Spinning Evil duck!
        const isEvil = Math.random() < 0.5;
        const newSideDuck = new SideDuck(side, isEvil);
        this.sideDucks.push(newSideDuck);

        if (isEvil) {
          sfx.playEvilEntrance();
        } else {
          sfx.playQuack(1.1, 'classic');
        }
        this.spawnWaterSplash(newSideDuck.x, newSideDuck.y, 6);
        this.updateScoreboard();
      }

      // 6. SIDE DUCKS: Update, Collisions & Interactions
      for (let i = 0; i < this.sideDucks.length; i++) {
        const duck = this.sideDucks[i];
        duck.update(dt);

        // Particle trail
        if (Math.random() < 0.22) {
          this.particles.push(new Particle(duck.x, duck.y, 'sparkle', duck.isEvil ? '#ef233c' : '#ffd166'));
        }

        // A. Side Duck vs Player Paddle
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
            sfx.playEvilQuack();
            this.triggerQuackWave(duck.x, duck.y, '#ef233c');
            this.spawnFeathers(duck.x, duck.y, 4, '#ef233c');
          } else {
            sfx.playQuack(1.0, 'classic');
            this.triggerQuackWave(duck.x, duck.y, '#ffd166');
            this.spawnFeathers(duck.x, duck.y, 4, '#ffbe0b');
          }

          // Bonus points for hitting side ducks!
          this.points += 5;
          this.updatePointsUI(5);
        }

        // B. Side Duck vs Bot Paddle
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
            sfx.playEvilQuack();
            this.spawnFeathers(duck.x, duck.y, 4, '#ef233c');
          } else {
            sfx.playQuack(1.0, 'classic');
            this.spawnFeathers(duck.x, duck.y, 4, '#ffbe0b');
          }
        }

        // C. Side Duck vs Main Duck Mid-Air Collision!
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

        // D. Side Duck vs Side Duck Collision!
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

        // E. Out of bounds: crossing past bot awards banish / rescue bonus!
        if (duck.x > CANVAS_WIDTH + 45) {
          this.points += 15;
          this.updatePointsUI(15);
          this.spawnFeathers(CANVAS_WIDTH, duck.y, 6, duck.isEvil ? '#ffd700' : '#48cae4');
          duck.active = false;
        } else if (duck.x < -45) {
          duck.active = false;
        }
      }

      // Remove inactive side ducks
      const prevCount = this.sideDucks.length;
      this.sideDucks = this.sideDucks.filter(e => e.active);
      if (prevCount !== this.sideDucks.length) {
        this.updateScoreboard();
      }

      // 7. Main Duck Scoring
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

      // 8. Update Particles
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

    // --- Render Pipeline ---
    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      this.drawPondBackground(ctx);
      this.drawLilyPads(ctx);
      this.drawCenterNet(ctx);
      this.drawParticles(ctx);
      this.drawPaddles(ctx);
      this.drawSideDucks(ctx);
      this.drawCurrentDuck(ctx);
    }

    drawPondBackground(ctx) {
      const waterGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      waterGrad.addColorStop(0, '#0f4c75');
      waterGrad.addColorStop(0.5, '#1b6ca8');
      waterGrad.addColorStop(1, '#0f4c75');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Waves
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

      // Wooden dock
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
        ctx.fillStyle = '#8d6e63';
        drawRounded(ctx, paddle.x + (isPlayer ? -10 : paddle.width), paddle.y + paddle.height * 0.3, 10, paddle.height * 0.4, 3);
        ctx.fill();

        let bladeColor = paddle.color;
        if (paddle.hitFlash > 0) {
          bladeColor = '#ffffff';
        }
        ctx.fillStyle = bladeColor;
        ctx.shadowColor = isPlayer ? 'rgba(230, 57, 70, 0.5)' : 'rgba(58, 134, 255, 0.5)';
        ctx.shadowBlur = paddle.hitFlash > 0 ? 15 : 6;

        drawRounded(ctx, paddle.x, paddle.y, paddle.width, paddle.height, 9);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#d7ccc8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      };

      drawSinglePaddle(this.player, true);
      drawSinglePaddle(this.bot, false);
    }

    drawSideDucks(ctx) {
      for (let i = 0; i < this.sideDucks.length; i++) {
        this.sideDucks[i].draw(ctx);
      }
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
