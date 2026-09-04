# 🎬 Een Tegen 100 - Deployment Guide

## 📋 Project Overview

This is a complete web-based implementation of the Dutch gameshow "Een Tegen 100" with:
- **Controller Interface** - Game operator controls and question upload
- **Spectator Interface** - Live audience display with 1 vs 100 visualization
- **Pure HTML/CSS/JavaScript** - No npm dependencies, works on GitHub Pages
- **Real-time Sync** - Uses localStorage for client-side state management

## 🚀 Quick Start - Local Testing

### Option 1: Python (Recommended)
```bash
# Run the included test server
python3 test-server.py

# Then open in your browser:
# Controller: http://localhost:8000/public/controller.html
# Spectator:  http://localhost:8000/public/spectator.html
```

### Option 2: Node.js Simple Server
```bash
# Using npx (no installation needed)
npx http-server

# Then open:
# Controller: http://localhost:8080/public/controller.html
# Spectator:  http://localhost:8080/public/spectator.html
```

### Option 3: Using Python's built-in server
```bash
python3 -m http.server 8000

# Then open:
# Controller: http://localhost:8000/public/controller.html
# Spectator:  http://localhost:8000/public/spectator.html
```

## 📦 Project Structure

```
.
├── game-engine.js              # Core game logic & state management
├── public/
│   ├── controller.html         # Operator interface
│   ├── controller.css          # Controller styles
│   ├── controller.js           # Controller interactions
│   ├── spectator.html          # Audience display
│   ├── spectator.css           # Spectator styles
│   └── spectator.js            # Spectator updates
├── audio/                      # 13 sound effects
├── graphics/                   # Game visuals
├── background.png              # Game background
├── test-server.py              # Local test server
├── DEPLOYMENT.md              # This file
└── README.md                   # Full documentation
```

## 🌐 GitHub Pages Deployment

### Step 1: Enable GitHub Pages

1. Go to your repository: `github.com/gumballfan2k7/eentegen100`
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: `Deploy from a branch`
   - **Branch**: Select `main` (or your branch) and `/root`
4. Click **Save**

### Step 2: Verify Deployment

GitHub will build and deploy your site. Check the "Deployments" section for status.

### Step 3: Access Your Game

Once deployed, access at:
- **Controller**: `https://gumballfan2k7.github.io/eentegen100/public/controller.html`
- **Spectator**: `https://gumballfan2k7.github.io/eentegen100/public/spectator.html`

## 📱 How to Use

### For Game Operators (Controller)

1. **Upload Questions**
   - Prepare an Excel file (.xlsx) with columns:
     - Question
     - OptionA, OptionB, OptionC, OptionD
     - CorrectAnswer (A, B, C, or D)
     - Category (optional)
     - Difficulty (1-3, optional)
   - Drag & drop or click to upload

2. **Start Game**
   - Click "Start Game" button
   - Questions load automatically
   - Open spectator link in another window/device

3. **Run Questions**
   - Question appears on both controller and spectator
   - Select the correct answer (A-B-C-D)
   - Enter number of mob members eliminated
   - Click "Confirm Answer"
   - Results display on spectator

4. **Use Lifelines** (Optional)
   - **Poll the Mob**: Show percentage breakdown of mob votes
   - **Ask the Mob**: Get advice from 2 members (1 correct, 1 random)
   - **Trust the Mob**: Auto-select mob's majority answer

5. **Next Question**
   - Click "Next Question" to proceed
   - Game ends if controller gets an answer wrong

### For Spectators (Audience)

1. Open the Spectator link
2. Watch the live game display:
   - Current question and answers
   - 10×10 mob grid (green = alive, red = eliminated)
   - Prize ladder progress
   - Lifeline availability
3. Keyboard shortcuts (for testing):
   - **R** - Reveal correct answer
   - **M** - Toggle audio mute

## 🎮 Game Rules (from Wikipedia)

### Core Mechanics
- **1 vs 100**: One contestant plays against 100 mob members
- **Objective**: Eliminate all 100 by answering correctly
- **Question Format**: Multiple choice (4 options: A, B, C, D)
- **Timing**: Mob votes first (6 seconds), then The One answers
- **Elimination**: Wrong mob members = eliminated
- **Win Condition**: Eliminate all 100 mob members
- **Loss Condition**: The One answers incorrectly

