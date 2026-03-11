// Powers of Pig - Haptics System
// Vibration API for tactile feedback
// NOTE: Haptics are always enabled, independent of sound toggle

class HapticsSystem {
    constructor() {
        this.supported = 'vibrate' in navigator;
    }

    // Vibrate with a pattern for a specific pig tier (1-17)
    // Patterns based on tier groups as specified:
    // - Tier 1-4: Light quick tap [50]
    // - Tier 5-8: Medium pulse [100]
    // - Tier 9-12: Strong thud [150]
    // - Tier 13-16: Double pulse [75, 50, 75]
    // - Tier 17: Triumphant pattern [100, 30, 100, 30, 200]
    vibrateForTier(tier) {
        if (!this.supported) return;

        let pattern;

        if (tier <= 4) {
            // Tiers 1-4 (Pip → Hamlet): Light quick tap
            pattern = [50];
        } else if (tier <= 8) {
            // Tiers 5-8 (Hog → Baron von Bubble): Medium pulse
            pattern = [100];
        } else if (tier <= 12) {
            // Tiers 9-12 (Sherlock Hams → Neil Hamstrong): Strong thud
            pattern = [150];
        } else if (tier <= 16) {
            // Tiers 13-16 (Erik the Pink → The Cosmic Sow): Double pulse
            pattern = [75, 50, 75];
        } else {
            // Tier 17 (THE LION PIG): Triumphant pattern!
            pattern = [100, 30, 100, 30, 200];
        }

        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // Vibration might fail on some devices - fail silently
        }
    }

    // Light tap for spawning new tiles
    vibrateSpawn() {
        if (!this.supported) return;

        try {
            navigator.vibrate(8);
        } catch (e) {
            // Fail silently
        }
    }

    // Quick feedback for button presses
    vibrateButton() {
        if (!this.supported) return;

        try {
            navigator.vibrate(5);
        } catch (e) {
            // Fail silently
        }
    }

    // Sad vibration for game over
    vibrateGameOver() {
        if (!this.supported) return;

        try {
            // Descending pattern feels "deflating"
            navigator.vibrate([100, 100, 80, 100, 60, 100, 40]);
        } catch (e) {
            // Fail silently
        }
    }
}

// Global haptics system instance
const hapticsSystem = new HapticsSystem();

// Export for Node/test compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HapticsSystem, hapticsSystem };
}
