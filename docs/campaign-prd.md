# Powers of Pig — Campaign Mode

## For Claude Code

This is a complete spec. Build everything, then we'll ship incrementally.

---

# CONTEXT

You're adding Campaign Mode to Powers of Pig, a 2048-style puzzle game with 17 pig tiers.

## Existing Codebase

```
src/
  index.html         # All screens as <div class="screen"> with .active toggling
  styles.css         # Uses .screen, .overlay, .modal, .btn-primary patterns
  game.js            # Single Game class handles everything
  strings.js         # STRINGS object with en/fr, data-i18n attributes
  assets/
    pigs/            # 1.pip.png through 17.thelionpig.png
    sounds/          # oink-01-pip.mp3 through oink-17-thelionpig.mp3
```

## Key Patterns to Follow

**Screens:** Add HTML with `class="screen"` and `id="xxx-screen"`, toggle via `this.showScreen('xxx')`

**Overlays:** Add HTML with `class="overlay"` and `id="xxx-overlay"`, toggle via `this.showOverlay('xxx')` / `this.hideOverlay('xxx')`

**Strings:** Add to `STRINGS.en` and `STRINGS.fr` in strings.js, use `data-i18n="section.key"` in HTML

**Storage:** Use localStorage with `pop_` prefix (e.g., `pop_campaign_progress`)

**Analytics:** Use existing `Analytics.track('event_name', { payload })`

**PIGS constant:** Already defines all 17 tiers with `{ tier, name, color, icon, image }`

## Key Methods in Game Class

- `startGame()` — initializes grid, spawns tiles, shows game screen
- `move(direction)` — handles swipe/keypress, returns early if `this.gameOver`
- `checkGameOver()` — returns true if no valid moves
- `showScreen(name)` — hides all screens, shows requested one
- `showOverlay(name)` / `hideOverlay(name)` — overlay management
- `render()` — updates DOM tiles from `this.grid`
- `saveGame()` / `loadGame()` — localStorage persistence

## What We're Adding

Campaign Mode: 40 levels across 4 worlds with goals, stars, and pig unlocks. Current endless mode becomes unlockable after completing World 1.

---

# V1 SCOPE — SHIP THIS FIRST

Build everything below, but V1 is just:

- ✅ World 1 only (10 levels)
- ✅ Basic star system (1-3 stars per level)
- ✅ Pig unlock quotes (text on unlock)
- ✅ "So Close!" failure messaging
- ✅ Simple level select (list, not journey map)
- ✅ Endless mode unlocks after Level 10
- ❌ No modifiers yet (all World 1 levels are standard 4×4)
- ❌ No host dialogues yet
- ❌ No journey map yet
- ❌ No cold open cinematic

**Why:** Get real retention data from real players before polishing.

---

# COMPLETE BUILD SPEC

## Core Concepts

### Worlds

| World | Name | Levels | Unlocks When |
|-------|------|--------|--------------|
| 1 | The Farm | 1-10 | Always open |
| 2 | The Manor | 11-20 | 15+ stars in World 1 |
| 3 | The City | 21-30 | 15+ stars in World 2 |
| 4 | The Cosmos | 31-40 | 15+ stars in World 3 |

### Level Structure

```javascript
{
  id: number,
  world: number,
  name: { en: string, fr: string },
  goal: { type: string, value: number, description: { en, fr } },
  modifiers: Modifier[],        // Empty array for V1
  starCriteria: { two: Criteria, three: Criteria },
  unlocksPig: number | null,
  hostIntro: { en: string, fr: string }  // V2
}
```

### Goal Types

| Type | Description | Check |
|------|-------------|-------|
| `reach_tier` | Create pig of tier X | Any tile reaches tier |
| `reach_score` | Score X points | Score >= value |
| `merge_count` | Perform X merges | Merge counter >= value |
| `clear_tier` | Remove all tier X from board | No tiles of that tier remain |

### Star Criteria Types

| Type | Value | Check |
|------|-------|-------|
| `max_moves` | number | Completed in <= N moves |
| `max_time` | number | Completed in <= N seconds |
| `min_score` | number | Score >= N |
| `no_undo` | boolean | Never used undo |

---

## All 40 Levels

### World 1: The Farm

