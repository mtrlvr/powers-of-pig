// Powers of Pig - Utility Functions
// Helper functions for pig data and image preloading

// Get pig info by value
function getPig(value) {
    return PIGS[value] || { tier: 0, name: '?', color: '#ccc' };
}

// Get the next pig after a given value (returns null for THE LION PIG)
function getNextPig(value) {
    const currentIndex = PIG_VALUES.indexOf(value);
    if (currentIndex === -1 || currentIndex >= PIG_VALUES.length - 1) {
        return null; // No next pig (already at max or invalid)
    }
    return PIGS[PIG_VALUES[currentIndex + 1]];
}

// ========== IMAGE PRELOADING ==========
// Preload all pig images to prevent delay on first appearance
function preloadPigImages() {
    Object.values(PIGS).forEach(pig => {
        const img = new Image();
        img.src = pig.image;
    });
}

// Preload images immediately when script loads
preloadPigImages();

// Export for Node/test compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getPig, getNextPig, preloadPigImages };
}
