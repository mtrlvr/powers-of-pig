import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
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
} from '../src/daily.js';

/**
 * Daily Challenge System Tests
 *
 * Tests for deterministic level generation and streak management.
 * Per engineering review: uses local timezone, handles JSON parse errors gracefully.
 */

describe('Daily Challenge - Deterministic Randomness', () => {
  describe('hashString', () => {
    it('returns consistent hash for same input', () => {
      const hash1 = hashString('2026-03-12');
      const hash2 = hashString('2026-03-12');
      expect(hash1).toBe(hash2);
    });

    it('returns different hashes for different inputs', () => {
      const hash1 = hashString('2026-03-12');
      const hash2 = hashString('2026-03-13');
      expect(hash1).not.toBe(hash2);
    });

    it('returns positive integers', () => {
      const hash = hashString('test');
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(hash)).toBe(true);
    });
  });

  describe('getDailySeed', () => {
    it('returns date in YYYY-MM-DD format', () => {
      const seed = getDailySeed();
      expect(seed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns same seed on same day', () => {
      const seed1 = getDailySeed();
      const seed2 = getDailySeed();
      expect(seed1).toBe(seed2);
    });
  });

  describe('seededRandom', () => {
    it('returns value between 0 and 1', () => {
      const value = seededRandom(12345);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('returns consistent value for same seed', () => {
      const value1 = seededRandom(42);
      const value2 = seededRandom(42);
      expect(value1).toBe(value2);
    });

    it('returns different values for different seeds', () => {
      const value1 = seededRandom(42);
      const value2 = seededRandom(43);
      expect(value1).not.toBe(value2);
    });
  });
});

describe('Daily Challenge - Level Generation', () => {
  describe('generateDailyLevel', () => {
    it('returns a level object with required properties', () => {
      const level = generateDailyLevel();

      expect(level).toHaveProperty('id', 'daily');
      expect(level).toHaveProperty('name');
      expect(level.name).toHaveProperty('en');
      expect(level.name).toHaveProperty('fr');
      expect(level).toHaveProperty('goal');
      expect(level.goal.type).toBe('reach_score');
      expect(level.goal.value).toBe(Infinity);
      expect(level).toHaveProperty('modifiers');
      expect(Array.isArray(level.modifiers)).toBe(true);
      expect(level).toHaveProperty('seed');
    });

    it('returns same level for same day (deterministic)', () => {
      const level1 = generateDailyLevel();
      const level2 = generateDailyLevel();

      expect(level1.seed).toBe(level2.seed);
      expect(level1.modifiers.length).toBe(level2.modifiers.length);
      if (level1.modifiers.length > 0) {
        expect(level1.modifiers[0].type).toBe(level2.modifiers[0].type);
      }
    });

    it('selects from valid modifier types', () => {
      const level = generateDailyLevel();
      const validModifiers = [
        null,
        'time_limit',
        'move_limit',
        'blocked_cells',
        'single_cell_movement'
      ];

      if (level.modifiers.length > 0) {
        expect(validModifiers).toContain(level.modifiers[0].type);
      }
    });

    it('time_limit modifier has 180 seconds', () => {
      const level = generateDailyLevel();
      const timeLimitMod = level.modifiers.find(m => m.type === 'time_limit');

      if (timeLimitMod) {
        expect(timeLimitMod.seconds).toBe(180);
      }
    });

    it('move_limit modifier has 100 moves', () => {
      const level = generateDailyLevel();
      const moveLimitMod = level.modifiers.find(m => m.type === 'move_limit');

      if (moveLimitMod) {
        expect(moveLimitMod.moves).toBe(100);
      }
    });
  });
});

describe('Daily Challenge - Streak Management', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getDailyProgress', () => {
    it('returns default progress when no data exists', () => {
      const progress = getDailyProgress();

      expect(progress).toEqual({
        lastPlayed: null,
        lastCompleted: null,
        streak: 0,
        bestScore: 0
      });
    });

    it('returns stored progress when data exists', () => {
      const stored = {
        lastPlayed: '2026-03-11',
        lastCompleted: '2026-03-11',
        streak: 5,
        bestScore: 1000
      };
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(stored));

      const progress = getDailyProgress();
      expect(progress).toEqual(stored);
    });

    it('handles corrupted JSON gracefully', () => {
      localStorage.setItem(DAILY_STORAGE_KEY, 'not valid json');

      // Should not throw, returns default
      const progress = getDailyProgress();
      expect(progress).toEqual({
        lastPlayed: null,
        lastCompleted: null,
        streak: 0,
        bestScore: 0
      });
    });
  });

  describe('saveDailyProgress', () => {
    it('saves progress to localStorage', () => {
      const progress = {
        lastPlayed: '2026-03-12',
        lastCompleted: '2026-03-12',
        streak: 3,
        bestScore: 500
      };

      saveDailyProgress(progress);

      const stored = JSON.parse(localStorage.getItem(DAILY_STORAGE_KEY));
      expect(stored).toEqual(progress);
    });
  });

  describe('recordDailyComplete', () => {
    it('starts new streak when no previous completion', () => {
      const progress = recordDailyComplete(100);

      expect(progress.streak).toBe(1);
      expect(progress.bestScore).toBe(100);
      expect(progress.lastCompleted).toBe(getDailySeed());
    });

    it('continues streak when completed yesterday', () => {
      // Set up yesterday's completion
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({
        lastPlayed: yesterdayStr,
        lastCompleted: yesterdayStr,
        streak: 3,
        bestScore: 200
      }));

      const progress = recordDailyComplete(150);

      expect(progress.streak).toBe(4); // 3 + 1
      expect(progress.lastCompleted).toBe(getDailySeed());
    });

    it('resets streak when gap in completion', () => {
      // Set up completion from 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toLocaleDateString('en-CA');

      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({
        lastPlayed: threeDaysAgoStr,
        lastCompleted: threeDaysAgoStr,
        streak: 5,
        bestScore: 500
      }));

      const progress = recordDailyComplete(100);

      expect(progress.streak).toBe(1); // Reset to 1
    });

    it('updates best score when new score is higher', () => {
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({
        lastPlayed: null,
        lastCompleted: null,
        streak: 0,
        bestScore: 100
      }));

      const progress = recordDailyComplete(200);
      expect(progress.bestScore).toBe(200);
    });

    it('keeps best score when new score is lower', () => {
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({
        lastPlayed: null,
        lastCompleted: null,
        streak: 0,
        bestScore: 500
      }));

      const progress = recordDailyComplete(200);
      expect(progress.bestScore).toBe(500);
    });

    it('does not change streak when completing same day twice', () => {
      // Complete today first
      recordDailyComplete(100);

      // Complete again
      const progress = recordDailyComplete(200);

      expect(progress.streak).toBe(1); // Still 1, not 2
    });
  });

  describe('hasCompletedToday', () => {
    it('returns false when never completed', () => {
      expect(hasCompletedToday()).toBe(false);
    });

    it('returns true when completed today', () => {
      recordDailyComplete(100);
      expect(hasCompletedToday()).toBe(true);
    });

    it('returns false when completed yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({
        lastPlayed: yesterdayStr,
        lastCompleted: yesterdayStr,
        streak: 1,
        bestScore: 100
      }));

      expect(hasCompletedToday()).toBe(false);
    });
  });

  describe('getCurrentStreak', () => {
    it('returns 0 when never completed', () => {
      expect(getCurrentStreak()).toBe(0);
    });

    it('returns streak when completed today', () => {
      recordDailyComplete(100);
      recordDailyComplete(200); // Same day
      expect(getCurrentStreak()).toBe(1);
    });

    it('returns streak when completed yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({
        lastPlayed: yesterdayStr,
        lastCompleted: yesterdayStr,
        streak: 5,
        bestScore: 100
      }));

      expect(getCurrentStreak()).toBe(5);
    });

    it('returns 0 when streak is broken (2+ days ago)', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoStr = twoDaysAgo.toLocaleDateString('en-CA');

      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({
        lastPlayed: twoDaysAgoStr,
        lastCompleted: twoDaysAgoStr,
        streak: 10,
        bestScore: 1000
      }));

      expect(getCurrentStreak()).toBe(0); // Streak broken
    });
  });
});