```javascript
const WORLD_1_LEVELS = [
  {
    id: 1,
    name: { en: 'Baby Steps', fr: 'Premiers Pas' },
    goal: { type: 'reach_tier', value: 2, description: { en: 'Reach Sprout', fr: 'Atteins Pousse' } },
    modifiers: [],
    starCriteria: { two: { type: 'max_moves', value: 5 }, three: { type: 'no_undo' } },
    unlocksPig: 1
  },
  {
    id: 2,
    name: { en: 'Growing Up', fr: 'Grandir' },
    goal: { type: 'reach_tier', value: 3, description: { en: 'Reach Trotter', fr: 'Atteins Trotteur' } },
    modifiers: [],
    starCriteria: { two: { type: 'max_moves', value: 10 }, three: { type: 'no_undo' } },
    unlocksPig: 2
  },
  {
    id: 3,
    name: { en: 'Merge Mania', fr: 'Fusion Mania' },
    goal: { type: 'merge_count', value: 10, description: { en: 'Merge 10 times', fr: 'Fusionne 10 fois' } },
    modifiers: [],
    starCriteria: { two: { type: 'max_moves', value: 20 }, three: { type: 'min_score', value: 500 } },
    unlocksPig: 3
  },
  {
    id: 4,
    name: { en: 'Hamlet Time', fr: "L'Heure de Goret" },
    goal: { type: 'reach_tier', value: 4, description: { en: 'Reach Hamlet', fr: 'Atteins Goret' } },
    modifiers: [],
    starCriteria: { two: { type: 'max_moves', value: 15 }, three: { type: 'no_undo' } },
    unlocksPig: 4
  },
  {
    id: 5,
    name: { en: 'Score Chase', fr: 'Chasse au Score' },
    goal: { type: 'reach_score', value: 1000, description: { en: 'Score 1,000 points', fr: 'Marque 1 000 points' } },
    modifiers: [],
    starCriteria: { two: { type: 'max_moves', value: 25 }, three: { type: 'min_score', value: 1500 } },
    unlocksPig: null
  },
  {
    id: 6,
    name: { en: 'Hog Wild', fr: 'Cochon Sauvage' },
    goal: { type: 'reach_tier', value: 5, description: { en: 'Reach Hog', fr: 'Atteins Gros Cochon' } },
    modifiers: [],
    starCriteria: { two: { type: 'max_moves', value: 20 }, three: { type: 'no_undo' } },
    unlocksPig: 5
  },
  {
    id: 7,
    name: { en: 'Clean Sweep', fr: 'Grand Ménage' },
    goal: { type: 'clear_tier', value: 1, description: { en: 'Clear all Pips', fr: 'Élimine tous les Pips' } },
    modifiers: [],
    starCriteria: { two: { type: 'max_moves', value: 25 }, three: { type: 'min_score', value: 800 } },
    unlocksPig: null
  },
  {
    id: 8,
    name: { en: 'Double Trouble', fr: 'Double Problème' },
    goal: { type: 'reach_tier', value: 5, description: { en: 'Reach Hog twice', fr: 'Atteins Gros Cochon 2 fois' } },
    modifiers: [],
    starCriteria: { two: { type: 'max_moves', value: 35 }, three: { type: 'no_undo' } },
    unlocksPig: null
  },
  {
    id: 9,
    name: { en: 'Speed Farmer', fr: 'Fermier Rapide' },
    goal: { type: 'reach_score', value: 2000, description: { en: 'Score 2,000 points', fr: 'Marque 2 000 points' } },
    modifiers: [],
    starCriteria: { two: { type: 'max_moves', value: 30 }, three: { type: 'min_score', value: 3000 } },
    unlocksPig: null
  },
  {
    id: 10,
    name: { en: 'Farm Champion', fr: 'Champion de la Ferme' },
    goal: { type: 'reach_tier', value: 6, description: { en: 'Reach Sir Oinks', fr: 'Atteins Sire Gruik' } },
    modifiers: [],
    starCriteria: { two: { type: 'max_moves', value: 30 }, three: { type: 'no_undo' } },
    unlocksPig: 6
  }
];
```

### World 2: The Manor (V2)

