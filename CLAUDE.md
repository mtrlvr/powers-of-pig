# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Powers of Pig is a mobile-first 2048 clone web game where numbers are replaced by increasingly absurd pigs (17 tiers, from "Pip" to "THE LION PIG").

## Development Commands

```bash
npm run dev    # Start local dev server on port 3000
```

## Project Structure

```
src/
  index.html         # Main HTML with all screens (home, game, pause, collection, etc.)
  styles.css         # All styling (responsive, tile colors, animations)
  game.js            # Core game engine (Game class, state management, rendering)
  strings.js         # Centralized UI strings with EN/FR translations
  assets/
    pigs/            # 17 pig images (1.pip.png through 17.thelionpig.png)
```

## Architecture

- **Single-page app** with vanilla HTML/CSS/JavaScript (no frameworks)
- **Game class** in game.js handles all game state, logic, and rendering
- **Grid-based rendering** - CSS Grid for both background cells AND tile positioning (no JS pixel math)
- **Touch + keyboard input** - swipe detection (with threshold) and arrow keys
- **Sound system** - Preloaded MP3 files with 17 unique oink sounds per tier
- **Haptics** - Vibration API patterns synced with sounds on supported devices
- **Persistence** - localStorage for game state, unlocked badges, high score
- **Localisation** - English/French language toggle on all screens, persisted to localStorage

## Development Philosophy

**Keep it simple.** This is a casual mobile game - avoid over-engineering:
- Let CSS handle layout (Grid, Flexbox) instead of calculating pixels in JS
- Don't add abstractions until they're clearly needed
- Test on mobile early and often - mobile browsers behave differently

## Key Implementation Details

### Tile Positioning
Tiles use **CSS Grid placement** (`grid-column` and `grid-row`) - NOT JavaScript pixel calculations. Both `.grid-background` (cells) and `.tile-container` (tiles) use identical CSS Grid layouts, so tiles automatically align perfectly on all screen sizes and browsers.

**Important lesson learned:** Don't overcomplicate tile positioning with JS measurements (`getBoundingClientRect`, `getComputedStyle`, etc.). CSS Grid handles responsive layouts natively - just place tiles in grid cells and let CSS do the work.

### Sound System (Web Audio API)
Sound uses the **Web Audio API** (`AudioContext` + `AudioBuffer`) instead of `HTMLAudioElement` for iOS compatibility. iOS requires audio to be unlocked during a user gesture - the `AudioContext` is created when the user taps the Play button, which properly unlocks it. Sounds are preloaded as `AudioBuffer` objects and played via `BufferSourceNode`. The `audioContext.resume()` call handles iOS suspending audio when the app goes to background.

### PIGS Constant
Each tier defined with: `{ tier, name, color, icon, image }` - image paths point to `assets/pigs/` folder.

### Screens
- Home, Game, Pause (overlay), Game Over, Win, Collection (badge gallery), Feedback (overlay)

### Feedback System
A two-question feedback modal appears on game over (before the game over screen) and can also be triggered via the "Give Feedback" link during gameplay.

**Questions:**
1. "Who would you send this to?" — free text input, optional
2. "What would make it better?" — free text input, optional

**Buttons:**
- "Submit" — sends data to Supabase, then proceeds
- "Maybe later" — skips feedback

**Context-aware behaviour:**
- `context: 'gameOver'` — after submit/skip, shows game over screen
- `context: 'inGame'` — after submit/skip, closes modal and returns to game

**Data captured:**
- `send_to_text` — answer to question 1
- `improvement_text` — answer to question 2
- `highest_pig_reached` — tier number (1-17)
- `score` — final score
- `moves` — total moves made
- `duration_seconds` — game duration
- `device_type` — 'mobile' or 'desktop'
- `submitted_at` — timestamp

Data sent to Supabase `player_feedback_comments` table. Supabase config (URL and anon key) is at the top of game.js.

### Analytics System (PostHog)
PostHog is integrated for player behaviour tracking during soft launch. The SDK is loaded in `index.html` head.

**Events tracked:**
| Event | When Triggered | Key Payload |
|-------|----------------|-------------|
| `session_start` | Page load | Auto-captured by PostHog |
| `game_start` | New game begins | — |
| `merge` | Tier 6+ merges | `from_tier`, `to_tier`, `to_pig_name` |
| `milestone_reached` | First time reaching a tier (ever) | `tier`, `pig_name` |
| `game_over` | No valid moves | `highest_tier`, `score`, `moves`, `duration_seconds` |
| `feedback_shown` | Feedback modal appears | `context` ('gameOver' or 'inGame') |
| `feedback_submitted` | User submits feedback | `context`, `has_send_to`, `has_improvement` |
| `feedback_skipped` | User clicks "Maybe later" | `context` |

**User journey:**
```
session_start → game_start → [merges, milestones] → game_over
    → feedback_shown(gameOver) → feedback_submitted OR feedback_skipped
    → game_start (new game) → ...
```

**Implementation details:**
- `Analytics` helper object in game.js handles all tracking with fire-and-forget pattern
- Milestones persist in localStorage (`pop_milestones_reached`) to prevent duplicate events across sessions
- Merge events filtered to tier 6+ to reduce volume
- Session replay enabled
- PostHog config: `phc_hX8ezASA5I3IAhaSnH0XlcU4ePBW22CvdytKIAUyOtu` on `us.posthog.com`

### Localisation System
The game supports English and French with a language toggle visible on all screens.

**Key files:**
- `strings.js` - Contains `STRINGS` object with `en` and `fr` keys, plus helper functions (`getCurrentLanguage()`, `setLanguage()`, `getStrings()`, `toggleLanguage()`)
- HTML elements use `data-i18n` attributes for text content and `data-i18n-placeholder` for input placeholders

**How it works:**
- Language preference stored in localStorage under `powersofpig-language`
- On first load, detects browser locale (defaults to French if `fr*`, otherwise English)
- `getStrings()` returns the current language's string object
- `updateAllText()` method in Game class refreshes all UI text when language changes
- Pig names are localized via `strings.pigs[tier]` lookup

**Adding new strings:**
1. Add the string to both `STRINGS.en` and `STRINGS.fr` in strings.js
2. Add `data-i18n="section.key"` attribute to the HTML element
3. For dynamic text, call `getStrings().section.key` directly in JavaScript

## Build Phases (All Complete)

1. **Core Game Engine** - 4x4 grid, tile spawning, merge logic, win/lose detection
2. **Pig Identity** - 17 pig tiers with names, colors, icons replacing numbers
3. **Screens & Navigation** - All game screens with transitions
4. **Persistence** - localStorage for state, badges, high score
5. **Animations** - Smooth sliding, merge pop, spawn effects via CSS
6. **Sound** - 17 unique oink sounds using Web Audio API oscillators
7. **Haptics** - Vibration patterns on move, merge, win, game over
8. **Visual Polish** - Custom pig images, tile alignment fixes, responsive design
9. **Feedback System** - Two-question feedback modal on game over and in-game, stored in Supabase
10. **Localisation** - English/French language toggle with browser locale detection and localStorage persistence
11. **Analytics** - PostHog integration for player behaviour tracking
12. **Reddit Launch Prep** - Removed password gate and lives system, streamlined feedback flow
