import { describe, it, expect } from 'vitest';
import {
  WORLDS,
  CAMPAIGN_LEVELS,
  FAILURE_MESSAGES,
  getLevelById,
  getLevelsForWorld,
  getWorldById,
  isWorldUnlocked,
  isLevelUnlocked,
  isEndlessModeUnlocked,
  getTierValue,
  getLevelModifierType,
  getCompletedLevelCount
} from '../src/levels.js';

describe('levels.js smoke test', () => {
  it('getLevelById returns a level object', () => {
    const level = getLevelById(1);
    expect(level).toBeDefined();
    expect(level.id).toBe(1);
    expect(level.world).toBe(1);
  });

  it('WORLDS contains 3 worlds', () => {
    expect(WORLDS).toHaveLength(3);
    expect(WORLDS[0].id).toBe(1);
    expect(WORLDS[1].id).toBe(2);
    expect(WORLDS[2].id).toBe(3);
  });

  it('CAMPAIGN_LEVELS contains 24 levels', () => {
    expect(CAMPAIGN_LEVELS).toHaveLength(24);
  });

  it('getLevelsForWorld returns correct levels', () => {
    const world1Levels = getLevelsForWorld(1);
    expect(world1Levels).toHaveLength(8);
    expect(world1Levels[0].id).toBe(1);
    expect(world1Levels[7].id).toBe(8);

    const world2Levels = getLevelsForWorld(2);
    expect(world2Levels).toHaveLength(8);
    expect(world2Levels[0].id).toBe(9);
    expect(world2Levels[7].id).toBe(16);
  });

  it('getWorldById returns correct world', () => {
    const world1 = getWorldById(1);
    expect(world1.id).toBe(1);
    expect(world1.name.en).toBe('The Farm');

    const world2 = getWorldById(2);
    expect(world2.id).toBe(2);
    expect(world2.name.en).toBe('The Mudlands');
  });

  it('isWorldUnlocked returns true for World 1', () => {
    const emptyProgress = { completedLevels: {} };
    expect(isWorldUnlocked(1, emptyProgress)).toBe(true);
  });

  it('isWorldUnlocked returns false for World 2 without completion', () => {
    const emptyProgress = { completedLevels: {} };
    expect(isWorldUnlocked(2, emptyProgress)).toBe(false);
  });

  it('isWorldUnlocked returns true for World 2 after completing level 8', () => {
    const progressWithWorld1Complete = {
      completedLevels: { 8: { score: 1000, stars: 3 } }
    };
    expect(isWorldUnlocked(2, progressWithWorld1Complete)).toBe(true);
  });

  it('isLevelUnlocked returns true for level 1', () => {
    const emptyProgress = { completedLevels: {} };
    expect(isLevelUnlocked(1, emptyProgress)).toBe(true);
  });

  it('isLevelUnlocked returns false for level 2 without completing level 1', () => {
    const emptyProgress = { completedLevels: {} };
    expect(isLevelUnlocked(2, emptyProgress)).toBe(false);
  });

  it('isLevelUnlocked returns true for level 2 after completing level 1', () => {
    const progressWithLevel1 = {
      completedLevels: { 1: { score: 100, stars: 3 } }
    };
    expect(isLevelUnlocked(2, progressWithLevel1)).toBe(true);
  });

  it('isEndlessModeUnlocked returns false without completing World 1', () => {
    const emptyProgress = { completedLevels: {} };
    expect(isEndlessModeUnlocked(emptyProgress)).toBe(false);
  });

  it('isEndlessModeUnlocked returns true after completing level 8', () => {
    const progressWithWorld1Complete = {
      completedLevels: { 8: { score: 1000, stars: 3 } }
    };
    expect(isEndlessModeUnlocked(progressWithWorld1Complete)).toBe(true);
  });

  it('getTierValue returns correct power of 2', () => {
    expect(getTierValue(1)).toBe(2);
    expect(getTierValue(2)).toBe(4);
    expect(getTierValue(3)).toBe(8);
    expect(getTierValue(5)).toBe(32);
    expect(getTierValue(10)).toBe(1024);
  });

  it('getLevelModifierType returns correct modifier type', () => {
    const level3 = getLevelById(3);
    expect(getLevelModifierType(level3)).toBe('time_limit');

    const level4 = getLevelById(4);
    expect(getLevelModifierType(level4)).toBe('move_limit');

    const level1 = getLevelById(1);
    expect(getLevelModifierType(level1)).toBeNull();
  });

  it('getCompletedLevelCount returns correct count', () => {
    const emptyProgress = { completedLevels: {} };
    expect(getCompletedLevelCount(emptyProgress)).toBe(0);

    const progressWith3Levels = {
      completedLevels: {
        1: { score: 100 },
        2: { score: 200 },
        3: { score: 300 }
      }
    };
    expect(getCompletedLevelCount(progressWith3Levels)).toBe(3);
  });
});