```javascript
const WORLD_2_LEVELS = [
  { id: 11, name: { en: 'Tight Squeeze', fr: 'Espace Réduit' }, goal: { type: 'reach_tier', value: 5 }, modifiers: [{ type: 'small_board', size: 3 }], starCriteria: { two: { type: 'max_moves', value: 15 }, three: { type: 'no_undo' } }, unlocksPig: null },
  { id: 12, name: { en: 'Blocked Path', fr: 'Chemin Bloqué' }, goal: { type: 'reach_tier', value: 5 }, modifiers: [{ type: 'blocked_cells', positions: [[1,1]] }], starCriteria: { two: { type: 'max_moves', value: 20 }, three: { type: 'no_undo' } }, unlocksPig: null },
  { id: 13, name: { en: 'Corner Trap', fr: 'Piège des Coins' }, goal: { type: 'reach_tier', value: 6 }, modifiers: [{ type: 'blocked_cells', positions: [[0,0],[3,3]] }], starCriteria: { two: { type: 'max_moves', value: 25 }, three: { type: 'no_undo' } }, unlocksPig: null },
  { id: 14, name: { en: 'Wiggleton Awaits', fr: 'Marquis Attend' }, goal: { type: 'reach_tier', value: 7 }, modifiers: [], starCriteria: { two: { type: 'max_moves', value: 35 }, three: { type: 'no_undo' } }, unlocksPig: 7 },
  { id: 15, name: { en: 'The Maze', fr: 'Le Labyrinthe' }, goal: { type: 'reach_tier', value: 6 }, modifiers: [{ type: 'blocked_cells', positions: [[0,1],[1,0],[2,3],[3,2]] }], starCriteria: { two: { type: 'max_moves', value: 30 }, three: { type: 'no_undo' } }, unlocksPig: null },
  { id: 16, name: { en: 'Quick Oinks', fr: 'Gruiks Rapides' }, goal: { type: 'reach_tier', value: 6 }, modifiers: [{ type: 'time_limit', seconds: 60 }], starCriteria: { two: { type: 'max_time', value: 45 }, three: { type: 'max_time', value: 30 } }, unlocksPig: null },
  { id: 17, name: { en: 'Merge Master', fr: 'Maître Fusion' }, goal: { type: 'merge_count', value: 30 }, modifiers: [{ type: 'time_limit', seconds: 90 }], starCriteria: { two: { type: 'max_time', value: 60 }, three: { type: 'merge_count', value: 40 } }, unlocksPig: null },
  { id: 18, name: { en: "Baron's Bath", fr: 'Bain du Baron' }, goal: { type: 'reach_tier', value: 8 }, modifiers: [], starCriteria: { two: { type: 'max_moves', value: 40 }, three: { type: 'no_undo' } }, unlocksPig: 8 },
  { id: 19, name: { en: 'Small & Fast', fr: 'Petit et Rapide' }, goal: { type: 'reach_score', value: 3000 }, modifiers: [{ type: 'small_board', size: 3 }, { type: 'time_limit', seconds: 60 }], starCriteria: { two: { type: 'max_time', value: 45 }, three: { type: 'min_score', value: 4000 } }, unlocksPig: null },
  { id: 20, name: { en: 'Manor Master', fr: 'Maître du Manoir' }, goal: { type: 'reach_tier', value: 8 }, modifiers: [{ type: 'blocked_cells', positions: [[1,1],[2,2]] }, { type: 'time_limit', seconds: 120 }], starCriteria: { two: { type: 'max_time', value: 90 }, three: { type: 'no_undo' } }, unlocksPig: null }
];
```

### World 3: The City (V2)

