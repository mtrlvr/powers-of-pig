// ========== CAMPAIGN MODE DATA ==========
// World 1: The Farm - 8 levels to validate campaign concept

// ========== WORLD DEFINITIONS ==========
const WORLDS = [
    {
        id: 1,
        name: { en: 'The Farm', fr: 'La Ferme' },
        description: {
            en: 'Learn the basics and discover your first pigs',
            fr: 'Découvre les bases du jeu'
        }
    },
    {
        id: 2,
        name: { en: 'The Mudlands', fr: 'Les Marais' },
        description: {
            en: 'Navigate mud patches and master strategic movement',
            fr: 'Défie les marais et maîtrise tes déplacements'
        }
    },
    {
        id: 3,
        name: { en: 'The City', fr: 'La Ville' },
        description: {
            en: 'Conquer the urban jungle and reach new heights',
            fr: 'Conquiers la jungle urbaine et atteins de nouveaux sommets'
        }
    }
];

// ========== WORLD 1 LEVELS (8 levels) ==========
const CAMPAIGN_LEVELS = [
    {
        id: 1,
        world: 1,
        name: { en: 'First Steps', fr: 'Premiers Pas' },
        goal: {
            type: 'reach_tier',
            value: 2,
            description: { en: 'Reach Sprout', fr: 'Atteins Pousse' }
        },
        modifiers: []
    },
    {
        id: 2,
        world: 1,
        name: { en: 'Double Trouble', fr: 'Double Problème' },
        goal: {
            type: 'reach_tier_count',
            value: 2,
            count: 2,
            description: { en: 'Create 2 Sprouts', fr: 'Crée 2 Pousses' }
        },
        modifiers: []
    },
    {
        id: 3,
        world: 1,
        name: { en: 'Quick Thinking', fr: 'Réflexion Rapide' },
        goal: {
            type: 'reach_tier',
            value: 3,
            description: { en: 'Reach Trotter', fr: 'Atteins Trotteur' }
        },
        modifiers: [{ type: 'time_limit', seconds: 90 }]
    },
    {
        id: 4,
        world: 1,
        name: { en: 'Efficiency', fr: 'Efficacité' },
        goal: {
            type: 'reach_tier',
            value: 3,
            description: { en: 'Reach Trotter', fr: 'Atteins Trotteur' }
        },
        modifiers: [{ type: 'move_limit', moves: 30 }]
    },
    {
        id: 5,
        world: 1,
        name: { en: 'Score Chase', fr: 'Chasse au Score' },
        goal: {
            type: 'reach_score',
            value: 500,
            description: { en: 'Score 500 points', fr: 'Marque 500 points' }
        },
        modifiers: []
    },
    {
        id: 6,
        world: 1,
        name: { en: 'Tight Space', fr: 'Espace Réduit' },
        goal: {
            type: 'reach_tier',
            value: 4,
            description: { en: 'Reach Hamlet', fr: 'Atteins Goret' }
        },
        modifiers: [{ type: 'small_board', size: 3 }]
    },
    {
        id: 7,
        world: 1,
        name: { en: 'Race to Hog', fr: 'Course au Cochon' },
        goal: {
            type: 'reach_tier',
            value: 5,
            description: { en: 'Reach Hog', fr: 'Atteins Gros Cochon' }
        },
        modifiers: [{ type: 'time_limit', seconds: 120 }]
    },
    {
        id: 8,
        world: 1,
        name: { en: 'The Graduate', fr: 'Le Diplômé' },
        goal: {
            type: 'reach_tier',
            value: 6,
            description: { en: 'Reach Sir Oinks', fr: 'Atteins Sire Gruik' }
        },
        modifiers: [{ type: 'move_limit', moves: 50 }]
    },

    // ========== WORLD 2: THE MUDLANDS (8 levels) ==========
    // Rebalanced difficulty curve: teach single_cell_movement gradually
    // Tier progression: 6 → 6 → 4 → 5 → 6 → 6 → 7 → 7
    {
        id: 9,
        world: 2,
        name: { en: 'Muddy Ground', fr: 'Sol Boueux' },
        goal: {
            type: 'reach_tier',
            value: 6,
            description: { en: 'Reach Sir Oinks', fr: 'Atteins Sire Gruik' }
        },
        modifiers: [{ type: 'blocked_cells', positions: [[0, 0], [3, 3]] }]
    },
    {
        id: 10,
        world: 2,
        name: { en: 'Corner Chaos', fr: 'Chaos des Coins' },
        goal: {
            type: 'reach_tier',
            value: 6,
            description: { en: 'Reach Sir Oinks', fr: 'Atteins Sire Gruik' }
        },
        modifiers: [{ type: 'blocked_cells', positions: [[0, 0], [0, 3], [3, 0], [3, 3]] }]
    },
    {
        id: 11,
        world: 2,
        name: { en: 'Slow Slide', fr: 'Glissement Lent' },
        goal: {
            type: 'reach_tier',
            value: 4,
            description: { en: 'Reach Hamlet', fr: 'Atteins Goret' }
        },
        modifiers: [{ type: 'single_cell_movement' }]
    },
    {
        id: 12,
        world: 2,
        name: { en: 'Steady Steps', fr: 'Pas Réguliers' },
        goal: {
            type: 'reach_tier',
            value: 5,
            description: { en: 'Reach Hog', fr: 'Atteins Gros Cochon' }
        },
        modifiers: [{ type: 'single_cell_movement' }]
    },
    {
        id: 13,
        world: 2,
        name: { en: 'Finding Rhythm', fr: 'Trouver le Rythme' },
        goal: {
            type: 'reach_tier',
            value: 6,
            description: { en: 'Reach Sir Oinks', fr: 'Atteins Sire Gruik' }
        },
        modifiers: [{ type: 'single_cell_movement' }]
    },
    {
        id: 14,
        world: 2,
        name: { en: 'Quick Mud', fr: 'Boue Rapide' },
        goal: {
            type: 'reach_tier',
            value: 6,
            description: { en: 'Reach Sir Oinks', fr: 'Atteins Sire Gruik' }
        },
        modifiers: [{ type: 'time_limit', seconds: 120 }]
    },
    {
        id: 15,
        world: 2,
        name: { en: 'Rising Higher', fr: 'Vers les Sommets' },
        goal: {
            type: 'reach_tier',
            value: 7,
            description: { en: 'Reach Wiggleton', fr: 'Atteins Wiggleton' }
        },
        modifiers: []
    },
    {
        id: 16,
        world: 2,
        name: { en: 'The Deep Muck', fr: 'La Boue Profonde' },
        goal: {
            type: 'reach_tier',
            value: 7,
            description: { en: 'Reach Wiggleton', fr: 'Atteins Wiggleton' }
        },
        modifiers: [{ type: 'small_board', size: 3 }]
    },

    // ========== WORLD 3: THE CITY (8 levels) ==========
    // Advanced challenges combining mechanics from Worlds 1-2
    // Tier progression: 7 → 7 → 8 → 8 → 8 → 9 → 9 → 10
    {
        id: 17,
        world: 3,
        name: { en: 'City Limits', fr: 'Limites de la Ville' },
        goal: {
            type: 'reach_tier',
            value: 7,
            description: { en: 'Reach Wiggleton', fr: 'Atteins Wiggleton' }
        },
        modifiers: [{ type: 'blocked_cells', positions: [[1, 1], [2, 2]] }]
    },
    {
        id: 18,
        world: 3,
        name: { en: 'Rush Hour', fr: 'Heure de Pointe' },
        goal: {
            type: 'reach_tier',
            value: 7,
            description: { en: 'Reach Wiggleton', fr: 'Atteins Wiggleton' }
        },
        modifiers: [
            { type: 'single_cell_movement' },
            { type: 'time_limit', seconds: 150 }
        ]
    },
    {
        id: 19,
        world: 3,
        name: { en: 'Penthouse', fr: 'Penthouse' },
        goal: {
            type: 'reach_tier',
            value: 8,
            description: { en: 'Reach Baron von Bubble', fr: 'Atteins Baron von Bulle' }
        },
        modifiers: []
    },
    {
        id: 20,
        world: 3,
        name: { en: 'Narrow Alleys', fr: 'Ruelles Étroites' },
        goal: {
            type: 'reach_tier',
            value: 8,
            description: { en: 'Reach Baron von Bubble', fr: 'Atteins Baron von Bulle' }
        },
        modifiers: [{ type: 'small_board', size: 3 }]
    },
    {
        id: 21,
        world: 3,
        name: { en: 'Traffic Jam', fr: 'Embouteillage' },
        goal: {
            type: 'reach_tier',
            value: 8,
            description: { en: 'Reach Baron von Bubble', fr: 'Atteins Baron von Bulle' }
        },
        modifiers: [{ type: 'blocked_cells', positions: [[0, 0], [0, 3], [3, 0], [3, 3]] }]
    },
    {
        id: 22,
        world: 3,
        name: { en: 'Metro Sprint', fr: 'Sprint du Métro' },
        goal: {
            type: 'reach_tier',
            value: 9,
            description: { en: 'Reach Sherlock Hams', fr: 'Atteins Sherlock Jambons' }
        },
        modifiers: [{ type: 'time_limit', seconds: 180 }]
    },
    {
        id: 23,
        world: 3,
        name: { en: 'Gridlock', fr: 'Blocage Total' },
        goal: {
            type: 'reach_tier',
            value: 9,
            description: { en: 'Reach Sherlock Hams', fr: 'Atteins Sherlock Jambons' }
        },
        modifiers: [
            { type: 'single_cell_movement' },
            { type: 'blocked_cells', positions: [[0, 1], [3, 2]] }
        ]
    },
    {
        id: 24,
        world: 3,
        name: { en: 'Skyscraper', fr: 'Gratte-Ciel' },
        goal: {
            type: 'reach_tier',
            value: 10,
            description: { en: 'Reach Sir Loin', fr: 'Atteins Sir Loin' }
        },
        modifiers: [{ type: 'move_limit', moves: 150 }]
    }
];

