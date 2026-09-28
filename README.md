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
As rallies unfold, ducks **flood in continuously** from both sides in rapid streams (spawning in waves of 1–3 ducks up to 18 on screen simultaneously!):
- **🦆 Normal Ducks:**
  - Cute sunny yellow ducks that swim peacefully across the pond, flapping their wings and bobbing naturally with water ripples.
  - Can be rallied by your paddle (`+5 ⭐ Duck Saved!`) with cheerful quacks and golden feather bursts!
  - Deflecting a normal duck past the bot paddle awards a **`+15 ⭐ Rescue Bonus`**!
  - Can bump harmlessly into other ducks with playful quacks and splashes.
- **😈 Spinning Red Evil Ducks:**
  - Fiery crimson ducks with spiky horns and sinister glowing eyes that **continuously spin 360°** across the pond!
  - Strike them with your paddle to deflect them back toward the bot (`+5 ⭐ Deflection Bonus`)!
  - Colliding mid-air with other ducks triggers an explosion of red feathers and shockwaves!
  - Knocking an evil duck past the bot paddle awards a **`+15 ⭐ Evil Banish Bonus`**!
- **HUD Flood Tracker:** Live counter displays the number of active normal and evil ducks in the pond (`🦆 X · 😈 Y`).

---

### 🤵 Tuxedo Duck & 🪖 Secret Service Escort Ducks
Watch out for the mysterious **VIP Tuxedo Boss Duck**:
- **Dapper Style:** Wears a tailored black tuxedo with silk tails, crisp white dress shirt, red bow tie, dark shades, and a sharp slick **blonde haircut that leans forward**!
- **Strictly One at a Time:** Only **one** Tuxedo Duck can ever appear in the pond at any given time.
- **The Bodyguard Law:**
  - **Your Game Ball is EXEMPT:** If the Tuxedo Duck touches the main ball duck you are playing with, they bounce off each other normally.
  - **Any OTHER Duck is ARRESTED:** Whatever other duck the Tuxedo Duck touches (Normal duck or Evil duck) will immediately be apprehended!
  - **Two Ducks in Helmets & Suits:** A pair of tactical security ducks wearing SWAT helmets and dark suits swoop down from above with flashing police lights (`🚨`), grasp the target duck on both sides, and carry it straight up into the sky (`+20 ⭐ Arrest Bonus!`).
  - **Audio:** Features suave dapper quacks and a comical two-tone police siren!

---

### ⭐ Margin-Based Points & Rating System
Your points update after each round based on **how much you win by or lose by**:

- **Winning a Round:**
  - Base Reward: `+25 ⭐`
  - Margin Bonus: `+15 ⭐` for every point difference (`playerScore - botScore`)
  - Difficulty Multiplier:
    - **Casual Duckling:** `1.0x`
    - **Pond Pro:** `1.5x`
    - **Mallard Master:** `2.0x`
  - *Example:* Winning 7 - 1 on Pond Pro awards: `(25 + 6 × 15) × 1.5 = +172 ⭐`!

- **Losing a Round:**
  - Base Loss: `-15 ⭐`
  - Deficit Penalty: `-8 ⭐` for each point deficit (`botScore - playerScore`)
  - Harder bots reduce the point penalty to reward brave players.
  - *Note:* Points cannot drop below 0.

- **Persistent Progress:**
  - Your points and currently equipped skin are saved automatically in your browser's `localStorage`.

---

## 🎮 Controls & Shortcuts

| Input | Action |
| :--- | :--- |
| **Mouse Move** | Slide paddle vertically |
| **Touch & Drag** | Move paddle on mobile and tablets |
| **W / S** or **↑ / ↓** | Keyboard paddle movement |
| **Spacebar** | Start game or resume round |
| **P** | Pause / resume game |
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