```javascript
const WORLD_3_LEVELS = [
  { id: 21, name: { en: 'Rush Hour', fr: 'Heure de Pointe' }, goal: { type: 'reach_score', value: 5000 }, modifiers: [{ type: 'time_limit', seconds: 60 }], starCriteria: { two: { type: 'max_time', value: 45 }, three: { type: 'min_score', value: 6000 } }, unlocksPig: null },
  { id: 22, name: { en: 'Detective Work', fr: 'Travail de Détective' }, goal: { type: 'reach_tier', value: 9 }, modifiers: [], starCriteria: { two: { type: 'max_moves', value: 45 }, three: { type: 'no_undo' } }, unlocksPig: 9 },
  { id: 23, name: { en: 'Move It', fr: 'Bouge-toi' }, goal: { type: 'reach_tier', value: 8 }, modifiers: [{ type: 'move_limit', moves: 25 }], starCriteria: { two: { type: 'max_moves', value: 20 }, three: { type: 'max_moves', value: 15 } }, unlocksPig: null },
  { id: 24, name: { en: 'Spawn Storm', fr: 'Tempête de Spawn' }, goal: { type: 'reach_score', value: 4000 }, modifiers: [{ type: 'fast_spawn', extraTiles: 1 }], starCriteria: { two: { type: 'max_moves', value: 30 }, three: { type: 'min_score', value: 5000 } }, unlocksPig: null },
  { id: 25, name: { en: "Sir Loin's Challenge", fr: 'Défi de Sire Longe' }, goal: { type: 'reach_tier', value: 10 }, modifiers: [], starCriteria: { two: { type: 'max_moves', value: 50 }, three: { type: 'no_undo' } }, unlocksPig: 10 },
  { id: 26, name: { en: 'Fog of War', fr: 'Brouillard de Guerre' }, goal: { type: 'reach_tier', value: 8 }, modifiers: [{ type: 'fog', initialRevealed: 4 }], starCriteria: { two: { type: 'max_moves', value: 35 }, three: { type: 'no_undo' } }, unlocksPig: null },
  { id: 27, name: { en: 'Decay Race', fr: 'Course Décadence' }, goal: { type: 'reach_tier', value: 9 }, modifiers: [{ type: 'decay', interval: 8 }], starCriteria: { two: { type: 'max_moves', value: 40 }, three: { type: 'no_undo' } }, unlocksPig: null },
  { id: 28, name: { en: "Lord's Domain", fr: 'Domaine du Duc' }, goal: { type: 'reach_tier', value: 11 }, modifiers: [], starCriteria: { two: { type: 'max_moves', value: 55 }, three: { type: 'no_undo' } }, unlocksPig: 11 },
  { id: 29, name: { en: 'Chaos City', fr: 'Ville du Chaos' }, goal: { type: 'reach_score', value: 8000 }, modifiers: [{ type: 'fast_spawn', extraTiles: 1 }, { type: 'time_limit', seconds: 90 }], starCriteria: { two: { type: 'max_time', value: 60 }, three: { type: 'min_score', value: 10000 } }, unlocksPig: null },
  { id: 30, name: { en: 'To The Stars', fr: 'Vers les Étoiles' }, goal: { type: 'reach_tier', value: 12 }, modifiers: [{ type: 'blocked_cells', positions: [[0,0]] }, { type: 'time_limit', seconds: 180 }], starCriteria: { two: { type: 'max_time', value: 120 }, three: { type: 'no_undo' } }, unlocksPig: 12 }
];
```

### World 4: The Cosmos (V2)