// ========== COMPREHENSIVE EDGE CASE TESTS ==========

describe('getLevelById - edge cases', () => {
  it('returns undefined for invalid level ID', () => {
    expect(getLevelById(999)).toBeUndefined();
    expect(getLevelById(0)).toBeUndefined();
    expect(getLevelById(-1)).toBeUndefined();
  });

  it('returns correct level for boundary IDs', () => {
    const level1 = getLevelById(1);
    expect(level1).toBeDefined();
    expect(level1.id).toBe(1);

    const level16 = getLevelById(16);
    expect(level16).toBeDefined();
    expect(level16.id).toBe(16);
  });

  it('returns levels with all required fields', () => {
    const level = getLevelById(5);
    expect(level).toHaveProperty('id');
    expect(level).toHaveProperty('world');
    expect(level).toHaveProperty('name');
    expect(level).toHaveProperty('goal');
    expect(level).toHaveProperty('modifiers');
    expect(level.name).toHaveProperty('en');
    expect(level.name).toHaveProperty('fr');
  });
});

describe('getLevelsForWorld - edge cases', () => {
  it('returns empty array for invalid world ID', () => {
    expect(getLevelsForWorld(999)).toEqual([]);
    expect(getLevelsForWorld(0)).toEqual([]);
  });

  it('returns levels in correct order', () => {
    const world1Levels = getLevelsForWorld(1);
    for (let i = 0; i < world1Levels.length - 1; i++) {
      expect(world1Levels[i].id).toBeLessThan(world1Levels[i + 1].id);
    }
  });

  it('all returned levels belong to requested world', () => {
    const world1Levels = getLevelsForWorld(1);
    world1Levels.forEach(level => {
      expect(level.world).toBe(1);
    });

    const world2Levels = getLevelsForWorld(2);
    world2Levels.forEach(level => {
      expect(level.world).toBe(2);
    });
  });
});

describe('getWorldById - edge cases', () => {
  it('returns undefined for invalid world ID', () => {
    expect(getWorldById(999)).toBeUndefined();
    expect(getWorldById(0)).toBeUndefined();
  });

  it('world objects have required localized fields', () => {
    const world1 = getWorldById(1);
    expect(world1.name).toHaveProperty('en');
    expect(world1.name).toHaveProperty('fr');
    expect(world1.description).toHaveProperty('en');
    expect(world1.description).toHaveProperty('fr');
  });
});

describe('isWorldUnlocked - edge cases', () => {
  it('World 1 always unlocked even with empty progress', () => {
    const emptyProgress = { completedLevels: {} };
    expect(isWorldUnlocked(1, emptyProgress)).toBe(true);
  });

  it('World 2 unlocks only with level 8 complete', () => {
    // Level 7 complete is not enough
    const progress7 = { completedLevels: { 7: { score: 100 } } };
    expect(isWorldUnlocked(2, progress7)).toBe(false);

    // Level 8 complete unlocks World 2
    const progress8 = { completedLevels: { 8: { score: 100 } } };
    expect(isWorldUnlocked(2, progress8)).toBe(true);

    // Level 9 complete also unlocks World 2 (implies 8 done)
    const progress9 = { completedLevels: { 8: { score: 100 }, 9: { score: 100 } } };
    expect(isWorldUnlocked(2, progress9)).toBe(true);
  });

  it('World 3 unlocks after completing level 16', () => {
    const progress = { completedLevels: {} };
    expect(isWorldUnlocked(3, progress)).toBe(false);

    const progress16 = { completedLevels: { 16: { score: 100 } } };
    expect(isWorldUnlocked(3, progress16)).toBe(true);
  });

  it('returns false for undefined world IDs', () => {
    const progress = { completedLevels: {} };
    expect(isWorldUnlocked(4, progress)).toBe(false);
    expect(isWorldUnlocked(100, progress)).toBe(false);
  });
});

describe('isLevelUnlocked - edge cases', () => {
  it('returns false for invalid level ID', () => {
    const progress = { completedLevels: {} };
    expect(isLevelUnlocked(999, progress)).toBe(false);
    expect(isLevelUnlocked(0, progress)).toBe(false);
  });

  it('level 9 (first of World 2) requires World 2 unlocked', () => {
    const emptyProgress = { completedLevels: {} };
    expect(isLevelUnlocked(9, emptyProgress)).toBe(false);

    const progress8 = { completedLevels: { 8: { score: 100 } } };
    expect(isLevelUnlocked(9, progress8)).toBe(true);
  });

  it('sequential unlocking within a world', () => {
    const progress = { completedLevels: {} };

    // Level 1 unlocked by default
    expect(isLevelUnlocked(1, progress)).toBe(true);

    // Level 3 not unlocked without level 2
    expect(isLevelUnlocked(3, progress)).toBe(false);

    // Complete level 1
    progress.completedLevels[1] = { score: 100 };
    expect(isLevelUnlocked(2, progress)).toBe(true);
    expect(isLevelUnlocked(3, progress)).toBe(false);

    // Complete level 2
    progress.completedLevels[2] = { score: 100 };
    expect(isLevelUnlocked(3, progress)).toBe(true);
  });

  it('level 1 unlocked with empty progress', () => {
    const emptyProgress = { completedLevels: {} };
    expect(isLevelUnlocked(1, emptyProgress)).toBe(true);
  });
});

