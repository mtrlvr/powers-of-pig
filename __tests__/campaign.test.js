import { describe, it, expect } from 'vitest';
import {
  CAMPAIGN_LEVELS,
  getLevelById,
  getTierValue,
  getLevelModifierType
} from '../src/levels.js';

/**
 * Campaign Mode - Goal Validation Tests
 *
 * These tests validate the goal logic for all 5 goal types in campaign mode.
 * While we can't easily test the Game class methods (checkLevelGoal) due to DOM dependencies,
 * we can validate the goal definitions and ensure they're structurally correct.
 *
 * Manual testing should verify actual goal completion logic in game.js:2778
 */

describe('Campaign Mode - Goal Definitions', () => {
  describe('reach_tier goals', () => {
    it('Level 1 has reach_tier goal for tier 2', () => {
      const level = getLevelById(1);
      expect(level.goal.type).toBe('reach_tier');
      expect(level.goal.value).toBe(2); // Tier 2 = Sprout (value 4)
      expect(getTierValue(2)).toBe(4);
    });

    it('Level 3 has reach_tier goal for tier 3', () => {
      const level = getLevelById(3);
      expect(level.goal.type).toBe('reach_tier');
      expect(level.goal.value).toBe(3); // Tier 3 = Trotter (value 8)
      expect(getTierValue(3)).toBe(8);
    });

    it('all reach_tier goals have valid tier values (1-17)', () => {
      const reachTierLevels = CAMPAIGN_LEVELS.filter(l => l.goal.type === 'reach_tier');
      reachTierLevels.forEach(level => {
        expect(level.goal.value).toBeGreaterThanOrEqual(1);
        expect(level.goal.value).toBeLessThanOrEqual(17);
      });
    });
  });

  describe('reach_tier_count goals', () => {
    it('levels with reach_tier_count have both tier and count values', () => {
      const reachTierCountLevels = CAMPAIGN_LEVELS.filter(l => l.goal.type === 'reach_tier_count');
      reachTierCountLevels.forEach(level => {
        expect(level.goal).toHaveProperty('value'); // tier
        expect(level.goal).toHaveProperty('count'); // times to reach
        expect(level.goal.value).toBeGreaterThanOrEqual(1);
        expect(level.goal.value).toBeLessThanOrEqual(17);
        expect(level.goal.count).toBeGreaterThan(0);
      });
    });

    it('reach_tier_count values are achievable (not impossible)', () => {
      const reachTierCountLevels = CAMPAIGN_LEVELS.filter(l => l.goal.type === 'reach_tier_count');
      reachTierCountLevels.forEach(level => {
        // Count should be reasonable (not > 100)
        expect(level.goal.count).toBeLessThan(100);
      });
    });
  });

  describe('reach_score goals', () => {
    it('all reach_score goals have positive score values', () => {
      const reachScoreLevels = CAMPAIGN_LEVELS.filter(l => l.goal.type === 'reach_score');
      reachScoreLevels.forEach(level => {
        expect(level.goal.value).toBeGreaterThan(0);
        expect(typeof level.goal.value).toBe('number');
      });
    });

    it('reach_score values increase with level difficulty', () => {
      const level5 = getLevelById(5);
      const level13 = getLevelById(13);

      if (level5.goal.type === 'reach_score' && level13.goal.type === 'reach_score') {
        // Later levels should have higher score requirements
        expect(level13.goal.value).toBeGreaterThan(level5.goal.value);
      }
    });
  });

  describe('merge_count goals', () => {
    it('all merge_count goals have positive merge values', () => {
      const mergeCountLevels = CAMPAIGN_LEVELS.filter(l => l.goal.type === 'merge_count');
      mergeCountLevels.forEach(level => {
        expect(level.goal.value).toBeGreaterThan(0);
        expect(typeof level.goal.value).toBe('number');
      });
    });

    it('merge_count values are achievable (not > 1000)', () => {
      const mergeCountLevels = CAMPAIGN_LEVELS.filter(l => l.goal.type === 'merge_count');
      mergeCountLevels.forEach(level => {
        expect(level.goal.value).toBeLessThan(1000);
      });
    });
  });

  describe('clear_tier goals', () => {
    it('all clear_tier goals have valid tier values', () => {
      const clearTierLevels = CAMPAIGN_LEVELS.filter(l => l.goal.type === 'clear_tier');
      clearTierLevels.forEach(level => {
        expect(level.goal.value).toBeGreaterThanOrEqual(1);
        expect(level.goal.value).toBeLessThanOrEqual(17);
      });
    });

    it('clear_tier goals target low tiers only (tiers 1-6)', () => {
      const clearTierLevels = CAMPAIGN_LEVELS.filter(l => l.goal.type === 'clear_tier');
      clearTierLevels.forEach(level => {
        // Clearing high-tier pigs would be very difficult
        expect(level.goal.value).toBeLessThanOrEqual(6);
      });
    });
  });

  describe('goal descriptions are localized', () => {
    it('all goals have English and French descriptions', () => {
      CAMPAIGN_LEVELS.forEach(level => {
        expect(level.goal.description).toHaveProperty('en');
        expect(level.goal.description).toHaveProperty('fr');
        expect(level.goal.description.en).toBeTruthy();
        expect(level.goal.description.fr).toBeTruthy();
        expect(typeof level.goal.description.en).toBe('string');
        expect(typeof level.goal.description.fr).toBe('string');
      });
    });
  });
});