```javascript
const WORLD_4_LEVELS = [
  { id: 31, name: { en: 'Viking Voyage', fr: 'Voyage Viking' }, goal: { type: 'reach_tier', value: 13 }, modifiers: [{ type: 'time_limit', seconds: 180 }], starCriteria: { two: { type: 'max_time', value: 120 }, three: { type: 'no_undo' } }, unlocksPig: 13 },
  { id: 32, name: { en: "Wizard's Trial", fr: 'Épreuve du Sorcier' }, goal: { type: 'reach_tier', value: 14 }, modifiers: [{ type: 'move_limit', moves: 60 }], starCriteria: { two: { type: 'max_moves', value: 50 }, three: { type: 'max_moves', value: 40 } }, unlocksPig: 14 },
  { id: 33, name: { en: 'Tiny Cosmos', fr: 'Petit Cosmos' }, goal: { type: 'reach_tier', value: 12 }, modifiers: [{ type: 'small_board', size: 3 }, { type: 'time_limit', seconds: 120 }], starCriteria: { two: { type: 'max_time', value: 90 }, three: { type: 'no_undo' } }, unlocksPig: null },
  { id: 34, name: { en: 'Blocked Stars', fr: 'Étoiles Bloquées' }, goal: { type: 'reach_tier', value: 13 }, modifiers: [{ type: 'blocked_cells', positions: [[0,0],[0,3],[3,0],[3,3]] }], starCriteria: { two: { type: 'max_moves', value: 60 }, three: { type: 'no_undo' } }, unlocksPig: null },
  { id: 35, name: { en: 'Royal Decree', fr: 'Décret Royal' }, goal: { type: 'reach_tier', value: 15 }, modifiers: [{ type: 'time_limit', seconds: 240 }], starCriteria: { two: { type: 'max_time', value: 180 }, three: { type: 'no_undo' } }, unlocksPig: 15 },
  { id: 36, name: { en: 'Cosmic Fog', fr: 'Brouillard Cosmique' }, goal: { type: 'reach_tier', value: 14 }, modifiers: [{ type: 'fog', initialRevealed: 4 }, { type: 'decay', interval: 10 }], starCriteria: { two: { type: 'max_moves', value: 70 }, three: { type: 'no_undo' } }, unlocksPig: null },
  { id: 37, name: { en: "Sow's Domain", fr: 'Domaine de la Truie' }, goal: { type: 'reach_tier', value: 16 }, modifiers: [{ type: 'move_limit', moves: 80 }], starCriteria: { two: { type: 'max_moves', value: 70 }, three: { type: 'max_moves', value: 60 } }, unlocksPig: 16 },
  { id: 38, name: { en: 'Speed of Light', fr: 'Vitesse Lumière' }, goal: { type: 'reach_score', value: 20000 }, modifiers: [{ type: 'time_limit', seconds: 120 }, { type: 'fast_spawn', extraTiles: 1 }], starCriteria: { two: { type: 'max_time', value: 90 }, three: { type: 'min_score', value: 25000 } }, unlocksPig: null },
  { id: 39, name: { en: 'Final Approach', fr: 'Approche Finale' }, goal: { type: 'reach_tier', value: 16 }, modifiers: [{ type: 'small_board', size: 3 }, { type: 'move_limit', moves: 50 }], starCriteria: { two: { type: 'max_moves', value: 40 }, three: { type: 'max_moves', value: 30 } }, unlocksPig: null },
  { id: 40, name: { en: 'THE LION PIG', fr: 'LE GROIN LION' }, goal: { type: 'reach_tier', value: 17 }, modifiers: [], starCriteria: { two: { type: 'max_moves', value: 100 }, three: { type: 'no_undo' } }, unlocksPig: 17 }
];
```

---

## Pig Unlock Quotes

Display these when a pig is unlocked for the first time:

```javascript
const PIG_UNLOCK_QUOTES = {
  1: { en: "Oink! I'm Pip! Let's go on an adventure!", fr: "Gruik ! Je suis Pépin ! Partons à l'aventure !" },
  2: { en: "I grew! Did you see? I GREW!", fr: "J'ai grandi ! T'as vu ? J'AI GRANDI !" },
  3: { en: "These legs were made for trotting.", fr: "Ces pattes sont faites pour trotter." },
  4: { en: "To merge, or not to merge? Definitely merge.", fr: "Fusionner ou ne pas fusionner ? Fusionner." },
  5: { en: "Finally, a proper-sized pig around here.", fr: "Enfin un cochon de taille correcte." },
  6: { en: "Charmed, I'm sure. *adjusts bowtie*", fr: "Enchanté, assurément. *ajuste son nœud papillon*" },
  7: { en: "One does not simply walk into a merge. One STRUTS.", fr: "On ne marche pas vers une fusion. On PARADE." },
  8: { en: "The water was getting cold. About time!", fr: "L'eau commençait à refroidir. Il était temps !" },
  9: { en: "Elementary, my dear swine.", fr: "Élémentaire, mon cher porcin." },
  10: { en: "For honor! For glory! For BACON!", fr: "Pour l'honneur ! Pour la gloire ! Pour le BACON !" },
  11: { en: "You may address me as 'Your Lard-ship.'", fr: "Vous pouvez m'appeler 'Votre Lard-eur'." },
  12: { en: "One small step for pig, one giant leap for swine-kind.", fr: "Un petit pas pour le cochon, un grand pas pour la porcité." },
  13: { en: "SKAL! Let us conquer new tiles!", fr: "SKÅL ! Conquérons de nouvelles tuiles !" },
  14: { en: "A pig is never late. He arrives precisely when merged.", fr: "Un cochon n'est jamais en retard. Il arrive précisément quand il fusionne." },
  15: { en: "The crown is heavy. But I make it look good.", fr: "La couronne est lourde. Mais elle me va bien." },
  16: { en: "I have seen the universe. It is... pink.", fr: "J'ai vu l'univers. Il est... rose." },
  17: { en: "I AM THE LION PIG. FEAR MY MAGNIFICENT MANE.", fr: "JE SUIS LE GROIN LION. CRAIGNEZ MA MAGNIFIQUE CRINIÈRE." }
};
```

