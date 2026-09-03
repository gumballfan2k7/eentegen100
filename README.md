# Een Tegen 100 - Interactive Game Show Platform

A full-featured web platform for hosting the Dutch gameshow "Een Tegen 100" with separate controller and spectator interfaces.

## Features

✅ **Controller Website**
- Upload question sets from Excel (.xlsx) files
- Control game flow: start, next question, end game
- Select and submit correct answers
- Manage lifelines (Poll the Mob, Ask the Mob, Trust the Mob)
- Real-time game statistics display

✅ **Spectator Website**
- Real-time synchronized view with controller
- Live question display with multiple choice options
- Animated mob grid showing contestant elimination status
- Prize ladder display
- Lifeline availability indicators
- Audio feedback for correct/incorrect answers

✅ **Game Mechanics**
- One contestant versus 100 contestants (The Mob)
- Contestants eliminated by incorrect mob answers
- Prize pool increases with each correct answer
- Three types of lifelines for assistance
- Real-time WebSocket synchronization

## Project Structure

```
├── server.js                 # Express backend with WebSocket support
├── package.json             # Node dependencies
├── public/
│   ├── controller.html      # Controller interface
│   ├── controller.css       # Controller styles
│   ├── controller.js        # Controller logic
│   ├── spectator.html       # Spectator view
│   ├── spectator.css        # Spectator styles
│   ├── spectator.js         # Spectator WebSocket client
│   └── example-questions.xlsx  # Template for question upload
├── audio/                   # Game sound effects
│   ├── correct_answer.mp3
│   ├── wrong_answer.mp3
│   ├── eliminated.mp3
│   ├── lock_in.mp3
│   ├── suspense.mp3
│   ├── reveal_question.mp3
│   ├── category.mp3
│   ├── chosen_one.mp3
│   ├── use_lifeline.mp3
│   ├── 6_seconds.mp3
│   ├── cha_ching.mp3
│   ├── waiting_for_elimination.mp3
│   └── bed_cue.mp3
├── graphics/                # Game visual assets
│   ├── question_bar.png
│   ├── lifelines.png
│   ├── category_type.png
│   ├── answer_*.png
│   └── 1_vs_X.png
└── background.png           # Game background

```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   The server runs on `http://localhost:3000`

3. **Access the interfaces:**
   - **Controller:** http://localhost:3000/public/controller.html
   - **Spectator:** http://localhost:3000/public/spectator.html

## Usage

### For Game Show Operators (Controller):

1. Open the controller interface in a web browser
2. **Upload Questions:**
   - Prepare an Excel file with your questions (see template below)
   - Click the upload area or drag & drop the file
   - Click "Upload Questions"

3. **Run the Game:**
   - Click "Start Game" to begin
   - Questions are loaded automatically
   - Select the correct answer (A-D)
   - Click "Submit Correct Answer"
   - Use lifelines as needed
   - Click "Next Question" for the next round
   - Click "End Game" when done

### For Spectators:

1. Open the spectator interface in a web browser (or full-screen on a projector)
2. The view automatically syncs with the controller in real-time
3. Watch the question, answers, and mob elimination progress
4. Use keyboard shortcuts:
   - **R** - Reveal answer (for testing)
   - **M** - Toggle audio mute

## Excel Question Template Format

Create an .xlsx file with the following columns:

| Question | OptionA | OptionB | OptionC | OptionD | CorrectAnswer | Category | Difficulty |
|----------|---------|---------|---------|---------|---------------|----------|-----------|
| What is the capital of France? | London | Paris | Berlin | Amsterdam | B | Geography | 1 |
| In what year did the Titanic sink? | 1912 | 1915 | 1910 | 1920 | A | History | 2 |

**Column Details:**
- **Question:** The question text (required)
- **OptionA-D:** Answer options (required, must have exactly 4)
- **CorrectAnswer:** The letter of the correct answer (A, B, C, or D)
- **Category:** Question category (optional)
- **Difficulty:** Difficulty level 1-3 (optional)

## Game Rules

Based on "Een Tegen 100" format:

- **One Contestant** vs **100 Mob Members**
- **Objective:** Eliminate all 100 by answering trivia questions correctly
- **Mechanics:**
  - Multiple choice questions with 4 options
  - Mob gets 6 seconds to answer before contestant
  - If one contestant is correct → wrong mob members are eliminated
  - If contestant is wrong → game ends (in standard variant)
  - Prize money increases per successful elimination
  
- **Lifelines:**
  1. **Poll the Mob** - See percentage breakdown of mob answers
  2. **Ask the Mob** - Get advice from 2 random mob members (one correct)
  3. **Trust the Mob** - Automatically accept the mob's majority answer

- **Cash Out:**
  - Contestant can choose to leave with accumulated winnings
  - Or risk everything for the next question

## API Endpoints

### Upload Questions
```
POST /api/upload-questions
- Multipart form data with 'file' field
- Returns: { success: true, count: number, questions: array }
```

### Game Control
```
POST /api/controller/start-game
POST /api/controller/load-question { questionIndex: number }
POST /api/controller/submit-answer { answer: string, isCorrect: boolean }
POST /api/controller/use-lifeline { lifeline: string }
POST /api/controller/end-game
```

### WebSocket Spectator Feed
```
WS /ws/spectator
- Real-time game state updates
- Message type: 'gameStateUpdate'
- Payload: current game state object
```

## Browser Compatibility

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

## Audio & Graphics

The platform includes:
- **13 sound effects** for game events (correct answer, elimination, suspense, etc.)
- **Game graphics** matching the YouTube reference video
- **Background image** for atmosphere
- **Responsive design** for various screen sizes

## Customization

### Styling
Edit the CSS files to customize colors, fonts, and layouts:
- `public/controller.css` - Controller interface appearance
- `public/spectator.css` - Spectator view appearance

### Sound Effects
Replace audio files in the `audio/` directory with your own:
- `correct_answer.mp3` - Plays when answer is correct
- `wrong_answer.mp3` - Plays when answer is wrong
- `eliminated.mp3` - Plays when contestant is eliminated
- etc.

## Troubleshooting

**Questions not uploading?**
- Ensure Excel file has correct column names
- Check file is in .xlsx format
- Verify all required columns are present

**Spectator not syncing?**
- Ensure WebSocket connection is established (check browser console)
- Verify both are on same network
- Check controller URL matches WebSocket connection URL

**Audio not playing?**
- Check browser permissions for audio playback
- Ensure audio files exist in `audio/` directory
- Try pressing 'M' to toggle audio mute

## Development

To run in development mode with auto-reload:
```bash
npm run dev
```

## License

MIT

## Support

For issues or questions, refer to the repository documentation or create an issue.

---

**Game Format Reference:** Based on "Een Tegen 100" (Dutch: "One Against 100"), a game show format with multiple international versions.
