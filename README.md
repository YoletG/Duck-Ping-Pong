# Duck Ping Pong 🦆🏓

An arcade pond game built with vanilla HTML5, CSS3, and JavaScript. Rally an adorable duck back and forth across a lily pad pond against an AI-controlled opponent paddle.

---

## 🌟 What's New: Skins & Points System

### 🎨 7 Unique Duck Skins
Unlock and equip customizable duck skins in the in-game **Duck Wardrobe**:
1. **Classic Ducky (0 ⭐):** The iconic bright yellow rubber ducky.
2. **Wild Mallard (150 ⭐):** Glossy emerald green head, white collar ring, and chestnut plumage.
3. **Cool Shades (300 ⭐):** Equipped with dark sunglasses with reflective glare.
4. **Pink Flamingo (450 ⭐):** Pastel pink plumage with a black-tipped curved bill.
5. **Shadow Ninja (600 ⭐):** Stealthy obsidian duck with a red headband and glowing eyes.
6. **Golden Emperor (800 ⭐):** Radiant golden feathers crowned with a royal ruby jewel and shimmering sparkles.
7. **Mecha Cyber-Duck (1000 ⭐):** High-tech titanium cyber duck with an electric neon cyan visor.

Each skin features unique colors, custom accessories, distinct quack audio frequencies/synthesizers, and personalized particle effects!

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