---

## Failure Messaging

When a level fails, show encouraging copy:

```javascript
const FAILURE_MESSAGES = {
  // Main message
  title: { en: "SO CLOSE!", fr: "SI PRÈS !" },
  
  // Progress message (fill in dynamically)
  progress: {
    reach_tier: { en: "You reached {achieved} — just {remaining} merge(s) from {target}!", fr: "Tu as atteint {achieved} — plus que {remaining} fusion(s) jusqu'à {target} !" },
    reach_score: { en: "You scored {achieved} — only {remaining} points away!", fr: "Tu as marqué {achieved} — plus que {remaining} points !" },
    merge_count: { en: "You merged {achieved} times — {remaining} more to go!", fr: "Tu as fusionné {achieved} fois — encore {remaining} !" },
    clear_tier: { en: "Almost cleared! Just {remaining} Pip(s) left!", fr: "Presque ! Plus que {remaining} Pépin(s) !" }
  },

  // Contextual tips
  tips: {
    default: { en: "Keep your highest pig in a corner. Build toward it.", fr: "Garde ton plus gros cochon dans un coin. Construis vers lui." },
    time_out: { en: "Speed comes from patterns. Try the corner strategy!", fr: "La vitesse vient des patterns. Essaie la stratégie du coin !" },
    no_moves: { en: "Swipe in one direction to consolidate tiles.", fr: "Glisse dans une direction pour consolider les tuiles." },
    close: { en: "You were SO close! One more try?", fr: "Tu étais SI PRÈS ! On réessaie ?" },
    undo_unused: { en: "Don't forget — you can undo moves!", fr: "N'oublie pas — tu peux annuler tes coups !" }
  },

  // Buttons
  retry: { en: "TRY AGAIN ✨", fr: "RÉESSAYER ✨" },
  quit: { en: "Take a Break", fr: "Faire une Pause" }
};
```

---

## Progress Storage

```javascript
// localStorage key: 'pop_campaign'
// Load in Game.loadGame(), save in Game.saveGame()
{
  completedLevels: {
    1: { stars: 3, bestMoves: 4, bestScore: 120 },
    2: { stars: 2, bestMoves: 12, bestScore: 340 }
  },
  currentLevel: 1,
  totalStars: 5
}

// Existing key 'powersOfPig' still stores: highScore, unlockedPigs, soundEnabled
// Campaign unlocks pigs via the existing this.unlockPig(value) method
```

---

## UI Flow

```
HOME SCREEN (existing)
  ├→ CAMPAIGN button (new) → WORLD SELECT (new screen)
  │    └→ LEVEL SELECT (new screen, one per world)
  │         └→ LEVEL (tap) → GAMEPLAY (modified game screen)
  │              ├→ WIN → LEVEL COMPLETE modal (new overlay)
  │              └→ LOSE → SO CLOSE! modal (new overlay)
  ├→ ENDLESS MODE button (replaces current Play, locked until World 1 complete)
  └→ COLLECTION (existing)
```

---

## Implementation Approach

### 1. Add Campaign Data (new file: `src/levels.js`)

Create levels.js with CAMPAIGN_LEVELS array. Load via `<script src="levels.js"></script>` before game.js.

### 2. Extend Game Class

Add to Game class:
- `this.campaignMode = false` — true when playing campaign
- `this.currentLevel = null` — level object from CAMPAIGN_LEVELS
- `this.levelMoves = 0` — move counter for star criteria
- `this.levelStartTime = null` — for time-based criteria
- `this.campaignProgress = {}` — loaded from localStorage

New methods:
- `startCampaignLevel(levelId)` — sets up level with goal, starts game
- `checkLevelGoal()` — called after each move, checks if goal met
- `completeCampaignLevel(stars)` — shows completion overlay, saves progress
- `failCampaignLevel()` — shows "So Close!" overlay

### 3. Modify Existing Methods

**`startGame()`** — if `this.campaignMode`, call `startCampaignLevel()` instead of random spawn

**`move()`** — after move, call `checkLevelGoal()` if in campaign mode

**`checkGameOver()`** — if campaign mode and goal not met, trigger `failCampaignLevel()`

**`showGameOverScreen()`** — skip if campaign mode (use level-specific fail screen)

### 4. Add New Screens to index.html

