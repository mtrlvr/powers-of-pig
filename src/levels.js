// ========== CAMPAIGN MODE DATA ==========
// World 1: The Farm - 8 levels to validate campaign concept

// ========== WORLD DEFINITIONS ==========
const WORLDS = [
    { id: 1, name: { en: 'The Farm', fr: 'La Ferme' } }
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

// Check if a level is unlocked (previous level completed or is level 1)
function isLevelUnlocked(levelId, campaignProgress) {
    if (levelId === 1) return true;

    const level = getLevelById(levelId);
    if (!level) return false;

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
        isLevelUnlocked,
        isEndlessModeUnlocked,
        getTierValue,
        getLevelModifierType,
        getCompletedLevelCount
    };
}
