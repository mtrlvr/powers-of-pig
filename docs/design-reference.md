# Powers of Pig — Design Reference

## How to Use This Doc

This isn't a checklist. It's a **reference** for when you see problems in playtesting.

**Workflow:**
1. Ship V1 (basic campaign)
2. Watch real humans play
3. When you see a problem, find the solution here
4. Add that solution
5. Ship again

---

# Impact Priority

What matters most for retention, regardless of build effort:

## 🔴 Critical (Add to V1)

### "So Close!" Failure Messaging

**Problem it solves:** Players rage-quit after failure.

**The fix:**
```
┌─────────────────────────────────────┐
│           SO CLOSE! 💪              │
│                                     │
│  You reached Hog (Tier 5)           │
│  Just one merge from Sir Oinks!    │
│                                     │
│  💡 Keep your highest pig in a      │
│  corner. Build toward it.           │
│                                     │
│  [TRY AGAIN ✨]    [Take a Break]   │
└─────────────────────────────────────┘
```

**Key changes from standard "Game Over":**
- "SO CLOSE!" not "LEVEL FAILED"
- Quantify how close they were
- Give a helpful tip
- Primary button is retry
- "Take a Break" is softer than "Quit"

---

### Pig Unlock Quotes

**Problem it solves:** Unlocking pigs feels empty.

**The fix:** One line of dialogue per pig. Already in PRD. Just display it.

**Implementation:** Modal with pig image + quote + "Added to Collection" button.

Don't over-engineer this. Text on screen is enough for V1.

---

### Contextual Failure Tips

**Problem it solves:** Players fail repeatedly without learning.

**Tips to rotate based on context:**

| When | Show |
|------|------|
| Ran out of moves | "Swipe in one direction to consolidate tiles." |
| Ran out of time | "Speed comes from patterns. Try the corner strategy!" |
| Board filled | "Keep your highest pig in a corner. Build toward it." |
| Very close to goal | "You were SO close! One more try?" |
| Undo was never used | "Don't forget — you can undo moves!" |

---

## 🟡 High Impact (Add when you see the problem)

### Streak Protection

**Problem it solves:** Player stuck on same level, about to quit forever.

**When to show:** After 3 consecutive failures on same level.

**The fix:**
```
┌─────────────────────────────────────┐
│       This one's tricky! 🤔         │
│                                     │
│  Want a little boost?               │
│  Start with a free Tier 3 tile.    │
│                                     │
│  [Yes please!]  [No, I've got this] │
└─────────────────────────────────────┘
```

**Add this if:** You see playtesters fail 3+ times and put the phone down.

---

### Host Pig Dialogues

**Problem it solves:** Campaign feels soulless, just mechanics.

**The fix:** Each world has a host pig who speaks.

| World | Host | Vibe |
|-------|------|------|
| Farm | Pip | Enthusiastic, learning with you |
| Manor | Sir Oinks | Formal, slightly pompous |
| City | Sherlock Hams | Mysterious, cryptic |
| Cosmos | Cosmic Sow | Ethereal, philosophical |

**Sample lines (Pip, World 1):**
```
Level 1:  "Oink! Let's figure this out together!"
Level 5:  "Wow, 1,000 points sounds like a lot. We can do it!"
Level 10: "This is it! Reach Sir Oinks and we unlock the Manor!"
```

**Add this if:** Players complete levels but seem disengaged, just grinding.

---

### Star Celebration

**Problem it solves:** Earning stars feels flat.

**The fix:** Stars animate in one by one with sound.

- Star 1: flies in, soft chime
- Star 2: flies in, higher chime
- Star 3: flies in, triumphant chime + subtle confetti

**Add this if:** Players 3-star a level and show no reaction.

---

## 🟢 Nice to Have (V2+)

### Unlock Ceremony

**Current:** Show pig + quote.

**Enhanced:** 
1. Screen dims
2. Sparkle cloud appears
3. Player taps to reveal
4. Pig bounces out
5. Quote displays
6. "Added to Collection" animation