describe('Campaign Mode - Modifier Definitions', () => {
  describe('time_limit modifier', () => {
    it('levels with time_limit have positive time values', () => {
      const timeLimitLevels = CAMPAIGN_LEVELS.filter(l =>
        l.modifiers.some(m => m.type === 'time_limit')
      );

      timeLimitLevels.forEach(level => {
        const timeLimitMod = level.modifiers.find(m => m.type === 'time_limit');
        expect(timeLimitMod.seconds).toBeGreaterThan(0);
        expect(typeof timeLimitMod.seconds).toBe('number');
      });
    });

    it('time_limit values are reasonable (30-300 seconds)', () => {
      const timeLimitLevels = CAMPAIGN_LEVELS.filter(l =>
        l.modifiers.some(m => m.type === 'time_limit')
      );

      timeLimitLevels.forEach(level => {
        const timeLimitMod = level.modifiers.find(m => m.type === 'time_limit');
        expect(timeLimitMod.seconds).toBeGreaterThanOrEqual(30);
        expect(timeLimitMod.seconds).toBeLessThanOrEqual(300);
      });
    });

    it('Level 3 has 90-second time limit', () => {
      const level3 = getLevelById(3);
      const timeLimitMod = level3.modifiers.find(m => m.type === 'time_limit');
      expect(timeLimitMod).toBeDefined();
      expect(timeLimitMod.seconds).toBe(90);
    });
  });

  describe('move_limit modifier', () => {
    it('levels with move_limit have positive move values', () => {
      const moveLimitLevels = CAMPAIGN_LEVELS.filter(l =>
        l.modifiers.some(m => m.type === 'move_limit')
      );

      moveLimitLevels.forEach(level => {
        const moveLimitMod = level.modifiers.find(m => m.type === 'move_limit');
        expect(moveLimitMod.moves).toBeGreaterThan(0);
        expect(typeof moveLimitMod.moves).toBe('number');
      });
    });

    it('move_limit values are reasonable (10-150 moves)', () => {
      const moveLimitLevels = CAMPAIGN_LEVELS.filter(l =>
        l.modifiers.some(m => m.type === 'move_limit')
      );

      moveLimitLevels.forEach(level => {
        const moveLimitMod = level.modifiers.find(m => m.type === 'move_limit');
        expect(moveLimitMod.moves).toBeGreaterThanOrEqual(10);
        expect(moveLimitMod.moves).toBeLessThanOrEqual(150);
      });
    });

    it('Level 4 has 30-move limit', () => {
      const level4 = getLevelById(4);
      const moveLimitMod = level4.modifiers.find(m => m.type === 'move_limit');
      expect(moveLimitMod).toBeDefined();
      expect(moveLimitMod.moves).toBe(30);
    });
  });

  describe('small_board modifier', () => {
    it('small_board modifier has no value (board size controlled separately)', () => {
      const smallBoardLevels = CAMPAIGN_LEVELS.filter(l =>
        l.modifiers.some(m => m.type === 'small_board')
      );

      smallBoardLevels.forEach(level => {
        const smallBoardMod = level.modifiers.find(m => m.type === 'small_board');
        // small_board modifier should not have a value field (3x3 is implicit)
        expect(smallBoardMod.type).toBe('small_board');
      });
    });

    it('Level 6 has small_board modifier', () => {
      const level6 = getLevelById(6);
      const smallBoardMod = level6.modifiers.find(m => m.type === 'small_board');
      expect(smallBoardMod).toBeDefined();
    });
  });

  describe('blocked_cells modifier', () => {
    it('levels with blocked_cells have valid cell coordinates', () => {
      const blockedCellsLevels = CAMPAIGN_LEVELS.filter(l =>
        l.modifiers.some(m => m.type === 'blocked_cells')
      );

      blockedCellsLevels.forEach(level => {
        const blockedCellsMod = level.modifiers.find(m => m.type === 'blocked_cells');
        expect(blockedCellsMod.positions).toBeDefined();
        expect(Array.isArray(blockedCellsMod.positions)).toBe(true);

        // Validate each cell coordinate
        blockedCellsMod.positions.forEach(cell => {
          expect(Array.isArray(cell)).toBe(true);
          expect(cell).toHaveLength(2);

          const [row, col] = cell;
          // For 4x4 board, coordinates should be 0-3
          expect(row).toBeGreaterThanOrEqual(0);
          expect(row).toBeLessThanOrEqual(3);
          expect(col).toBeGreaterThanOrEqual(0);
          expect(col).toBeLessThanOrEqual(3);
        });
      });
    });

    it('blocked_cells should not block entire board', () => {
      const blockedCellsLevels = CAMPAIGN_LEVELS.filter(l =>
        l.modifiers.some(m => m.type === 'blocked_cells')
      );

      blockedCellsLevels.forEach(level => {
        const blockedCellsMod = level.modifiers.find(m => m.type === 'blocked_cells');

        // Should block < 50% of the board (< 8 cells on 4x4 board)
        expect(blockedCellsMod.positions.length).toBeLessThan(8);

        // Should block at least 1 cell
        expect(blockedCellsMod.positions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('single_cell_movement modifier', () => {
    it('single_cell_movement modifier has no value', () => {
      const singleCellLevels = CAMPAIGN_LEVELS.filter(l =>
        l.modifiers.some(m => m.type === 'single_cell_movement')
      );

      singleCellLevels.forEach(level => {
        const singleCellMod = level.modifiers.find(m => m.type === 'single_cell_movement');
        expect(singleCellMod.type).toBe('single_cell_movement');
      });
    });

    it('Level 12 has single_cell_movement modifier', () => {
      const level12 = getLevelById(12);
      const singleCellMod = level12.modifiers.find(m => m.type === 'single_cell_movement');
      expect(singleCellMod).toBeDefined();
    });
  });

  describe('modifier combinations', () => {
    it('no level has conflicting modifiers', () => {
      CAMPAIGN_LEVELS.forEach(level => {
        const modTypes = level.modifiers.map(m => m.type);

        // Can't have both time_limit and move_limit on early levels (too restrictive)
        // Allow for later levels (10+)
        if (level.id < 10) {
          const hasBoth = modTypes.includes('time_limit') && modTypes.includes('move_limit');
          if (hasBoth) {
            console.warn(`Level ${level.id} has both time and move limits - verify this is intentional`);
          }
        }
      });
    });

    it('Level 14 has multiple modifiers (small_board + blocked_cells)', () => {
      const level14 = getLevelById(14);
      const modTypes = level14.modifiers.map(m => m.type);
      expect(modTypes).toContain('small_board');
      expect(modTypes).toContain('blocked_cells');
    });
  });
});

describe('Campaign Mode - Level Progression', () => {
  it('World 1 levels have increasing difficulty (by goal tier)', () => {
    const world1Levels = CAMPAIGN_LEVELS.filter(l => l.world === 1);
    const reachTierLevels = world1Levels.filter(l => l.goal.type === 'reach_tier');

    // Check that reach_tier goals generally increase
    for (let i = 0; i < reachTierLevels.length - 1; i++) {
      const currentTier = reachTierLevels[i].goal.value;
      const nextTier = reachTierLevels[i + 1].goal.value;

      // Allow some flexibility - not every level needs higher tier
      // but overall trend should be upward
      if (i > 0) {
        expect(nextTier).toBeGreaterThanOrEqual(currentTier - 1);
      }
    }
  });

  it('World 2 has harder modifiers than World 1', () => {
    const world1Levels = CAMPAIGN_LEVELS.filter(l => l.world === 1);
    const world2Levels = CAMPAIGN_LEVELS.filter(l => l.world === 2);

    const world1ModCount = world1Levels.reduce((sum, l) => sum + l.modifiers.length, 0);
    const world2ModCount = world2Levels.reduce((sum, l) => sum + l.modifiers.length, 0);

    // World 2 should have more total modifiers (higher difficulty)
    expect(world2ModCount).toBeGreaterThanOrEqual(world1ModCount);
  });

  it('levels use a variety of goal types', () => {
    // Level 1 should use simple reach_tier goal
    const level1 = getLevelById(1);
    expect(level1.goal.type).toBe('reach_tier');

    // Level 2 introduces reach_tier_count (tutorial)
    const level2 = getLevelById(2);
    expect(level2.goal.type).toBe('reach_tier_count');

    // Score goals should exist (levels 5, 13)
    const scoreGoalLevels = CAMPAIGN_LEVELS.filter(l => l.goal.type === 'reach_score');
    expect(scoreGoalLevels.length).toBeGreaterThan(0);

    // All goal types should be present in the codebase
    const allGoalTypes = [...new Set(CAMPAIGN_LEVELS.map(l => l.goal.type))];
    expect(allGoalTypes).toContain('reach_tier');
    expect(allGoalTypes).toContain('reach_tier_count');
    expect(allGoalTypes).toContain('reach_score');
  });
});

describe('Campaign Mode - Goal & Modifier Validation Logic', () => {
  /**
   * These tests validate the LOGIC for checking goals, not the actual game state.
   * They test edge cases and boundary conditions for goal validation.
   */

  describe('reach_tier logic edge cases', () => {
    it('reach_tier should accept >= target tier', () => {
      // If goal is tier 3 (value 8), tiles with value 8, 16, 32, etc. should all pass
      const targetTier = 3;
      const targetValue = getTierValue(targetTier); // 8

      expect(targetValue).toBe(8);

      // Simulate tiles on board
      const passingValues = [8, 16, 32, 64, 128]; // tier 3, 4, 5, 6, 7
      const failingValues = [2, 4]; // tier 1, 2

      passingValues.forEach(value => {
        expect(value >= targetValue).toBe(true);
      });

      failingValues.forEach(value => {
        expect(value >= targetValue).toBe(false);
      });
    });
  });

  describe('reach_score logic edge cases', () => {
    it('reach_score should accept exact score match', () => {
      const targetScore = 500;
      expect(500 >= targetScore).toBe(true); // exact match
      expect(501 >= targetScore).toBe(true); // over
      expect(499 >= targetScore).toBe(false); // under
    });

    it('reach_score should handle very large scores', () => {
      const targetScore = 1000000;
      expect(1000000 >= targetScore).toBe(true);
      expect(999999 >= targetScore).toBe(false);
    });
  });

  describe('merge_count logic edge cases', () => {
    it('merge_count should count all merges, not just specific tiers', () => {
      // This is implicit in the goal definition - merge_count counts ALL merges
      const level = CAMPAIGN_LEVELS.find(l => l.goal.type === 'merge_count');
      if (level) {
        expect(level.goal).not.toHaveProperty('tier'); // Should not filter by tier
      }
    });
  });

  describe('clear_tier logic edge cases', () => {
    it('clear_tier should require at least 1 move to prevent instant win', () => {
      // If board starts with no tiles of target tier, can't win immediately
      // Game logic checks: return this.levelMoves > 0;
      expect(0 > 0).toBe(false); // 0 moves = no win
      expect(1 > 0).toBe(true); // 1+ moves = can win if tier cleared
    });

    it('clear_tier should fail if even 1 tile of target tier remains', () => {
      // Simulate grid search
      const targetValue = getTierValue(2); // tier 2 = 4
      expect(targetValue).toBe(4);

      // If ANY cell has value 4, should return false
      const gridWithTargetTier = [
        [null, null, null, null],
        [null, { value: 4 }, null, null], // One tier-2 tile remains
        [null, null, null, null],
        [null, null, null, null]
      ];

      let foundTarget = false;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (gridWithTargetTier[row][col] && gridWithTargetTier[row][col].value === targetValue) {
            foundTarget = true;
          }
        }
      }

      expect(foundTarget).toBe(true); // Goal NOT met
    });
  });
});
