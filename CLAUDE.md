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
  assets/
    pigs/            # 17 pig images (1.pip.png through 17.thelionpig.png)
```

## Architecture

- **Single-page app** with vanilla HTML/CSS/JavaScript (no frameworks)
- **Game class** in game.js handles all game state, logic, and rendering
- **Grid-based rendering** - CSS Grid for background cells, absolute positioning for animated tiles
- **Touch + keyboard input** - swipe detection (with threshold) and arrow keys
- **Lives system** - 3 lives max, 4-hour regeneration timer, persisted to localStorage
- **Sound system** - Web Audio API with 17 unique oink sounds (different pitches per tier)
- **Haptics** - Vibration API patterns synced with sounds on supported devices
- **Persistence** - localStorage for game state, unlocked badges, lives, high score

## Key Implementation Details

### Tile Positioning
Tiles use `getBoundingClientRect()` to measure actual cell positions at runtime, storing `xOffset`/`yOffset` to ensure perfect alignment with grid cells across different screen sizes.

### PIGS Constant
Each tier defined with: `{ tier, name, color, icon, image }` - image paths point to `assets/pigs/` folder.

### Screens
- Home, Game, Pause (overlay), Game Over, Win, Collection (badge gallery), Out of Lives

## Build Phases (All Complete)

1. **Core Game Engine** - 4x4 grid, tile spawning, merge logic, win/lose detection
2. **Pig Identity** - 17 pig tiers with names, colors, icons replacing numbers
3. **Screens & Navigation** - All game screens with transitions
4. **Lives System** - 3 lives, 4-hour regen timer, purchase placeholders
5. **Persistence** - localStorage for state, badges, lives, high score
6. **Animations** - Smooth sliding, merge pop, spawn effects via CSS
7. **Sound** - 17 unique oink sounds using Web Audio API oscillators
8. **Haptics** - Vibration patterns on move, merge, win, game over
9. **Visual Polish** - Custom pig images, tile alignment fixes, responsive design
