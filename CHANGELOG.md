# Changelog

All notable changes to Powers of Pig.

Format based on [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Added
- Writing style guide (`WRITING_STYLE.md`)
- Documentation maintenance checklist
- Tree of Pig feature roadmap

### Changed
- Archived campaign PRD to `docs/archive/`

## [1.2.0] - 2025-02-23

### Added
- World 2: The Mudlands (8 levels)
- Level modifiers: blocked cells, single-cell movement
- World introduction overlay

## [1.1.0] - 2025-02-22

### Added
- Campaign Mode with World 1: The Farm (8 levels)
- Level goal types: reach_tier, reach_score, merge_count, clear_tier
- Level modifiers: time_limit, move_limit, small_board
- Level complete and failed overlays
- Emoji level rating
- World and level select screens

### Changed
- Classic Mode now unlocks after completing World 1

## [1.0.0] - 2025-02-21

### Added
- Tile sliding animations (120ms CSS transforms)
- Full-screen game over with hero pig display
- Share card with pig image (html2canvas)
- Web Share API with clipboard fallback
- Mid-game share button
- View final board feature
- Tutorial system with guided first merge
- First merge celebration (confetti)
- "Stuck?" help system with directional hints

## [0.9.0] - 2025-02-20

### Added
- PostHog analytics integration
- Security hardening: input limits, rate limiting, honeypot

### Removed
- Password gate
- Lives system

## [0.8.0] - 2025-02-19

### Added
- English/French localisation
- Language toggle on all screens
- Browser locale auto-detection

## [0.7.0] - 2025-02-18

### Added
- Two-question feedback modal
- Supabase feedback storage

### Changed
- Refactored sound system to Web Audio API (iOS compatibility)

## [0.6.0] - 2025-02-17

### Added
- 17 unique oink sounds per tier
- Haptic feedback patterns
- Collection screen (badge gallery)

## [0.5.0] - 2025-02-16

### Added
- Core game engine (4x4 grid, merge logic)
- 17 pig tiers with names and images
- Score calculation
- Win/lose detection
- localStorage persistence