// ========== FAILURE MESSAGES ==========
const FAILURE_MESSAGES = {
    // Main message
    title: { en: "SO CLOSE!", fr: "SI PRÈS !" },

    // Progress messages (fill in dynamically with {achieved}, {remaining}, {target})
    progress: {
        reach_tier: { en: "You reached {achieved} — just {remaining} merge(s) from {target}!", fr: "Tu as atteint {achieved} — plus que {remaining} fusion(s) jusqu'à {target} !" },
        reach_tier_count: { en: "You created {achieved} of {target}!", fr: "Tu as créé {achieved} sur {target} !" },
        reach_score: { en: "You scored {achieved} — only {remaining} points away!", fr: "Tu as marqué {achieved} — plus que {remaining} points !" },
        merge_count: { en: "You merged {achieved} times — {remaining} more to go!", fr: "Tu as fusionné {achieved} fois — encore {remaining} !" },
        clear_tier: { en: "Almost cleared! Just {remaining} Pip(s) left!", fr: "Presque ! Plus que {remaining} Pépin(s) !" }
    },

    // Contextual tips
    tips: {
        default: { en: "Keep your highest pig in a corner. Build toward it.", fr: "Garde ton plus gros cochon dans un coin. Construis vers lui." },
        time_out: { en: "Speed comes from patterns. Try the corner strategy!", fr: "La vitesse vient des patterns. Essaie la stratégie du coin !" },
        move_limit: { en: "Every move counts! Plan ahead.", fr: "Chaque coup compte ! Planifie à l'avance." },
        no_moves: { en: "Swipe in one direction to consolidate tiles.", fr: "Glisse dans une direction pour consolider les tuiles." },
        close: { en: "You were SO close! One more try?", fr: "Tu étais SI PRÈS ! On réessaie ?" }
    },

    // Buttons
    retry: { en: "Retry", fr: "Réessayer" },
    backToLevels: { en: "Back to Levels", fr: "Retour aux Niveaux" }
};

