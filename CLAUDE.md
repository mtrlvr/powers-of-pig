# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Project Overview

Powers of Pig is a mobile-first 2048 clone. Numbers are replaced by increasingly absurd pigs — 17 tiers, from "Pip" to "THE LION PIG".

## Development Commands

```bash
npm run dev    # Start local dev server on port 3000
```

## gstack

Use `/browse` from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

**Available skills:**
- `/plan-ceo-review` — CEO-level plan review
- `/plan-eng-review` — Engineering plan review
- `/review` — Code review
- `/ship` — Ship code
- `/browse` — Web browsing
- `/retro` — Retrospective

## Project Structure

```
src/
  index.html         # Main HTML with all screens (home, game, pause, collection, etc.)
  styles.css         # All styling (responsive, tile colors, animations)
  constants.js       # Supabase config, PIGS definitions, storage keys
  strings.js         # Centralized UI strings with EN/FR translations
  levels.js          # Campaign mode levels, worlds, modifiers, goal validation
  utils.js           # Helper functions (getPig, getNextPig, preloadPigImages)
  analytics.js       # PostHog event tracking and milestone management
  tracking.js        # Supabase campaign event logging (session, level complete/fail)
  share.js           # Share system (Web Share API, html2canvas)
  sound.js           # Sound system (Web Audio API, 17 oink sounds)
  haptics.js         # Haptics system (Vibration API patterns)
  game.js            # Core game engine (Game class, state management, rendering)
  feedback.js        # Feedback system (modal, submission, rate limiting)
  assets/
    pigs/            # 17 pig images (1.pip.png through 17.thelionpig.png)
    sounds/          # 17 oink sounds (oink-01-pip.mp3 through oink-17-thelionpig.mp3)
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

## Writing Style

Follow The Economist style: clear, simple, direct. Before writing documentation, user-facing copy, or markdown files, read `WRITING_STYLE.md` for detailed guidelines.

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
Defined in `sound.js`. Sound uses the **Web Audio API** (`AudioContext` + `AudioBuffer`) instead of `HTMLAudioElement` for iOS compatibility. iOS requires audio unlocked during a user gesture. The `AudioContext` is created on Play tap, which unlocks it. Sounds are preloaded as `AudioBuffer` objects and played via `BufferSourceNode`. The `audioContext.resume()` call handles iOS background suspension.

### Campaign Mode System
Defined in `levels.js`. Two worlds with 8 levels each.

**Worlds:**
| World | Name | Levels | Unlocks When |
|-------|------|--------|--------------|
| 1 | The Farm | 1-8 | Always open |
| 2 | The Mudlands | 9-16 | Complete World 1 |

**Goal Types:**
- `reach_tier` — Create a pig of tier X
- `reach_tier_count` — Create tier X multiple times
- `reach_score` — Achieve target score
- `merge_count` — Perform X merges
- `clear_tier` — Remove all pigs of tier X

**Modifiers:**
- `time_limit` — Complete within X seconds
- `move_limit` — Maximum moves allowed
- `small_board` — 3x3 grid instead of 4x4
- `blocked_cells` — Specific cells inactive
- `single_cell_movement` — Tiles move only 1 cell per swipe

**Level Completion:**
- Level Complete overlay with score, emoji rating (4 options), pig unlock if applicable
- Level Failed overlay ("SO CLOSE!") with progress message and contextual tips
- Progress stored in localStorage under `pop_campaign`

### Undo System
Players can undo their last move. In campaign mode, `usedUndo` is tracked for analytics. Restores previous grid state, score, and move count.

### PIGS Constant
Defined in `constants.js`. Each tier defined with: `{ tier, name, color, icon, image }` - image paths point to `assets/pigs/` folder.

### Screens & Overlays

**Screens:**
- Home, World Select, Level Select, Game, Game Over, Win, Collection

**Overlays:**
- Pause, Restart Confirmation, Feedback, Level Complete, Level Failed ("SO CLOSE!"), World Introduction, View Board

### Feedback System
A two-question feedback modal appears on game over. Players can also trigger it via "Give Feedback" during play.

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
PostHog tracks player behaviour during soft launch. SDK loaded in `index.html` head.

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
- `Analytics` helper object in `analytics.js` handles all tracking with fire-and-forget pattern
- Milestones persist in localStorage (`pop_milestones_reached`) to prevent duplicate events across sessions
- Merge events filtered to tier 6+ to reduce volume
- Session replay enabled
- PostHog config: `phc_hX8ezASA5I3IAhaSnH0XlcU4ePBW22CvdytKIAUyOtu` on `us.posthog.com`

### Campaign Tracking System (Supabase)
Minimal event logging for campaign mode, stored directly in Supabase. Designed to answer: how many players, how far did they get, did anyone return?

**Events:**
| Event | When Triggered | Payload |
|-------|----------------|---------|
| `session_start` | Page load | `referrer` |
| `level_complete` | Campaign level won | `level_id`, `world` |
| `level_fail` | Campaign level failed | `level_id`, `world` |

**Implementation:**
- `Tracking` object in `tracking.js` with fire-and-forget pattern
- Player ID generated via `crypto.randomUUID()`, stored in localStorage (`pop_player_id`)
- Events sent to Supabase `events` table with `player_id`, `event_type`, `data` (JSONB), `created_at`
- Same Supabase project as feedback system (config in `constants.js`)

**localStorage key:** `pop_player_id` — persistent UUID for player identification

**Supabase table schema:**
```sql
CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id text NOT NULL,
  event_type text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
