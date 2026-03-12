// Powers of Pig - Daily Challenge System
// Procedural level generation from date seed + streak management

// ========== DETERMINISTIC RANDOMNESS ==========

// Deterministic hash from string
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// Get today's seed (local timezone, not UTC)
function getDailySeed() {
    return new Date().toLocaleDateString('en-CA'); // "2026-03-12" in local time
}

// Seeded random number generator
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// ========== DAILY LEVEL GENERATION ==========

// Generate daily level config
function generateDailyLevel() {
    const dateStr = getDailySeed();
    let seed = hashString(dateStr);

    // Pick modifier (or none)
    const modifierTypes = [
        null,
        { type: 'time_limit', seconds: 180 },
        { type: 'move_limit', moves: 100 },
        { type: 'blocked_cells', positions: [[0, 0], [3, 3]] },
        { type: 'single_cell_movement' }
    ];
    const modifierIndex = Math.floor(seededRandom(seed) * modifierTypes.length);
    const modifier = modifierTypes[modifierIndex];

    return {
        id: 'daily',
        name: { en: 'Daily Challenge', fr: 'Défi du Jour' },
        goal: { type: 'reach_score', value: Infinity }, // Play for high score
        modifiers: modifier ? [modifier] : [],
        seed: dateStr
    };
}

// ========== STREAK MANAGEMENT ==========

const DAILY_STORAGE_KEY = 'pop_daily';

function getDailyProgress() {
    const defaultProgress = {
        lastPlayed: null,
        lastCompleted: null,
        streak: 0,
        bestScore: 0
    };
    const stored = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!stored) return defaultProgress;
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.warn('Daily progress corrupted, resetting:', e);
        return defaultProgress;
    }
}

function saveDailyProgress(progress) {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(progress));
}

function recordDailyComplete(score) {
    const today = getDailySeed();
    const progress = getDailyProgress();

    // Update best score
    if (score > progress.bestScore) {
        progress.bestScore = score;
    }

    // Update streak (local timezone)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');

    if (progress.lastCompleted === yesterdayStr) {
        progress.streak += 1; // Continue streak
    } else if (progress.lastCompleted !== today) {
        progress.streak = 1; // Start new streak
    }
    // If already completed today, don't change streak

    progress.lastCompleted = today;
    saveDailyProgress(progress);

    return progress;
}

function hasCompletedToday() {
    const progress = getDailyProgress();
    return progress.lastCompleted === getDailySeed();
}

function getCurrentStreak() {
    const progress = getDailyProgress();
    const today = getDailySeed();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');

    // Streak is valid if last completed was today or yesterday
    if (progress.lastCompleted === today || progress.lastCompleted === yesterdayStr) {
        return progress.streak;
    }
    return 0; // Streak broken
}

// ========== EXPORTS ==========

// Export for Node/test compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        hashString,
        getDailySeed,
        seededRandom,
        generateDailyLevel,
        getDailyProgress,
        saveDailyProgress,
        recordDailyComplete,
        hasCompletedToday,
        getCurrentStreak,
        DAILY_STORAGE_KEY
    };
}
