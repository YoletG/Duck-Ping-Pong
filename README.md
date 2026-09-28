# Duck Ping Pong 🦆🏓

An arcade pond game built with vanilla HTML5, CSS3, and JavaScript. Rally an adorable duck back and forth across a lily pad pond against an AI-controlled opponent paddle.

---

## 🌟 What's New: Skins & Points System

### 🎨 8 Unique Duck Skins
Unlock and equip customizable duck skins in the in-game **Duck Wardrobe**:
1. **Classic Ducky (0 ⭐):** The iconic bright yellow rubber ducky.
2. **Wild Mallard (150 ⭐):** Glossy emerald green head, white collar ring, and chestnut plumage.
3. **Cool Shades (300 ⭐):** Equipped with dark sunglasses with reflective glare.
4. **Pink Flamingo (450 ⭐):** Pastel pink plumage with a black-tipped curved bill.
5. **Shadow Ninja (600 ⭐):** Stealthy obsidian duck with a red headband and glowing eyes.
6. **Galaxy Scoop (700 ⭐):** Swirling celestial cosmic nebula with twinkling starlight, stardust particle trails, an ethereal shimmer quack, and a blooming lotus flower on its head!
7. **Golden Emperor (800 ⭐):** Radiant golden feathers crowned with a royal ruby jewel and shimmering sparkles.
8. **Mecha Cyber-Duck (1000 ⭐):** High-tech titanium cyber duck with an electric neon cyan visor.

Each skin features unique colors, custom accessories, distinct quack audio frequencies/synthesizers, and personalized particle effects!

---

### 🦆 & 😈 Side-Entering Duck Flood (Normal & Evil Ducks)
As rallies unfold, ducks **flood in continuously** from both sides in rapid streams (spawning in waves of 1–3 ducks up to 14 on screen simultaneously!):
- **🦆 Normal Ducks:**
  - Cute sunny yellow ducks that swim peacefully across the pond, flapping their wings and bobbing naturally with water ripples.
  - Can be rallied by your paddle (`+5 ⭐ Duck Saved!`) with cheerful quacks and golden feather bursts!
  - Deflecting a normal duck past the bot paddle awards a **`+15 ⭐ Rescue Bonus`**!
  - Can bump harmlessly into other ducks with playful quacks and splashes.
- **😈 Rare Spinning Evil Ducks (⚡ Paddle Stun!):**
  - Fiery crimson ducks with spiky horns and glowing eyes that appear rarely (~15% of the flood) and **spin 360°** across the pond!
  - **⚡ Paddle Stun Mechanic:** Touching an evil duck **stuns and immobilizes the paddle** for 1.25 seconds with crackling electric sparks and zap audio!
  - **No Point Loss:** Evil ducks never reduce your permanent points!
  - **Bot Stun Advantage:** Deflecting an evil duck into the bot paddle stuns the bot, freezing it in place and leaving the goal wide open!
  - Knocking an evil duck past the bot paddle awards a **`+15 ⭐ Evil Banish Bonus`**!
- **HUD Flood Tracker:** Live counter displays the number of active normal and evil ducks in the pond (`🦆 X · 😈 Y`).

---

### 🤵 The Trump Duck & 🪖 Secret Service Escort Ducks
Watch out for the distinguished **The Trump Duck**:
- **Dapper Style:** Wears a tailored black tuxedo with silk tails, crisp white dress shirt, red bow tie, dark shades, and a sharp slick **blonde haircut that leans forward**!
- **Floating Nametag:** Displays a prominent gold-gilded **"THE TRUMP DUCK"** nametag as it navigates the pond.
- **Strictly One at a Time:** Only **one** The Trump Duck can ever appear in the pond at any given time.
- **The Bodyguard Law:**
  - **Your Game Ball is EXEMPT:** If The Trump Duck touches the main ball duck you are playing with, they bounce off each other normally.
  - **Evil Ducks are Apprehended Too:** Even if The Trump Duck touches a red spinning Evil Duck, the evil duck's spin is neutralized and it is immediately apprehended and subdued in containment handcuffs!
  - **Two Ducks in Helmets & Suits:** A pair of tactical security ducks wearing SWAT helmets and dark suits swoop down with flashing beacons (`🚨`), flank the duck, and escort it straight up out of the pond (`+20 ⭐` for Normal Ducks, **`+30 ⭐` for Evil Ducks**!).
  - **Audio & Visuals:** Features dapper quacks, shocked evil duck shrieks, comical two-tone police sirens, and `🚨 EVIL DUCK APPREHENDED! 🚨` status banners!

---

### ⭐ Permanent Cumulative Points System
Your points only **grow and accumulate** across matches—they are never deducted!

- **Winning a Round:**
  - Base Reward: `+25 ⭐`
  - Margin Bonus: `+15 ⭐` for every point difference (`playerScore - botScore`)
  - Difficulty Multiplier:
    - **Casual Duckling:** `1.0x`
    - **Pond Pro:** `1.5x`
    - **Mallard Master:** `2.0x`
  - *Example:* Winning 7 - 1 on Pond Pro awards: `(25 + 6 × 15) × 1.5 = +172 ⭐`!

- **Round Defeats:**
  - Awards a `+5 ⭐` effort bonus so your points **never decrease**!
  - All unlocked skins remain unlocked forever.

- **Persistent Progress:**
  - Points and currently equipped skins are saved automatically in your browser's `localStorage`.

---

## 🎮 Controls & Shortcuts

| Input | Action |
| :--- | :--- |
| **Mouse Move** | Slide paddle vertically |
| **Touch & Drag** | Move paddle on mobile and tablets |
| **W / S** or **↑ / ↓** | Keyboard paddle movement |
| **Spacebar** | Start game or resume round |
| **P** | Pause / resume game |
| **R** or **🔄 Restart** | Instantly restart round/game |
| **🎨 Skins Button** | Open Duck Wardrobe |
| **🔊 Sound Button** | Toggle procedural sound effects |

---

## 🚀 Quick Start (Play Locally)

Open directly in your web browser:
```bash
open index.html
```

Or run a local HTTP server:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

---

## 🌐 Deploy to GitHub Pages

1. Navigate to: `https://github.com/YoletG/Duck-Ping-Pong/settings/pages`
2. Under **Build and deployment > Branch**, select `main` and `/ (root)`.
3. Click **Save**. Your game will be live at `https://yoletg.github.io/Duck-Ping-Pong/`!

---

## 📜 License
MIT License. Created by [YoletG](https://github.com/YoletG).