describe('isEndlessModeUnlocked - edge cases', () => {
  it('requires exactly level 8 completion', () => {
    const progress7 = { completedLevels: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {} } };
    expect(isEndlessModeUnlocked(progress7)).toBe(false);

    const progress8 = { completedLevels: { 8: {} } };
    expect(isEndlessModeUnlocked(progress8)).toBe(true);
  });
});

describe('getTierValue - comprehensive tests', () => {
  it('returns correct values for all 17 tiers', () => {
    expect(getTierValue(1)).toBe(2);
    expect(getTierValue(2)).toBe(4);
    expect(getTierValue(3)).toBe(8);
    expect(getTierValue(4)).toBe(16);
    expect(getTierValue(5)).toBe(32);
    expect(getTierValue(6)).toBe(64);
    expect(getTierValue(7)).toBe(128);
    expect(getTierValue(8)).toBe(256);
    expect(getTierValue(9)).toBe(512);
    expect(getTierValue(10)).toBe(1024);
    expect(getTierValue(11)).toBe(2048);
    expect(getTierValue(12)).toBe(4096);
    expect(getTierValue(13)).toBe(8192);
    expect(getTierValue(14)).toBe(16384);
    expect(getTierValue(15)).toBe(32768);
    expect(getTierValue(16)).toBe(65536);
    expect(getTierValue(17)).toBe(131072);
  });

  it('handles edge cases', () => {
    expect(getTierValue(0)).toBe(1); // 2^0 = 1
    expect(getTierValue(20)).toBe(1048576); // Large tier
  });
});

describe('getLevelModifierType - comprehensive tests', () => {
  it('returns null for levels with no modifiers', () => {
    expect(getLevelModifierType(getLevelById(1))).toBeNull();
    expect(getLevelModifierType(getLevelById(2))).toBeNull();
    expect(getLevelModifierType(getLevelById(5))).toBeNull();
  });

  it('returns first modifier type for levels with modifiers', () => {
    expect(getLevelModifierType(getLevelById(3))).toBe('time_limit');
    expect(getLevelModifierType(getLevelById(4))).toBe('move_limit');
    expect(getLevelModifierType(getLevelById(6))).toBe('small_board');
  });

  it('returns first modifier for levels with multiple modifiers', () => {
    // Level 18 has both single_cell_movement and time_limit
    const level18 = getLevelById(18);
    expect(getLevelModifierType(level18)).toBe('single_cell_movement');

    // Level 23 has single_cell_movement and blocked_cells
    const level23 = getLevelById(23);
    expect(getLevelModifierType(level23)).toBe('single_cell_movement');
  });

  it('returns null for empty object without modifiers', () => {
    expect(getLevelModifierType({ modifiers: [] })).toBeNull();
    expect(getLevelModifierType({ modifiers: null })).toBeNull();
  });
});

describe('getCompletedLevelCount - edge cases', () => {
  it('handles missing or empty completedLevels', () => {
    expect(getCompletedLevelCount({})).toBe(0);
    expect(getCompletedLevelCount({ completedLevels: {} })).toBe(0);
    expect(getCompletedLevelCount({ completedLevels: null })).toBe(0);
  });

  it('counts all 16 levels when complete', () => {
    const allComplete = {
      completedLevels: Object.fromEntries(
        Array.from({ length: 16 }, (_, i) => [i + 1, { score: 100 }])
      )
    };
    expect(getCompletedLevelCount(allComplete)).toBe(16);
  });
});

