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
- **Tile animation system** - Tiles use absolute positioning with CSS transforms for smooth sliding animations
- **Touch + keyboard input** - swipe detection (with threshold) and arrow keys
- **Sound system** - Preloaded MP3 files with 17 unique oink sounds per tier
- **Haptics** - Vibration API patterns synced with sounds on supported devices
- **Persistence** - localStorage for game state, unlocked badges, high score
- **Localisation** - English/French language toggle on all screens, persisted to localStorage

## Development Philosophy

**Keep it simple.** This is a casual mobile game - avoid over-engineering:
- Don't add abstractions until they're clearly needed
- Test on mobile early and often - mobile browsers behave differently

## Key Implementation Details

### Tile Positioning & Animation System
Tiles use **absolute positioning with CSS transforms** (`transform: translate(x, y)`) for smooth sliding animations.

**Architecture:**
- Each tile has a unique `id` (auto-incrementing counter)
- `tileElements` Map tracks tile ID → DOM element for persistence across renders
- `cellPositions` cache stores pixel positions measured from actual `.cell` elements
- `isAnimating` flag blocks input during 120ms slide animations

**How it works:**
1. `calculateCellPositions()` measures cell positions using `offsetLeft`/`offsetTop`/`offsetWidth`/`offsetHeight`
2. `render()` creates/updates/removes tile DOM elements based on tile IDs (no `innerHTML` clearing)
3. `move()` captures old positions, runs game logic, then calls `animateTileMovements()`
4. CSS `transition: transform 120ms cubic-bezier(0.25, 1, 0.5, 1)` handles smooth animation

**Critical mobile alignment details:**
- **DO NOT use `getBoundingClientRect()`** for position measurement - it returns viewport-scaled values on mobile browsers which causes misalignment
- Use `offsetLeft`/`offsetTop` which return layout pixels unaffected by viewport scaling
- `.tile-container` must be inset by the same padding as `.board-container` (12px desktop, 8px mobile) so it occupies the exact same space as `.grid-background`
- Cell positions are measured relative to `.board-container`, then the padding is subtracted since tiles are positioned within the inset `.tile-container`
- Tile dimensions use **both** `cell.offsetWidth` AND `cell.offsetHeight` separately - cells may not be perfectly square on all devices

**Animation classes use `scale` property (not `transform: scale()`)** to avoid overriding the position transform:
- `.tile.new` - spawn animation
- `.tile.merged` - merge pop animation
- `.tile.celebration-scale` - first merge celebration

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

Data sent to Supabase `player_feedback_comments` table. Supabase config (URL and anon key) is at the top of game.js. Row-Level Security (RLS) is enabled on the table.

**Security hardening:**
- Input length limits: `maxlength="500"` on text input, `maxlength="1000"` on textarea
- Rate limiting: Max 1 submission per 60 seconds (tracked in sessionStorage via `pop_last_feedback`)
- Honeypot field: Hidden `#feedback-honeypot` input catches bots that auto-fill all fields
- Defense in depth: JS validates lengths before submission even though HTML enforces maxlength

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

### Tutorial & Help System
First-time players get a guided tutorial, and all players have access to a "Stuck?" help system.

**Tutorial Flow:**
1. **Move 0**: Two Pips placed at `[3,1]` and `[3,2]` so RIGHT swipe merges them. Arrow points right, instruction text shows "Swipe to push pigs together". Wrong directions are blocked.
2. **Move 1**: First merge triggers confetti celebration and "Pip + Pip = Sprout!" text. Then shows "Match pigs to discover all 17!" for 2.5 seconds.
3. **Moves 2-4**: Subtle pulsing highlight on mergeable tiles when available.
4. **Move 5+**: Tutorial marked complete, localStorage flag set.

**First Merge Celebration:**
- Confetti burst (20 colorful pieces) contained within board area
- "Pip + Pip = Sprout!" text with bounce animation
- Scale-up animation on the merged Sprout tile
- Only happens once ever (persisted via `pop_first_merge_celebrated`)

**"Stuck?" Help System:**
- Appears after 10 seconds of inactivity (non-tutorial games only)
- Replaces instruction text with "Stuck?" (clickable)
- On click: shows directional arrow for recommended move
- Arrow auto-hides after 5 seconds or on next swipe
- Recommended direction calculated by simulating all moves and scoring merges

**localStorage Keys:**
- `pop_tutorial_complete`: Tutorial finished flag
- `pop_first_merge_celebrated`: First celebration shown

**Analytics Events:**
- `tutorial_started`: First game with tutorial
- `tutorial_completed`: After move 5 (payload: `moves`)
- `stuck_hint_shown`: After 10s inactivity
- `stuck_hint_used`: User clicks "Stuck?" (payload: `recommended_direction`)

### Game Over Screen & Share System
Full-screen game over experience with shareable content for viral growth.

**Game Over Screen Layout:**
- **Hero section**: Large pig image (160px), pig name, tier indicator ("Tier X of 17")
- **Crown**: Displayed only for tier 17 (THE LION PIG) instead of tier indicator
- **Score section**: Locale-formatted score with share message preview
- **Buttons**: Share (primary), Play Again (secondary), View Board + Home (tertiary text links)

**Share Functionality:**
- Uses `html2canvas` library (~40KB CDN) for image capture
- Share card: 400x500px with pig image, score, message, CTA
- Web Share API on mobile with image attachment
- Clipboard fallback on desktop with toast notification
- Mid-game share button in game header

**Share Messages (localized):**
- EN: "I reached {pigName} and scored {score}. Can you beat me?"
- FR: "J'ai atteint {pigName} et marqué {score} points. Est-ce que tu peux faire mieux ?"

**Number Formatting:**
- `formatNumber()` helper uses `Intl.NumberFormat`
- EN: comma separator (1,234)
- FR: narrow no-break space (1 234)

**View Board Feature:**
- Captures board state before game over (`captureBoardState()`)
- Modal overlay with frozen final grid (non-interactive)
- Uses same CSS Grid layout as game board

**Key Components:**
- `ShareSystem` object: `canNativeShare()`, `captureShareCard()`, `nativeShare()`, `copyToClipboard()`
- `#share-card`: Hidden off-screen element for html2canvas capture
- `#view-board-overlay`: Modal for viewing final board state
- `#share-mid-game-button`: Header button for mid-game sharing

**Analytics Events:**
| Event | Trigger | Payload |
|-------|---------|---------|
| `game_over_screen_viewed` | Game over screen shown | `highest_tier`, `score` |
| `share_initiated` | Share button clicked | `context`, `method`, `highest_tier`, `score` |
| `share_completed` | Share successful | `context`, `method` |
| `share_cancelled` | User cancels share sheet | `context` |
| `view_board_clicked` | View Board clicked | — |

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
13. **Security Hardening** - Input validation, rate limiting, honeypot anti-bot on feedback form
14. **Tutorial & Help System** - First-time tutorial with guided first merge, confetti celebration, and "Stuck?" help
15. **Game Over & Share System** - Full-screen game over with hero pig, locale-formatted scores, image sharing via html2canvas, View Board feature
16. **Tile Sliding Animation** - Smooth 120ms CSS transform animations for tile movement, DOM persistence via tile IDs, async move() with animation blocking