**Add this if:** Pig unlocks feel like checkboxes, not rewards.

---

### Journey Map

**Current:** List of levels with stars.

**Enhanced:** Visual winding path, pig avatar walks along it.

**Add this if:** Players don't feel a sense of progression/journey.

---

### Cold Open Cinematic

**What:** 15-second intro for first-time players.

**Sequence:**
1. Single Pip on screen, looks around
2. Second Pip bounces in
3. They merge into Sprout (no UI)
4. Text: "What happens when pigs combine?"
5. Text: "Swipe to find out."

**Add this if:** New players seem confused about what the game is.

---

### Host Reactions

**What:** After completing a level, host pig comments on your performance.

| Stars | Pip says |
|-------|----------|
| ⭐ | "We did it! ...barely!" |
| ⭐⭐ | "Nice work, friend!" |
| ⭐⭐⭐ | "AMAZING! You're a natural!" |

**Add this if:** Level complete feels mechanical.

---

### Positive Modifiers

**What:** Modifiers that help, not just restrict.

| Modifier | Effect |
|----------|--------|
| `combo_bonus` | Chain merges = bonus points |
| `wild_pig` | One tile merges with anything |
| `slow_motion` | Pause time for 10 seconds total |
| `pig_rain` | Free mid-tier pig every 5 moves |

**Add this if:** Players say modifiers feel punishing.

---

# Sensory Palette

Reference for when adding polish. Not needed for V1.

## Sounds

| Event | Sound |
|-------|-------|
| Timer tick (last 10s) | Soft tick |
| Timer expired | Descending womp |
| Star earned | Ascending chime |
| Pig unlocked | Triumphant oink |
| Level complete | Fanfare |
| Level failed | Gentle sad sound |

## Haptics

| Event | Feel |
|-------|------|
| Timer warning | Gentle pulse |
| Star earned | Double tap |
| Pig unlocked | tap-tap-BUZZ |
| Failure | Single heavy |

## Visual

| Event | Animation |
|-------|-----------|
| Timer <10s | Bar pulses red |
| Star earned | Star flies in |
| Pig unlocked | Bounce + sparkle |
| Failure | Brief red flash |

---

# Playtesting the Real Build

Forget paper prototypes. Test the actual game.

## Setup

1. Build V1 (World 1, 10 levels, basic stars)
2. Deploy to phone (or use localhost on device)
3. Find 3-5 humans (family, friends)
4. Sit next to them, don't help

## What to Say

> "I'm testing a game. Play as long as you want. Think aloud — tell me what's confusing or frustrating. I won't help, I'm just watching."

## What to Watch

| Watch for | Indicates |
|-----------|-----------|
| "What am I supposed to do?" | Goal unclear |
| "How do I..." | Tutorial gap |
| Sighing, putting phone down | Frustration |
| Immediate retry after fail | Good engagement |
| Quitting after fail | Need "So Close!" messaging |
| Shrug at pig unlock | Need better ceremony |
| "What do stars do?" | Unclear progression |
| Playing past Level 10 | Strong hook |

## Questions After

1. "Which level was most fun?"
2. "Which was most frustrating?"
3. "Would you play tomorrow?"
4. "What would make it better?"

## Red Flags

| Signal | Action |
|--------|--------|
| Can't complete Level 1 | Tutorial broken |
| Quits before Level 5 | Early game too hard or boring |
| No reaction to pig unlocks | Add ceremony/quotes |
| Doesn't understand stars | Explain better in UI |
| Says "it's fine" flatly | Missing delight, add personality |

## What to Fix First

After watching 3 people play, you'll see patterns. Fix the most common problem first. Ship. Watch again. Repeat.

---

# The Only Rule

**Ship → Watch → Fix → Ship**

Everything in this doc is a solution to a problem you might see. Don't add solutions before you see problems.

The fastest path to a great game is iteration on real builds with real players.

Go watch someone play. 🐷