### Lifelines
1. **Poll the Mob** - See how many voted for each answer
2. **Ask the Mob** - Get help from 2 members (1 is correct)
3. **Trust the Mob** - Automatically pick the most popular answer

### Prize Progression
- €500, €1K, €2K, €5K, €10K, €20K, €50K, €100K, €250K, €500K, €1M
- Prize increases with each mob elimination
- Increases every 10 eliminations

## 🎨 Styling & Theming

The interface uses a custom game show style based on YouTube reference:
- **Orange (#FF6B00)** - Primary accent
- **Blue (#0066FF)** - Secondary accent
- **Green (#00CC44)** - Success/alive
- **Red (#FF3333)** - Danger/eliminated
- **Dark backgrounds** - Professional appearance

Customize by editing:
- `public/controller.css` - Controller styling
- `public/spectator.css` - Spectator styling

## 🔊 Audio Files

13 integrated sound effects (in `audio/` folder):
- `bed_cue.mp3` - Game start/background
- `correct_answer.mp3` - Right answer
- `wrong_answer.mp3` - Wrong answer
- `eliminated.mp3` - Member eliminated
- `lock_in.mp3` - Answer confirmed
- `suspense.mp3` - Tension building
- `reveal_question.mp3` - Question appears
- `category.mp3` - Category announcement
- `chosen_one.mp3` - Player selected
- `use_lifeline.mp3` - Lifeline used
- `6_seconds.mp3` - Mob timer
- `cha_ching.mp3` - Money sound
- `waiting_for_elimination.mp3` - Waiting for results

Control audio with **M** key (Mute/Unmute)

## 🖼️ Graphics Assets

Used in the UI (in `graphics/` folder):
- `question_bar.png` - Question display background
- `lifelines.png` - Lifeline indicators
- `category_type.png` - Category badge
- `answer_a.png`, `answer_b.png`, etc. - Answer option graphics
- `1_vs_X.png` - 1 vs 100 visualization

Plus main background image:
- `background.png` - Game show background

## 🔐 Data Storage

All game state is stored locally in your browser using **localStorage**:
- Question sets persist during the game session
- Game state syncs between controller and spectator windows
- Data stays on your device (no cloud storage)
- Clear browser cache to reset the game

## 🐛 Troubleshooting

### Questions not uploading?
- Ensure Excel file has correct column headers
- File must be in .xlsx format (not .xls)
- All columns required: Question, OptionA-D, CorrectAnswer

### Spectator not updating?
- Keep both windows open
- Spectator auto-refreshes every 500ms
- Check browser console (F12) for errors

### Audio not playing?
- Check browser audio permissions
- Press 'M' to toggle mute
- Audio files must be in `audio/` folder

### CORS or file not found errors?
- Use local test server (Python, Node, or other)
- GitHub Pages has CORS restrictions
- Direct file:// protocol doesn't work

## 📊 Browser Compatibility

✅ Tested and working on:
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Advanced Deployment

### Custom Domain
1. Add CNAME file pointing to your domain
2. Configure DNS records
3. GitHub Pages will automatically set up HTTPS

### CI/CD Automation
GitHub Actions can auto-deploy on push. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/upload-pages-artifact@v2
        with:
          path: '.'
      - uses: actions/deploy-pages@v2
```

## 📝 Excel Question Template

Save as `.xlsx` file:

```
Question | OptionA | OptionB | OptionC | OptionD | CorrectAnswer | Category | Difficulty
---------|---------|---------|---------|---------|---------------|----------|----------
What is the capital of France? | London | Paris | Berlin | Amsterdam | B | Geography | 1
In what year did the Titanic sink? | 1912 | 1915 | 1910 | 1920 | A | History | 2
```

## 🔄 Update Frequency

Game state updates:
- Controller → localStorage (instant)
- Spectator polls → every 500ms
- Lifeline results → instant
- Audio playback → real-time

This creates smooth, responsive gameplay with minimal latency.

## 📞 Support

For issues:
1. Check browser console (F12)
2. Verify all files are uploaded
3. Ensure graphics and audio folders exist
4. Clear browser cache and try again

## 🎉 Ready to Play!

Your Een Tegen 100 game show platform is ready for:
- Corporate events
- Educational activities
- Family game nights
- Online streaming
- Classroom learning

Enjoy the game! 🎬🎮

---

*Last updated: 2026-09-04*
*Based on "Een Tegen 100" - Dutch game show format*