// ========== HELPER FUNCTIONS ==========

// Get level by ID
function getLevelById(levelId) {
    return CAMPAIGN_LEVELS.find(level => level.id === levelId);
}

// Get all levels for a world
function getLevelsForWorld(worldId) {
    return CAMPAIGN_LEVELS.filter(level => level.world === worldId);
}

// Get world by ID
function getWorldById(worldId) {
    return WORLDS.find(world => world.id === worldId);
}

// Check if a world is unlocked
function isWorldUnlocked(worldId, campaignProgress) {
    if (worldId === 1) return true; // World 1 always unlocked

    // World 2 requires completing all of World 1 (level 8)
    if (worldId === 2) {
        return campaignProgress.completedLevels[8] !== undefined;
    }

    // World 3 requires completing all of World 2 (level 16)
    if (worldId === 3) {
        return campaignProgress.completedLevels[16] !== undefined;
    }

    return false;
}

// Check if a level is unlocked (previous level completed or is first level of unlocked world)
function isLevelUnlocked(levelId, campaignProgress) {
    const level = getLevelById(levelId);
    if (!level) return false;

    // Check if the world is unlocked first
    if (!isWorldUnlocked(level.world, campaignProgress)) return false;

    // Check if this is the first level of the world
    const worldLevels = getLevelsForWorld(level.world);
    if (worldLevels.length > 0 && levelId === worldLevels[0].id) return true;

    // Check if previous level is completed
    const previousLevelId = levelId - 1;
    return campaignProgress.completedLevels[previousLevelId] !== undefined;
}

// Check if endless mode is unlocked (World 1 complete = level 8 done)
function isEndlessModeUnlocked(campaignProgress) {
    return campaignProgress.completedLevels[8] !== undefined;
}

// Get tier value from tier number (e.g., tier 5 = value 32)
function getTierValue(tier) {
    return Math.pow(2, tier);
}

// Get the modifier type for a level (returns first modifier type or null)
function getLevelModifierType(level) {
    if (!level.modifiers || level.modifiers.length === 0) return null;
    return level.modifiers[0].type;
}

// Get completed level count
function getCompletedLevelCount(campaignProgress) {
    return Object.keys(campaignProgress.completedLevels || {}).length;
}

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
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
    };
}
