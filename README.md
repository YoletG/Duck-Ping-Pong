# Duck Ping Pong 🦆🏓

An arcade pond game built with pure vanilla HTML5, CSS3, and JavaScript. Rally an adorable duck back and forth across a serene lily pad pond against an AI-controlled opponent paddle.

![Duck Ping Pong](https://raw.githubusercontent.com/YoletG/Duck-Ping-Pong/main/screenshot.png) *(Preview)*

---

## 🌟 Features

- **🦆 Dynamic Duck Character:**
  - Fully rendered with HTML5 Canvas vector drawing (zero external image dependencies).
  - Flips orientation to face movement direction, flaps wings, and squishes realistically on paddle & bank impacts.
  - Quack sound wave rings, fluttering feather particles, and water ripples on hits.

- **🤖 Smart Bot AI Opponent:**
  - 3 adjustable difficulty tiers:
    - **Casual Duckling:** Relaxed speed and playful rallies.
    - **Pond Pro:** Balanced speed with realistic reaction lag.
    - **Mallard Master:** Swift bank bounce estimation and pinpoint precision.

- **🔊 100% Procedural Web Audio API:**
  - Dynamic duck quack & honk synthesizers using formant frequency filters.
  - Wooden paddle hit thwacks, water bank bounces, point splash effects, and victory/defeat fanfares.
  - Zero external `.mp3` or `.wav` files required.

- **🎮 Responsive & Multi-Input Controls:**
  - **Mouse:** Move your cursor vertically across the canvas to glide your paddle.
  - **Touch:** Drag up and down on phones and tablets.
  - **Keyboard:** `W` / `S` or `↑` / `↓` Arrow keys.
  - **Shortcuts:** `Space` to start/resume, `P` to pause, Sound mute toggle.

- **🏆 Match Rules:**
  - First to **7 points** wins the match.
  - Real-time rally counter tracking your best volley streak.
  - Ball speed increments dynamically as rallies grow longer.

---

## 🚀 Quick Start (Play Locally)

Since this is a static HTML app, you can run it instantly without installing any dependencies:

### Method 1: Open directly in your browser
Double-click `index.html` or open it with your browser:
```bash
open index.html
```

### Method 2: Local HTTP Server (Python)
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## 🌐 Deploying to GitHub Pages

To make the game playable online for anyone:
1. Go to your repository settings on GitHub: `https://github.com/YoletG/Duck-Ping-Pong/settings/pages`
2. Under **Build and deployment** > **Branch**, select `main` and `/ (root)`.
3. Click **Save**.
4. Your game will be live at:
   ```
   https://yoletg.github.io/Duck-Ping-Pong/
   ```

---

## 📜 License
MIT License. Created by [YoletG](https://github.com/YoletG).
