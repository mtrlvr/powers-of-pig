// Powers of Pig - Sound System
// Web Audio API for iOS compatibility

class SoundSystem {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.buffers = {};  // Cache for decoded AudioBuffers
        this.loaded = false;
    }

    // Initialize AudioContext and preload all 17 oink sounds
    // Must be called from a user gesture handler (e.g., Play button click)
    async init() {
        if (this.loaded) return;

        // Create AudioContext - must be in user gesture handler for iOS
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Oink sound file mapping: tier -> filename
        const oinkFiles = {
            1: 'oink-01-pip.mp3',
            2: 'oink-02-sprout.mp3',
            3: 'oink-03-trotter.mp3',
            4: 'oink-04-hamlet.mp3',
            5: 'oink-05-hog.mp3',
            6: 'oink-06-siroinks.mp3',
            7: 'oink-07-wiggleton.mp3',
            8: 'oink-08-baronvonbubble.mp3',
            9: 'oink-09-sherlockhams.mp3',
            10: 'oink-10-sirloin.mp3',
            11: 'oink-11-lordporkington.mp3',
            12: 'oink-12-neilhamstrong.mp3',
            13: 'oink-13-erikthepink.mp3',
            14: 'oink-14-gandalftheham.mp3',
            15: 'oink-15-hisroyalhogness.mp3',
            16: 'oink-16-thecosmicsow.mp3',
            17: 'oink-17-thelionpig.mp3'
        };

        // Preload all sounds as AudioBuffers
        for (const [tier, filename] of Object.entries(oinkFiles)) {
            try {
                const response = await fetch(`assets/sounds/${filename}`);
                const arrayBuffer = await response.arrayBuffer();
                this.buffers[tier] = await this.audioContext.decodeAudioData(arrayBuffer);
            } catch (e) {
                // Fail silently - sound just won't play for this tier
            }
        }

        this.loaded = true;
    }

    // Play an oink sound for a specific pig tier (1-17)
    playOink(tier) {
        if (!this.enabled || !this.audioContext || !this.buffers[tier]) return;

        // Resume context if suspended (iOS suspends when app goes to background)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            source.buffer = this.buffers[tier];
            gainNode.gain.value = 0.7;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            source.start(0);
        } catch (e) {
            // Fail silently
        }
    }

    // Play a soft pop sound for spawning new tiles (use tier 1 sound quietly)
    playSpawn() {
        if (!this.enabled || !this.audioContext || !this.buffers[1]) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            source.buffer = this.buffers[1];
            source.playbackRate.value = 1.5;  // Play faster for a "pop" feel
            gainNode.gain.value = 0.2;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            source.start(0);
        } catch (e) {
            // Fail silently
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// Global sound system instance
const soundSystem = new SoundSystem();

// Export for Node/test compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SoundSystem, soundSystem };
}