```

### Localisation System
English and French supported. Language toggle visible on all screens.

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
First-time players get a guided tutorial. All players can access the "Stuck?" help system.

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
Full-screen game over with shareable content for viral growth.

**Game Over Screen Layout:**
- **Hero section**: Large pig image (160px), pig name, tier indicator ("Tier X of 17")
- **Crown**: Displayed only for tier 17 (THE LION PIG) instead of tier indicator
- **Score section**: Locale-formatted score with share message preview
- **Buttons**: Share (primary), Play Again (secondary), View Board + Home (tertiary text links)

**Share Functionality:**
- Implemented in `share.js`
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
- `#share-card`: Hidden off-screen element (`left: -9999px`) for html2canvas capture - **DO NOT move on-screen during capture** as html2canvas can capture off-screen elements directly
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

## Current Features

**Game Modes:**
- Campaign Mode — 2 worlds, 16 levels, progressive difficulty
- Classic Mode — Endless 4x4, unlocks after World 1

**Core Gameplay:**
- 4x4 grid with 2048-style merging
- 17 pig tiers (Pip → THE LION PIG)
- Undo system
- Win at tier 17, game over when board fills

**Campaign Features:**
- 5 goal types, 5 modifier types
- Level complete/failed overlays
- Emoji level rating
- World introduction screens

**Player Guidance:**
- First-time tutorial with forced first merge
- First merge celebration (confetti)
- "Stuck?" help system

**Social:**
- Share card with pig image (html2canvas)
- Web Share API / clipboard fallback
- Mid-game share button
- View final board

**Polish:**
- 17 unique oink sounds (Web Audio API)
- Haptic feedback patterns
- Smooth 120ms tile animations
- Confetti celebration

**Infrastructure:**
- localStorage persistence
- Supabase feedback storage
- Supabase campaign tracking (session, level events)
- PostHog analytics
- English/French localisation

## Documentation Maintenance

When adding features, update:
1. `CLAUDE.md` — Technical details, implementation notes
2. `README.md` — User-facing features only
3. `CHANGELOG.md` — Version history
4. `docs/tree-of-pig.md` — Feature roadmap

When removing features:
1. Search all `.md` files for references
2. Update or remove outdated sections
3. Mark as "Pruned" in tree-of-pig.md