describe('CAMPAIGN_LEVELS data integrity', () => {
  it('all levels have sequential IDs', () => {
    CAMPAIGN_LEVELS.forEach((level, index) => {
      expect(level.id).toBe(index + 1);
    });
  });

  it('World 1 has 8 levels (1-8)', () => {
    const world1Levels = CAMPAIGN_LEVELS.filter(l => l.world === 1);
    expect(world1Levels).toHaveLength(8);
    expect(world1Levels[0].id).toBe(1);
    expect(world1Levels[7].id).toBe(8);
  });

  it('World 2 has 8 levels (9-16)', () => {
    const world2Levels = CAMPAIGN_LEVELS.filter(l => l.world === 2);
    expect(world2Levels).toHaveLength(8);
    expect(world2Levels[0].id).toBe(9);
    expect(world2Levels[7].id).toBe(16);
  });

  it('World 3 has 8 levels (17-24)', () => {
    const world3Levels = CAMPAIGN_LEVELS.filter(l => l.world === 3);
    expect(world3Levels).toHaveLength(8);
    expect(world3Levels[0].id).toBe(17);
    expect(world3Levels[7].id).toBe(24);
  });

  it('all levels have required goal properties', () => {
    CAMPAIGN_LEVELS.forEach(level => {
      expect(level.goal).toHaveProperty('type');
      expect(level.goal).toHaveProperty('value');
      expect(level.goal).toHaveProperty('description');
      expect(level.goal.description).toHaveProperty('en');
      expect(level.goal.description).toHaveProperty('fr');
    });
  });

  it('all level names are localized', () => {
    CAMPAIGN_LEVELS.forEach(level => {
      expect(level.name).toHaveProperty('en');
      expect(level.name).toHaveProperty('fr');
      expect(level.name.en).toBeTruthy();
      expect(level.name.fr).toBeTruthy();
    });
  });

  it('goal types are valid', () => {
    const validTypes = ['reach_tier', 'reach_tier_count', 'reach_score', 'merge_count', 'clear_tier'];
    CAMPAIGN_LEVELS.forEach(level => {
      expect(validTypes).toContain(level.goal.type);
    });
  });

  it('modifiers have valid types', () => {
    const validModifiers = ['time_limit', 'move_limit', 'small_board', 'blocked_cells', 'single_cell_movement'];
    CAMPAIGN_LEVELS.forEach(level => {
      level.modifiers.forEach(mod => {
        expect(validModifiers).toContain(mod.type);
      });
    });
  });
});

describe('WORLDS data integrity', () => {
  it('has exactly 3 worlds', () => {
    expect(WORLDS).toHaveLength(3);
  });

  it('worlds have sequential IDs', () => {
    expect(WORLDS[0].id).toBe(1);
    expect(WORLDS[1].id).toBe(2);
    expect(WORLDS[2].id).toBe(3);
  });

  it('all worlds have localized names and descriptions', () => {
    WORLDS.forEach(world => {
      expect(world.name).toHaveProperty('en');
      expect(world.name).toHaveProperty('fr');
      expect(world.description).toHaveProperty('en');
      expect(world.description).toHaveProperty('fr');
    });
  });

  it('World 3 is The City', () => {
    const world3 = getWorldById(3);
    expect(world3.name.en).toBe('The City');
    expect(world3.name.fr).toBe('La Ville');
  });
});

describe('FAILURE_MESSAGES data integrity', () => {
  it('has all required top-level keys', () => {
    expect(FAILURE_MESSAGES).toHaveProperty('title');
    expect(FAILURE_MESSAGES).toHaveProperty('progress');
    expect(FAILURE_MESSAGES).toHaveProperty('tips');
    expect(FAILURE_MESSAGES).toHaveProperty('retry');
    expect(FAILURE_MESSAGES).toHaveProperty('backToLevels');
  });

  it('title is localized', () => {
    expect(FAILURE_MESSAGES.title).toHaveProperty('en');
    expect(FAILURE_MESSAGES.title).toHaveProperty('fr');
  });

  it('progress messages cover all goal types', () => {
    const goalTypes = ['reach_tier', 'reach_tier_count', 'reach_score', 'merge_count', 'clear_tier'];
    goalTypes.forEach(type => {
      expect(FAILURE_MESSAGES.progress).toHaveProperty(type);
      expect(FAILURE_MESSAGES.progress[type]).toHaveProperty('en');
      expect(FAILURE_MESSAGES.progress[type]).toHaveProperty('fr');
    });
  });

  it('tips are localized', () => {
    const tipKeys = ['default', 'time_out', 'move_limit', 'no_moves', 'close'];
    tipKeys.forEach(key => {
      expect(FAILURE_MESSAGES.tips).toHaveProperty(key);
      expect(FAILURE_MESSAGES.tips[key]).toHaveProperty('en');
      expect(FAILURE_MESSAGES.tips[key]).toHaveProperty('fr');
    });
  });

  it('buttons are localized', () => {
    expect(FAILURE_MESSAGES.retry).toHaveProperty('en');
    expect(FAILURE_MESSAGES.retry).toHaveProperty('fr');
    expect(FAILURE_MESSAGES.backToLevels).toHaveProperty('en');
    expect(FAILURE_MESSAGES.backToLevels).toHaveProperty('fr');
  });
});