```html
<!-- WORLD SELECT SCREEN -->
<div class="screen world-select-screen" id="world-select-screen">
  <!-- 4 world buttons, locked state based on stars -->
</div>

<!-- LEVEL SELECT SCREEN -->
<div class="screen level-select-screen" id="level-select-screen">
  <!-- 10 level buttons per world, star display -->
</div>
```

### 5. Add New Overlays to index.html

```html
<!-- LEVEL COMPLETE OVERLAY -->
<div class="overlay" id="level-complete-overlay">
  <div class="modal">
    <!-- Stars earned, pig unlock if applicable, next/retry buttons -->
  </div>
</div>

<!-- LEVEL FAILED OVERLAY (So Close!) -->
<div class="overlay" id="level-failed-overlay">
  <div class="modal">
    <!-- "SO CLOSE!" message, progress, tip, retry/quit buttons -->
  </div>
</div>
```

### 6. Add Strings to strings.js

Add to both `STRINGS.en` and `STRINGS.fr`:
- `campaign.worldName1` through `campaign.worldName4`
- `campaign.levelComplete`, `campaign.soClose`
- `campaign.stars`, `campaign.retry`, `campaign.next`
- All 40 level names
- All failure tips

### 7. Add Styles to styles.css

Follow existing patterns:
- `.world-select-screen`, `.level-select-screen` — use `.screen` base
- `.world-button`, `.level-button` — use `.btn` patterns
- `.level-stars` — star display
- `.level-locked` — locked state styling

---

## V2+ Features (Build but don't ship yet)

### Modifiers (World 2+)

| Type | Params | Effect |
|------|--------|--------|
| `small_board` | `size: 3` | 3×3 grid |
| `blocked_cells` | `positions: [[r,c]]` | Cells that can't hold tiles |
| `time_limit` | `seconds: N` | Fail if timer expires |
| `move_limit` | `moves: N` | Fail if moves exceeded |
| `fast_spawn` | `extraTiles: N` | Spawn N+1 tiles per move |
| `fog` | `initialRevealed: N` | Hide tiles until adjacent merge |
| `decay` | `interval: N` | Remove lowest tile every N moves |

### Host Dialogues (V2)

World hosts introduce levels with personality. Add later based on what feels missing.

### Journey Map (V2)

Visual path instead of list. Add if players seem disengaged with progression.

### Positive Modifiers (V3)

`combo_bonus`, `wild_pig`, `slow_motion`, `pig_rain` — toys, not just restrictions.

---

## Success Metrics

**V1 targets (after real users play):**

| Metric | Target |
|--------|--------|
| Complete Level 1 | >80% |
| Complete Level 5 | >50% |
| Complete Level 10 | >30% |
| Day 1 → Day 3 return | >20% |

If Day 3 retention is <10%, the core loop needs work before adding more content.

---

## Build Instructions

### Step 1: Create src/levels.js
- Export `CAMPAIGN_LEVELS` array with all 40 levels
- Export `PIG_UNLOCK_QUOTES` object
- Export `FAILURE_MESSAGES` object
- Add `<script src="levels.js"></script>` to index.html before game.js

### Step 2: Add strings to src/strings.js
- Add `campaign` section to both `STRINGS.en` and `STRINGS.fr`
- Include all level names, UI text, failure messages

### Step 3: Add screens/overlays to src/index.html
- Add world-select-screen
- Add level-select-screen  
- Add level-complete-overlay
- Add level-failed-overlay
- Modify home-screen: change Play to Campaign, add Endless (locked)

### Step 4: Add styles to src/styles.css
- World select grid
- Level select grid with star indicators
- Level complete/failed modal styling
- Locked state styling

### Step 5: Extend Game class in src/game.js
- Add campaign state properties
- Add `startCampaignLevel()`, `checkLevelGoal()`, `completeCampaignLevel()`, `failCampaignLevel()`
- Modify `startGame()`, `move()`, `checkGameOver()`, `loadGame()`, `saveGame()`
- Add event listeners for new buttons

### Step 6: Test locally
```bash
npm run dev
```
- Play through all 10 World 1 levels
- Verify star calculation
- Verify pig unlocks show quotes
- Verify "So Close!" appears on failure
- Verify progress saves to localStorage

### Step 7: Ship
- Commit and push
- Vercel auto-deploys
- Watch real users play

Go.
