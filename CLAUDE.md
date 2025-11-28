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
  index.html   # Main HTML with game container
  styles.css   # All styling (responsive, tile colors, animations)
  game.js      # Core game engine (Game class)
```

## Architecture

- **Single-page app** with vanilla HTML/CSS/JavaScript (no frameworks)
- **Game class** in game.js handles all game state and logic
- **Grid-based rendering** - tiles positioned absolutely within container
- **Touch + keyboard input** - swipe detection and arrow keys

## Build Phases

The game is being built incrementally. See the PRD in the initial prompt for full details. Current phases:
1. Core Game Engine (complete)
2. Pig Identity - replace numbers with pig names/colors
3. Screens & Navigation - home, pause, game over, win, collection
4. Lives System - 3 lives, 4-hour regen
5. Persistence - local storage for game state, badges, lives
6. Animations - smooth sliding, merge pop, spawn
7. Sound - 17 unique oink sounds per tier
8. Haptics - vibration patterns synced with sounds
9. Visual Polish - pig images, isometric board
