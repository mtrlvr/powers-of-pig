// Powers of Pig - Core Game Engine
// A 2048 clone with pig theming

// Supabase configuration
const SUPABASE_URL = 'https://jsfhxldbdxhrrjapsmdk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZmh4bGRiZHhocnJqYXBzbWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MDc3NTksImV4cCI6MjA4MDA4Mzc1OX0.InNcVlZr0kvDJuciGTDHWTQwgJQYYiwGBQB4sidfGJ0';

// The 17 Pigs - mapping value to pig data
const PIGS = {
    // Softer, more pastel colors for cozy aesthetic
    2:      { tier: 1,  name: 'Pip',              color: '#F5E6E3', icon: '🐷', image: 'assets/pigs/1.pip.png' },
    4:      { tier: 2,  name: 'Sprout',           color: '#F8D8D6', icon: '🐷🌱', image: 'assets/pigs/2.sprout.png' },
    8:      { tier: 3,  name: 'Trotter',          color: '#F5C4BF', icon: '🐷🦶', image: 'assets/pigs/3.trotter.png' },
    16:     { tier: 4,  name: 'Hamlet',           color: '#F2B5A0', icon: '🐷🎭', image: 'assets/pigs/4.hamlet.png' },
    32:     { tier: 5,  name: 'Hog',              color: '#E8A68E', icon: '🐗', image: 'assets/pigs/5.hog.png' },
    64:     { tier: 6,  name: 'Sir Oinks',        color: '#E09575', icon: '🐷⚔️', image: 'assets/pigs/6.siroinks.png' },
    128:    { tier: 7,  name: 'Wiggleton',        color: '#D88068', icon: '🐷💃', image: 'assets/pigs/7.wiggleton.png' },
    256:    { tier: 8,  name: 'Baron von Bubble', color: '#D06B50', icon: '🐷🎩', image: 'assets/pigs/8.baronvonbubble.png' },
    512:    { tier: 9,  name: 'Sherlock Hams',    color: '#C45B5B', icon: '🐷🔍', image: 'assets/pigs/9.sherlockhams.png' },
    1024:   { tier: 10, name: 'Sir Loin',         color: '#B06090', icon: '🐷🥩', image: 'assets/pigs/10.sirloin.png' },
    2048:   { tier: 11, name: 'Lord Porkington',  color: '#9068B0', icon: '🐷👑', image: 'assets/pigs/11.lordporkington.png' },
    4096:   { tier: 12, name: 'Neil Hamstrong',   color: '#6080C0', icon: '🐷🚀', image: 'assets/pigs/12.neilhamstrong.png' },
    8192:   { tier: 13, name: 'Erik the Pink',    color: '#509860', icon: '🐷⛵', image: 'assets/pigs/13.erikthepink.png' },
    16384:  { tier: 14, name: 'Gandalf the Ham',  color: '#788C50', icon: '🐷🧙', image: 'assets/pigs/14.gandalftheham.png' },
    32768:  { tier: 15, name: 'His Royal Hogness', color: '#C9A040', icon: '🐷👸', image: 'assets/pigs/15.hisroyalhogness.png' },
    65536:  { tier: 16, name: 'The Cosmic Sow',   color: '#5C4080', icon: '🐷✨', image: 'assets/pigs/16.thecosmicsow.png' },
    131072: { tier: 17, name: 'THE LION PIG',     color: null, icon: '🦁🐷', image: 'assets/pigs/17.thelionpig.png' }
};

// Get all pig values in order
const PIG_VALUES = Object.keys(PIGS).map(Number).sort((a, b) => a - b);

// ========== ANALYTICS (PostHog) ==========
const MILESTONES_KEY = 'pop_milestones_reached';

const Analytics = {
    track(eventName, properties = {}) {
        if (typeof posthog !== 'undefined' && posthog.capture) {
            try { posthog.capture(eventName, properties); } catch (e) {}
        }
    },
    hasMilestone(tier) {
        try {
            return JSON.parse(localStorage.getItem(MILESTONES_KEY) || '[]').includes(tier);
        } catch (e) { return false; }
    },
    setMilestone(tier) {
        try {
            const m = JSON.parse(localStorage.getItem(MILESTONES_KEY) || '[]');
            if (!m.includes(tier)) { m.push(tier); localStorage.setItem(MILESTONES_KEY, JSON.stringify(m)); }
        } catch (e) {}
    }
};

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

// ========== SHARE SYSTEM ==========
const ShareSystem = {
    // Check if Web Share API is available
    canNativeShare() {
        return navigator.share !== undefined;
    },

    // Check if can share files (not just text)
    canShareFiles() {
        if (!navigator.canShare) return false;
        const testFile = new File(['test'], 'test.png', { type: 'image/png' });
        return navigator.canShare({ files: [testFile] });
    },

    // Generate share image using html2canvas
    async captureShareCard(shareCardEl) {
        if (typeof html2canvas === 'undefined') {
            console.warn('html2canvas not loaded');
            return null;
        }

        try {
            // Temporarily make visible for capture
            shareCardEl.style.left = '0';
            shareCardEl.style.zIndex = '9999';

            const canvas = await html2canvas(shareCardEl, {
                backgroundColor: null,
                scale: 2, // Higher quality
                useCORS: true,
                allowTaint: true,
                logging: false
            });

            // Hide again
            shareCardEl.style.left = '-9999px';
            shareCardEl.style.zIndex = '';

            return new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/png');
            });
        } catch (e) {
            console.warn('Could not capture share card:', e);
            shareCardEl.style.left = '-9999px';
            shareCardEl.style.zIndex = '';
            return null;
        }
    },

    // Share with Web Share API (native)
    async nativeShare(text, blob = null) {
        const shareData = { text };

        if (blob && this.canShareFiles()) {
            shareData.files = [new File([blob], 'powers-of-pig.png', { type: 'image/png' })];
        }

        try {
            await navigator.share(shareData);
            return 'completed';
        } catch (e) {
            if (e.name === 'AbortError') {
                return 'cancelled';
            }
            throw e;
        }
    },

    // Fallback: copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    }
};

// Local storage keys
const STORAGE_KEY = 'powersOfPig';
const TUTORIAL_COMPLETE_KEY = 'pop_tutorial_complete';
const FIRST_MERGE_CELEBRATED_KEY = 'pop_first_merge_celebrated';

// ========== SOUND SYSTEM (Web Audio API for iOS compatibility) ==========
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

// ========== HAPTICS SYSTEM (Vibration API) ==========
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

class Game {
    constructor() {
        // Game state
        this.grid = [];
        this.size = 4;
        this.score = 0;
        this.highScore = 0;
        this.gameOver = false;
        this.won = false;
        this.keepPlaying = false;
        this.soundEnabled = true;
        this.previousState = null; // For undo

        // Analytics state
        this.gameStartTime = null;
        this.moveCount = 0;
        this.highestTierThisSession = 0;

        // Feedback context
        this.feedbackContext = null; // 'gameOver' or 'inGame'

        // Tutorial state
        this.tutorialActive = false;
        this.tutorialMoveCount = 0;
        this.tutorialDirection = null; // 'left', 'right', 'up', 'down'
        this.firstMergeCelebrated = false;

        // Help system state
        this.inactivityTimer = null;
        this.stuckHintVisible = false;
        this.hintArrowTimer = null;

        // Captured board state for game over screen
        this.capturedBoardState = null;

        // Tile animation system
        this.nextTileId = 0;
        this.tileElements = new Map(); // tileId → HTMLElement
        this.isAnimating = false;

        // Unlocked pigs (badges)
        this.unlockedPigs = new Set();

        // The winning value (tier 17 = 2^17 = 131072)
        this.winValue = 131072;

        // Current screen
        this.currentScreen = 'home';

        // Tile dimensions (calculated from grid)
        this.tileSize = 0;
        this.cellPositions = [];

        // Cache DOM elements
        this.cacheElements();

        // Load saved data from local storage
        this.loadGame();

        // Set up event listeners
        this.setupEventListeners();

        // Show home screen
        this.showScreen('home');

        // Update displays
        this.updateHighScoreDisplay();
        this.updateSoundButton();

        // Set up language toggle and update all text
        this.setupLanguageToggles();
        this.updateAllText();
    }

    // Cache all DOM elements
    cacheElements() {
        // Screens
        this.screens = {
            home: document.getElementById('home-screen'),
            game: document.getElementById('game-screen'),
            gameover: document.getElementById('gameover-screen'),
            win: document.getElementById('win-screen'),
            collection: document.getElementById('collection-screen')
        };

        // Overlays
        this.overlays = {
            pause: document.getElementById('pause-overlay'),
            restart: document.getElementById('restart-overlay'),
            feedback: document.getElementById('feedback-overlay'),
            'view-board': document.getElementById('view-board-overlay')
        };

        // Feedback modal elements
        this.feedbackSendToInput = document.getElementById('feedback-send-to');
        this.feedbackImproveTextarea = document.getElementById('feedback-improve');
        this.feedbackSubmitBtn = document.getElementById('feedback-submit');
        this.feedbackSkipBtn = document.getElementById('feedback-skip');

        // Game elements
        this.tileContainer = document.getElementById('tile-container');
        this.gridBackground = document.getElementById('grid-background');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.finalScoreElement = document.getElementById('final-score');
        this.highestPigBadge = document.getElementById('highest-pig-badge');
        this.newPigMessage = document.getElementById('new-pig-message');
        this.newPigBadge = document.getElementById('new-pig-badge');
        this.badgeGrid = document.getElementById('badge-grid');
        this.collectionProgress = document.getElementById('collection-progress');
        this.soundButton = document.getElementById('sound-button');

        // Game over screen elements (new)
        this.gameoverPigImage = document.getElementById('gameover-pig-image');
        this.gameoverPigName = document.getElementById('gameover-pig-name');
        this.gameoverTier = document.getElementById('gameover-tier');
        this.gameoverScoreValue = document.getElementById('gameover-score-value');
        this.gameoverSharePreview = document.getElementById('gameover-share-preview');

        // Share card elements (for image capture)
        this.shareCard = document.getElementById('share-card');
        this.shareCardPig = document.getElementById('share-card-pig');
        this.shareCardScore = document.getElementById('share-card-score');
        this.shareCardMessage = document.getElementById('share-card-message');

        // View board elements
        this.viewBoardGrid = document.getElementById('view-board-grid');
        this.viewBoardTiles = document.getElementById('view-board-tiles');
    }

    // Show a specific screen
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // Show the requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }

        // Recalculate dimensions when showing game screen
        // Use requestAnimationFrame to ensure DOM is ready after display: flex is applied
        if (screenName === 'game') {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.calculateDimensions();
                    this.render();
                });
            });
        }

        // Populate collection screen
        if (screenName === 'collection') {
            this.renderCollection();
        }
    }

    // Show/hide overlays
    showOverlay(overlayName) {
        if (this.overlays[overlayName]) {
            this.overlays[overlayName].classList.add('active');
        }
    }

    hideOverlay(overlayName) {
        if (this.overlays[overlayName]) {
            this.overlays[overlayName].classList.remove('active');
        }
    }

    hideAllOverlays() {
        Object.values(this.overlays).forEach(overlay => {
            overlay.classList.remove('active');
        });
    }

    // No longer needed - CSS Grid handles all positioning
    calculateDimensions() {
        // Invalidate cell positions cache so they're recalculated on next render
        this.cellPositions = null;
    }

    // Calculate cell positions for tile placement
    // cell.offsetLeft/offsetTop are relative to board-container
    // tile-container is inset by board-container's padding, so subtract it
    calculateCellPositions() {
        const cells = this.gridBackground.querySelectorAll('.cell');
        if (cells.length !== 16) {
            console.error('Expected 16 cells, found', cells.length);
            return null;
        }

        // tile-container is inset from board-container by this padding
        // so cell positions need this subtracted
        const boardStyle = getComputedStyle(this.gridBackground.parentElement);
        const paddingLeft = parseFloat(boardStyle.paddingLeft) || 0;
        const paddingTop = parseFloat(boardStyle.paddingTop) || 0;

        const positions = [];

        for (let row = 0; row < 4; row++) {
            positions[row] = [];
            for (let col = 0; col < 4; col++) {
                const cellIndex = row * 4 + col;
                const cell = cells[cellIndex];

                // cell.offset* is relative to board-container
                // Subtract padding since tile-container starts inside the padding
                positions[row][col] = {
                    x: cell.offsetLeft - paddingLeft,
                    y: cell.offsetTop - paddingTop,
                    width: cell.offsetWidth,
                    height: cell.offsetHeight
                };
            }
        }

        this.cellPositions = positions;
        return positions;
    }

    // Get position for a specific cell
    getCellPosition(row, col) {
        if (!this.cellPositions || this.cellPositions.length === 0) {
            this.calculateCellPositions();
        }
        return this.cellPositions[row][col];
    }

    // Start a new game
    startGame() {
        // Initialize sound on first user interaction
        soundSystem.init();
        soundSystem.setEnabled(this.soundEnabled);
        // Haptics are always on, independent of sound toggle

        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.keepPlaying = false;
        this.previousState = null;

        // Reset analytics tracking for new game
        this.gameStartTime = Date.now();
        this.moveCount = 0;

        // Clear any active timers
        this.clearInactivityTimer();

        // Clear tile elements for fresh start
        this.tileContainer.innerHTML = '';
        this.tileElements.clear();
        this.cellPositions = null;

        this.createBackgroundCells();

        // Check if tutorial should run (first-time player)
        if (!this.isTutorialComplete()) {
            // Tutorial mode: controlled board setup
            this.setupTutorialBoard();
            this.showTutorialUI();
            // Track game start (tutorial already tracks tutorial_started)
        } else {
            // Normal mode: random tile spawn
            this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
            this.tutorialActive = false;
            this.spawnTile();
            this.spawnTile();
            // Track game start
            Analytics.track('game_start');
            // Start inactivity timer for help system
            this.startInactivityTimer();
        }

        this.updateScore();
        this.showScreen('game');
        // Note: render() is called by showScreen('game') after layout is complete
    }

    // Create the empty cell backgrounds
    createBackgroundCells() {
        this.gridBackground.innerHTML = '';
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            this.gridBackground.appendChild(cell);
        }
    }

    // Save state for undo
    saveState() {
        this.previousState = {
            grid: this.grid.map(row => row.map(tile =>
                tile ? { ...tile } : null
            )),
            score: this.score
        };
    }

    // Undo last move
    undo() {
        if (!this.previousState || this.gameOver) return;

        // Clear tile elements for fresh render
        this.tileContainer.innerHTML = '';
        this.tileElements.clear();

        // Restore grid state
        this.grid = this.previousState.grid;
        this.score = this.previousState.score;
        this.previousState = null;

        // Reassign IDs to all tiles (they were shallow-copied, need new IDs for DOM tracking)
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const tile = this.grid[row][col];
                if (tile) {
                    tile.id = this.nextTileId++;
                    tile.isNew = false;
                    tile.merged = false;
                }
            }
        }

        this.updateScore();
        this.render();
    }

    // Spawn a new tile in a random empty position
    spawnTile() {
        const emptyCells = [];

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === null) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length === 0) return false;

        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;

        this.grid[row][col] = {
            id: this.nextTileId++,
            value,
            row,
            col,
            isNew: true,
            merged: false
        };

        // Track unlocked pigs
        this.unlockPig(value);

        // No sound/haptic for spawning - only play on merge

        return true;
    }

    // ========== TUTORIAL SYSTEM ==========

    // Check if tutorial should run (first-time player)
    isTutorialComplete() {
        return localStorage.getItem(TUTORIAL_COMPLETE_KEY) === 'true';
    }

    // Check if first merge celebration has been shown
    isFirstMergeCelebrated() {
        return localStorage.getItem(FIRST_MERGE_CELEBRATED_KEY) === 'true';
    }

    // Set up tutorial board with 2 Pips in controlled positions
    // Places tiles at [3,1] and [3,2] so RIGHT swipe merges them to [3,3]
    setupTutorialBoard() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));

        // Place two Pips in bottom row, adjacent - swipe RIGHT to merge
        this.grid[3][1] = { id: this.nextTileId++, value: 2, row: 3, col: 1, isNew: true, merged: false };
        this.grid[3][2] = { id: this.nextTileId++, value: 2, row: 3, col: 2, isNew: true, merged: false };

        this.tutorialDirection = 'right';
        this.tutorialActive = true;
        this.tutorialMoveCount = 0;

        // Track that Pip has been unlocked
        this.unlockPig(2);

        // Track tutorial started
        Analytics.track('tutorial_started');
    }

    // Detect if device is mobile (touch-primary)
    isMobileDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Show tutorial UI elements
    showTutorialUI() {
        const arrow = document.getElementById('tutorial-arrow');
        const text = document.getElementById('tutorial-text');
        const strings = getStrings();

        // Choose instruction based on device type
        const instruction = this.isMobileDevice()
            ? strings.tutorial.swipeInstruction
            : strings.tutorial.keyInstruction;

        if (arrow) {
            // Position arrow for right swipe
            arrow.className = 'tutorial-arrow tutorial-arrow-right active';
        }

        if (text) {
            text.textContent = instruction;
            text.classList.add('active');
        }

        // Update instruction text to tutorial text
        const instructions = document.querySelector('.instructions');
        if (instructions) {
            instructions.textContent = instruction;
        }
    }

    // Hide tutorial arrow (after first correct move)
    hideTutorialArrow() {
        const arrow = document.getElementById('tutorial-arrow');
        if (arrow) {
            arrow.classList.remove('active');
        }
    }

    // Hide all tutorial UI
    hideTutorialUI() {
        const arrow = document.getElementById('tutorial-arrow');
        const text = document.getElementById('tutorial-text');

        if (arrow) arrow.classList.remove('active');
        if (text) text.classList.remove('active');

        // Remove mergeable hints from tiles
        document.querySelectorAll('.tile.mergeable-hint').forEach(tile => {
            tile.classList.remove('mergeable-hint');
        });

        // Restore original instruction text
        const instructions = document.querySelector('.instructions');
        if (instructions) {
            instructions.textContent = getStrings().game.instructions;
            instructions.classList.remove('stuck-mode');
        }
    }

    // Advance tutorial after successful move
    advanceTutorial() {
        this.tutorialMoveCount++;

        if (this.tutorialMoveCount === 1) {
            // First merge just happened - hide arrow
            this.hideTutorialArrow();

            // Show "Match pigs to discover all 17!" after celebration
            setTimeout(() => {
                const text = document.getElementById('tutorial-text');
                const strings = getStrings();
                if (text) {
                    text.textContent = strings.tutorial.match17;
                    text.classList.add('active');
                }

                // Fade out after 2.5 seconds
                setTimeout(() => {
                    if (text) text.classList.remove('active');
                }, 2500);
            }, 2500); // Wait for celebration to finish

        } else if (this.tutorialMoveCount >= 2 && this.tutorialMoveCount <= 4) {
            // Show subtle hint on mergeable pigs
            this.showMergeableHint();

        } else if (this.tutorialMoveCount >= 5) {
            // Tutorial complete
            this.completeTutorial();
        }
    }

    // Show pulsing hint on mergeable tiles (moves 2-4)
    showMergeableHint() {
        // Wait for render to complete
        requestAnimationFrame(() => {
            // Find tiles that can merge
            const mergeablePairs = this.findMergeablePairs();

            if (mergeablePairs.length > 0) {
                // Highlight first mergeable tile
                const [row, col] = mergeablePairs[0];
                const tiles = this.tileContainer.querySelectorAll('.tile');

                tiles.forEach(tile => {
                    const tileRow = parseInt(tile.style.gridRow) - 1;
                    const tileCol = parseInt(tile.style.gridColumn) - 1;

                    if (tileRow === row && tileCol === col) {
                        tile.classList.add('mergeable-hint');

                        // Remove hint after 3 seconds
                        setTimeout(() => {
                            tile.classList.remove('mergeable-hint');
                        }, 3000);
                    }
                });
            }
        });
    }

    // Find positions of tiles that can merge
    findMergeablePairs() {
        const pairs = [];

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const tile = this.grid[row][col];
                if (!tile) continue;

                // Check right neighbor
                if (col < this.size - 1 && this.grid[row][col + 1] &&
                    this.grid[row][col + 1].value === tile.value) {
                    pairs.push([row, col]);
                }
                // Check bottom neighbor
                if (row < this.size - 1 && this.grid[row + 1][col] &&
                    this.grid[row + 1][col].value === tile.value) {
                    pairs.push([row, col]);
                }
            }
        }

        return pairs;
    }

    // Complete the tutorial
    completeTutorial() {
        this.tutorialActive = false;
        this.hideTutorialUI();

        // Persist completion
        localStorage.setItem(TUTORIAL_COMPLETE_KEY, 'true');

        // Track completion
        Analytics.track('tutorial_completed', { moves: this.tutorialMoveCount });

        // Start inactivity timer for help system
        this.startInactivityTimer();
    }

    // ========== FIRST MERGE CELEBRATION ==========

    // Show first merge celebration with confetti
    showFirstMergeCelebration() {
        // Mark as celebrated
        localStorage.setItem(FIRST_MERGE_CELEBRATED_KEY, 'true');

        // Show confetti
        this.showConfetti();

        // Show "Pip + Pip = Sprout!" text
        const mergeText = document.getElementById('merge-text');
        const strings = getStrings();
        if (mergeText) {
            mergeText.textContent = strings.tutorial.firstMerge;
            mergeText.classList.add('active');

            // Fade out after 2 seconds
            setTimeout(() => {
                mergeText.classList.remove('active');
            }, 2000);
        }

        // Add celebration scale to the Sprout tile
        requestAnimationFrame(() => {
            const sproutTile = this.tileContainer.querySelector('.tile-4');
            if (sproutTile) {
                sproutTile.classList.add('celebration-scale');
                // Remove class after animation
                setTimeout(() => {
                    sproutTile.classList.remove('celebration-scale');
                }, 600);
            }
        });
    }

    // Generate confetti pieces
    showConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;

        // Clear any existing confetti
        container.innerHTML = '';

        const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#F8D8D6'];
        const numPieces = 20;

        // Get container dimensions for positioning
        const rect = container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        for (let i = 0; i < numPieces; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.backgroundColor = colors[i % colors.length];

            // Random position near center with spread
            const spreadX = (Math.random() - 0.5) * 120;
            const spreadY = (Math.random() - 0.5) * 60;
            piece.style.left = `${centerX + spreadX}px`;
            piece.style.top = `${centerY + spreadY}px`;

            // Random rotation and delay
            piece.style.transform = `rotate(${Math.random() * 360}deg)`;
            piece.style.animationDelay = `${Math.random() * 0.3}s`;

            // Random size variation
            const size = 8 + Math.random() * 6;
            piece.style.width = `${size}px`;
            piece.style.height = `${size}px`;

            container.appendChild(piece);

            // Trigger animation
            requestAnimationFrame(() => {
                piece.classList.add('active');
            });
        }

        // Cleanup after animation
        setTimeout(() => {
            container.innerHTML = '';
        }, 2000);
    }

    // ========== STUCK HELP SYSTEM ==========

    // Start the inactivity timer
    startInactivityTimer() {
        this.clearInactivityTimer();

        // Only run if not in tutorial and game is active
        if (this.tutorialActive || this.currentScreen !== 'game' || this.gameOver) {
            return;
        }

        this.inactivityTimer = setTimeout(() => {
            this.showStuckHint();
        }, 7000); // 7 seconds
    }

    // Clear the inactivity timer
    clearInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        if (this.hintArrowTimer) {
            clearTimeout(this.hintArrowTimer);
            this.hintArrowTimer = null;
        }
    }

    // Reset inactivity timer on player input
    resetInactivityTimer() {
        // Hide stuck hint if visible
        if (this.stuckHintVisible) {
            this.hideStuckHint();
        }

        // Hide hint arrow
        this.hideHintArrow();

        // Restart timer
        this.startInactivityTimer();
    }

    // Show "Stuck?" hint
    showStuckHint() {
        if (this.tutorialActive || this.currentScreen !== 'game' || this.gameOver) {
            return;
        }

        const instructions = document.querySelector('.instructions');
        const strings = getStrings();

        if (instructions) {
            instructions.textContent = strings.help.stuck;
            instructions.classList.add('stuck-mode');
            this.stuckHintVisible = true;

            // Track analytics
            Analytics.track('stuck_hint_shown');
        }
    }

    // Hide "Stuck?" hint and restore original text
    hideStuckHint() {
        const instructions = document.querySelector('.instructions');
        const strings = getStrings();

        if (instructions) {
            instructions.textContent = strings.game.instructions;
            instructions.classList.remove('stuck-mode');
            this.stuckHintVisible = false;
        }
    }

    // Get recommended move direction
    getRecommendedDirection() {
        const directions = ['up', 'down', 'left', 'right'];
        let bestDirection = null;
        let bestScore = -1;

        for (const dir of directions) {
            const score = this.evaluateMove(dir);
            if (score > bestScore) {
                bestScore = score;
                bestDirection = dir;
            }
        }

        return bestDirection;
    }

    // Evaluate a potential move (simulate on copy)
    evaluateMove(direction) {
        // Create a deep copy of the grid
        const gridCopy = this.grid.map(row =>
            row.map(tile => tile ? { ...tile } : null)
        );

        let score = 0;
        let mergeCount = 0;
        let moved = false;

        // Simulate the move
        const vectors = {
            up: { row: -1, col: 0 },
            down: { row: 1, col: 0 },
            left: { row: 0, col: -1 },
            right: { row: 0, col: 1 }
        };

        const vec = vectors[direction];

        // Process tiles in correct order
        const processOrder = this.getMoveProcessOrder(direction);

        for (const { row, col } of processOrder) {
            const tile = gridCopy[row][col];
            if (!tile) continue;

            let newRow = row;
            let newCol = col;
            let merged = false;

            // Move tile as far as possible
            while (true) {
                const nextRow = newRow + vec.row;
                const nextCol = newCol + vec.col;

                if (nextRow < 0 || nextRow >= this.size || nextCol < 0 || nextCol >= this.size) {
                    break;
                }

                const nextTile = gridCopy[nextRow][nextCol];

                if (nextTile === null) {
                    newRow = nextRow;
                    newCol = nextCol;
                } else if (nextTile.value === tile.value && !nextTile.merged) {
                    newRow = nextRow;
                    newCol = nextCol;
                    merged = true;
                    break;
                } else {
                    break;
                }
            }

            if (newRow !== row || newCol !== col) {
                moved = true;
                gridCopy[row][col] = null;

                if (merged) {
                    const newValue = tile.value * 2;
                    gridCopy[newRow][newCol] = { value: newValue, merged: true };
                    score += newValue;
                    mergeCount++;
                    // Bonus for higher tier merges
                    score += getPig(newValue).tier * 5;
                } else {
                    tile.row = newRow;
                    tile.col = newCol;
                    gridCopy[newRow][newCol] = tile;
                }
            }
        }

        // No valid move
        if (!moved) return -1;

        // Bonus for merges
        return score + (mergeCount * 20);
    }

    // Get the order to process tiles for a move direction
    getMoveProcessOrder(direction) {
        const order = [];

        if (direction === 'left') {
            for (let row = 0; row < this.size; row++) {
                for (let col = 1; col < this.size; col++) {
                    order.push({ row, col });
                }
            }
        } else if (direction === 'right') {
            for (let row = 0; row < this.size; row++) {
                for (let col = this.size - 2; col >= 0; col--) {
                    order.push({ row, col });
                }
            }
        } else if (direction === 'up') {
            for (let col = 0; col < this.size; col++) {
                for (let row = 1; row < this.size; row++) {
                    order.push({ row, col });
                }
            }
        } else if (direction === 'down') {
            for (let col = 0; col < this.size; col++) {
                for (let row = this.size - 2; row >= 0; row--) {
                    order.push({ row, col });
                }
            }
        }

        return order;
    }

    // Show hint arrow
    showHintArrow() {
        const direction = this.getRecommendedDirection();
        if (!direction) return;

        const arrow = document.getElementById('hint-arrow');
        if (arrow) {
            arrow.className = `hint-arrow hint-arrow-${direction} active`;

            // Track analytics
            Analytics.track('stuck_hint_used', { recommended_direction: direction });

            // Auto-hide after 5 seconds
            this.hintArrowTimer = setTimeout(() => {
                this.hideHintArrow();
            }, 5000);
        }
    }

    // Hide hint arrow
    hideHintArrow() {
        const arrow = document.getElementById('hint-arrow');
        if (arrow) {
            arrow.classList.remove('active');
        }

        if (this.hintArrowTimer) {
            clearTimeout(this.hintArrowTimer);
            this.hintArrowTimer = null;
        }
    }

    // Unlock a pig (add to collection)
    unlockPig(value) {
        if (PIGS[value] && !this.unlockedPigs.has(value)) {
            this.unlockedPigs.add(value);
            this.saveGame();
            return true; // New unlock
        }
        return false;
    }

    // Get highest pig value on the board
    getHighestPig() {
        let highest = 2;
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] && this.grid[row][col].value > highest) {
                    highest = this.grid[row][col].value;
                }
            }
        }
        return highest;
    }

    // Render all tiles to the DOM (with DOM persistence for animations)
    render() {
        // Ensure positions are calculated
        if (!this.cellPositions || this.cellPositions.length === 0) {
            this.calculateCellPositions();
        }

        // Track which tiles should exist
        const currentTileIds = new Set();

        // Update or create tiles
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const tile = this.grid[row][col];
                if (tile) {
                    currentTileIds.add(tile.id);

                    let element = this.tileElements.get(tile.id);
                    if (!element) {
                        // Create new element
                        element = this.createTileElement(tile);
                        this.tileElements.set(tile.id, element);
                        this.tileContainer.appendChild(element);
                    } else {
                        // Update existing element
                        this.updateTileElement(element, tile);
                    }
                }
            }
        }

        // Remove tiles no longer in grid
        for (const [tileId, element] of this.tileElements) {
            if (!currentTileIds.has(tileId)) {
                element.remove();
                this.tileElements.delete(tileId);
            }
        }

        // Clear animation flags after delay
        setTimeout(() => {
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    const tile = this.grid[row][col];
                    if (tile) {
                        tile.isNew = false;
                        tile.merged = false;
                    }
                }
            }
            // Also remove animation classes from DOM elements
            this.tileElements.forEach(el => {
                el.classList.remove('new', 'merged');
            });
        }, 300);
    }

    // Create a new tile DOM element
    createTileElement(tile) {
        const pig = getPig(tile.value);
        const strings = getStrings();
        const localizedName = strings.pigs[pig.tier] || pig.name;

        const element = document.createElement('div');
        element.className = `tile tile-${tile.value}`;
        element.dataset.tileId = tile.id;

        if (pig.color) {
            element.style.backgroundColor = pig.color;
        }

        // Create image element for pig
        const imgEl = document.createElement('img');
        imgEl.className = 'tile-image';
        imgEl.src = pig.image;
        imgEl.alt = localizedName;
        imgEl.draggable = false;

        const nameEl = document.createElement('div');
        nameEl.className = 'tile-name';
        nameEl.textContent = localizedName;

        element.appendChild(imgEl);
        element.appendChild(nameEl);

        // Set position using transforms (for animation)
        const pos = this.getCellPosition(tile.row, tile.col);
        element.style.width = pos.width + 'px';
        element.style.height = pos.height + 'px';
        element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

        // Animation classes
        if (tile.isNew) element.classList.add('new');
        if (tile.merged) element.classList.add('merged');

        return element;
    }

    // Update an existing tile DOM element
    updateTileElement(element, tile) {
        const pig = getPig(tile.value);
        const strings = getStrings();
        const localizedName = strings.pigs[pig.tier] || pig.name;

        // Update classes for value change (after merge)
        element.className = `tile tile-${tile.value}`;
        if (tile.isNew) element.classList.add('new');
        if (tile.merged) element.classList.add('merged');

        // Update background color
        if (pig.color) {
            element.style.backgroundColor = pig.color;
        }

        // Update image if value changed
        const imgEl = element.querySelector('.tile-image');
        if (imgEl && imgEl.src !== pig.image) {
            imgEl.src = pig.image;
            imgEl.alt = localizedName;
        }

        // Update name
        const nameEl = element.querySelector('.tile-name');
        if (nameEl) {
            nameEl.textContent = localizedName;
        }

        // Update position
        const pos = this.getCellPosition(tile.row, tile.col);
        element.style.width = pos.width + 'px';
        element.style.height = pos.height + 'px';
        element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    }

    // Animate tiles from old positions to new positions
    // mergeInfo: array of { tileId, targetRow, targetCol } for tiles that merged
    async animateTileMovements(oldPositions, mergeInfo) {
        const animations = [];
        const ANIMATION_DURATION = 120;

        // Collect IDs of merged tiles for later removal
        const mergedTileIds = new Set(mergeInfo.map(m => m.tileId));

        // Animate each tile that moved to its new position (non-merged tiles)
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const tile = this.grid[row][col];
                if (!tile) continue;

                const element = this.tileElements.get(tile.id);
                if (!element) continue;

                const oldPos = oldPositions.get(tile.id);
                if (!oldPos || (oldPos.row === row && oldPos.col === col)) {
                    continue; // Tile didn't move
                }

                // Create animation promise
                const promise = new Promise(resolve => {
                    const newPos = this.getCellPosition(row, col);

                    const onTransitionEnd = (e) => {
                        if (e.propertyName === 'transform') {
                            element.removeEventListener('transitionend', onTransitionEnd);
                            resolve();
                        }
                    };
                    element.addEventListener('transitionend', onTransitionEnd);

                    // Set new transform to trigger animation
                    element.style.transform = `translate(${newPos.x}px, ${newPos.y}px)`;

                    // Fallback timeout in case transitionend doesn't fire
                    setTimeout(resolve, ANIMATION_DURATION + 30);
                });

                animations.push(promise);
            }
        }

        // Animate merged source tiles to their merge target positions
        for (const { tileId, targetRow, targetCol } of mergeInfo) {
            const element = this.tileElements.get(tileId);
            if (!element) continue;

            const mergeTargetPos = this.getCellPosition(targetRow, targetCol);

            const promise = new Promise(resolve => {
                const onTransitionEnd = (e) => {
                    if (e.propertyName === 'transform') {
                        element.removeEventListener('transitionend', onTransitionEnd);
                        resolve();
                    }
                };
                element.addEventListener('transitionend', onTransitionEnd);

                // Animate to merge position
                element.style.transform = `translate(${mergeTargetPos.x}px, ${mergeTargetPos.y}px)`;

                // Fallback timeout
                setTimeout(resolve, ANIMATION_DURATION + 30);
            });

            animations.push(promise);
        }

        // Wait for all animations to complete
        if (animations.length > 0) {
            await Promise.all(animations);
        }

        // Remove merged source tiles from DOM after animation
        for (const tileId of mergedTileIds) {
            const element = this.tileElements.get(tileId);
            if (element) {
                element.remove();
                this.tileElements.delete(tileId);
            }
        }
    }

    // Move tiles in a direction
    async move(direction) {
        if (this.gameOver || this.currentScreen !== 'game' || this.isAnimating) return;

        // Reset inactivity timer on any move attempt
        this.resetInactivityTimer();

        // Tutorial Move 0: Block wrong directions
        if (this.tutorialActive && this.tutorialMoveCount === 0) {
            if (direction !== this.tutorialDirection) {
                // Block the move - do nothing
                return;
            }
        }

        // Save state before move (for undo)
        this.saveState();

        // Capture old positions for animation
        const oldPositions = new Map();
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const tile = this.grid[row][col];
                if (tile) {
                    oldPositions.set(tile.id, { row, col });
                }
            }
        }

        let moved = false;
        let highestMergeTier = 0;  // Track highest tier pig created from merges
        const mergeInfo = [];  // Track tiles that will be merged: { tileId, targetRow, targetCol }

        // Reset merged flags
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col]) {
                    this.grid[row][col].merged = false;
                }
            }
        }

        if (direction === 'left') {
            for (let row = 0; row < this.size; row++) {
                for (let col = 1; col < this.size; col++) {
                    if (this.grid[row][col]) {
                        const result = this.moveTile(row, col, 0, -1, mergeInfo);
                        moved = result.moved || moved;
                        highestMergeTier = Math.max(highestMergeTier, result.mergeTier);
                    }
                }
            }
        } else if (direction === 'right') {
            for (let row = 0; row < this.size; row++) {
                for (let col = this.size - 2; col >= 0; col--) {
                    if (this.grid[row][col]) {
                        const result = this.moveTile(row, col, 0, 1, mergeInfo);
                        moved = result.moved || moved;
                        highestMergeTier = Math.max(highestMergeTier, result.mergeTier);
                    }
                }
            }
        } else if (direction === 'up') {
            for (let col = 0; col < this.size; col++) {
                for (let row = 1; row < this.size; row++) {
                    if (this.grid[row][col]) {
                        const result = this.moveTile(row, col, -1, 0, mergeInfo);
                        moved = result.moved || moved;
                        highestMergeTier = Math.max(highestMergeTier, result.mergeTier);
                    }
                }
            }
        } else if (direction === 'down') {
            for (let col = 0; col < this.size; col++) {
                for (let row = this.size - 2; row >= 0; row--) {
                    if (this.grid[row][col]) {
                        const result = this.moveTile(row, col, 1, 0, mergeInfo);
                        moved = result.moved || moved;
                        highestMergeTier = Math.max(highestMergeTier, result.mergeTier);
                    }
                }
            }
        }

        if (!moved) {
            // No move happened, discard saved state
            this.previousState = null;
            return;
        }

        // Animate tile movements
        this.isAnimating = true;
        await this.animateTileMovements(oldPositions, mergeInfo);

        // Increment move counter for analytics
        this.moveCount++;

        // Play sound/haptic for highest tier merge only (if any merges occurred)
        if (highestMergeTier > 0) {
            soundSystem.playOink(highestMergeTier);
            hapticsSystem.vibrateForTier(highestMergeTier);

            // First merge celebration (only once ever)
            if (!this.isFirstMergeCelebrated()) {
                this.showFirstMergeCelebration();
            }
        }

        // Advance tutorial if active
        if (this.tutorialActive) {
            this.advanceTutorial();
        }

        this.spawnTile();
        this.render();

        // Check for win (only show once)
        if (!this.won && this.checkWin()) {
            this.won = true;
            this.unlockPig(this.winValue);
            this.updateHighScore();
            setTimeout(() => this.showWinScreen(), 300);
        }
        // Check for game over
        else if (this.checkGameOver()) {
            this.gameOver = true;
            this.updateHighScore();

            // If still in tutorial, mark it complete
            if (this.tutorialActive) {
                this.completeTutorial();
            }

            setTimeout(() => this.showGameOverScreen(), 300);
        }

        this.isAnimating = false;
    }

    // Move a single tile as far as possible in the given direction
    // Returns { moved: boolean, mergeTier: number } where mergeTier is 0 if no merge
    moveTile(row, col, rowDir, colDir, mergeInfo = []) {
        const tile = this.grid[row][col];
        if (!tile) return { moved: false, mergeTier: 0 };

        let newRow = row;
        let newCol = col;
        let merged = false;
        let targetTile = null;

        while (true) {
            const nextRow = newRow + rowDir;
            const nextCol = newCol + colDir;

            if (nextRow < 0 || nextRow >= this.size || nextCol < 0 || nextCol >= this.size) {
                break;
            }

            const nextTile = this.grid[nextRow][nextCol];

            if (nextTile === null) {
                newRow = nextRow;
                newCol = nextCol;
            } else if (nextTile.value === tile.value && !nextTile.merged) {
                newRow = nextRow;
                newCol = nextCol;
                merged = true;
                targetTile = nextTile;
                break;
            } else {
                break;
            }
        }

        if (newRow !== row || newCol !== col) {
            this.grid[row][col] = null;

            if (merged) {
                // Track both source tiles for animation with their target merge position
                mergeInfo.push({ tileId: tile.id, targetRow: newRow, targetCol: newCol });
                mergeInfo.push({ tileId: targetTile.id, targetRow: newRow, targetCol: newCol });

                const newValue = tile.value * 2;
                this.grid[newRow][newCol] = {
                    id: this.nextTileId++,  // New merged tile gets new ID
                    value: newValue,
                    row: newRow,
                    col: newCol,
                    isNew: false,
                    merged: true
                };
                this.score += newValue;
                this.updateScore();

                // Unlock new pig
                this.unlockPig(newValue);

                // Return the tier of the merged pig (sound/haptic handled in move())
                const pig = getPig(newValue);
                const fromPig = getPig(tile.value);
                const strings = getStrings();
                const localizedPigName = strings.pigs[pig.tier] || pig.name;

                // Analytics: track merge (tier 6+ only to reduce volume)
                if (pig.tier >= 6) {
                    Analytics.track('merge', {
                        from_tier: fromPig.tier,
                        to_tier: pig.tier,
                        to_pig_name: localizedPigName
                    });
                }

                // Analytics: track milestone if this is a new tier reached
                if (!Analytics.hasMilestone(pig.tier)) {
                    Analytics.setMilestone(pig.tier);
                    Analytics.track('milestone_reached', {
                        tier: pig.tier,
                        pig_name: localizedPigName
                    });
                }

                // Update session highest tier
                if (pig.tier > this.highestTierThisSession) {
                    this.highestTierThisSession = pig.tier;
                }

                return { moved: true, mergeTier: pig.tier };
            } else {
                tile.row = newRow;
                tile.col = newCol;
                this.grid[newRow][newCol] = tile;
            }

            return { moved: true, mergeTier: 0 };
        }

        return { moved: false, mergeTier: 0 };
    }

    // Check if player has won
    checkWin() {
        if (this.keepPlaying) return false;

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] && this.grid[row][col].value >= this.winValue) {
                    return true;
                }
            }
        }
        return false;
    }

    // Check if no moves are possible
    checkGameOver() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === null) {
                    return false;
                }
            }
        }

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const tile = this.grid[row][col];
                if (tile) {
                    if (col < this.size - 1 && this.grid[row][col + 1] &&
                        this.grid[row][col + 1].value === tile.value) {
                        return false;
                    }
                    if (row < this.size - 1 && this.grid[row + 1][col] &&
                        this.grid[row + 1][col].value === tile.value) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    // Update score display
    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    // Update high score
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.updateHighScoreDisplay();
            this.saveGame();
        }
    }

    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }

    // Show game over screen
    showGameOverScreen() {
        // Capture board state FIRST before any changes
        this.captureBoardState();

        const highestValue = this.getHighestPig();
        const pig = getPig(highestValue);
        const strings = getStrings();
        // Get localized pig name
        const localizedName = strings.pigs[pig.tier] || pig.name;

        // Calculate game duration
        this.lastGameDuration = this.gameStartTime
            ? Math.floor((Date.now() - this.gameStartTime) / 1000)
            : 0;

        // Track game over analytics
        Analytics.track('game_over', {
            highest_tier: pig.tier,
            highest_pig_name: localizedName,
            score: this.score,
            moves: this.moveCount,
            duration_seconds: this.lastGameDuration
        });

        // Sad haptic feedback
        hapticsSystem.vibrateGameOver();

        // Populate new game over screen
        this.gameoverPigImage.src = pig.image;
        this.gameoverPigImage.alt = localizedName;
        this.gameoverPigName.textContent = localizedName;
        this.gameoverScoreValue.textContent = formatNumber(this.score);
        this.gameoverTier.textContent = strings.gameOverNew.tierIndicator(pig.tier, 17);

        // Show crown for tier 17 (THE LION PIG)
        const crown = document.getElementById('gameover-crown');
        if (crown) {
            if (pig.tier === 17) {
                crown.classList.remove('hidden');
            } else {
                crown.classList.add('hidden');
            }
        }

        // Share message preview
        const shareMessage = getShareMessage(localizedName, this.score);
        this.gameoverSharePreview.textContent = `"${shareMessage}"`;

        // Populate share card (for image capture)
        this.populateShareCard(pig, localizedName);

        // Backward compatibility: also update old elements
        this.finalScoreElement.textContent = this.score;
        this.highestPigBadge.textContent = localizedName;
        this.highestPigBadge.style.backgroundColor = pig.color || '';
        if (highestValue === 131072) {
            this.highestPigBadge.style.background = 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #9b59b6)';
        }
        this.newPigMessage.style.display = 'none';

        // Show feedback modal first, then game over screen
        this.showFeedbackModal('gameOver');
    }

    // Capture current board state for "View Board" feature
    captureBoardState() {
        this.capturedBoardState = {
            grid: this.grid.map(row => row.map(tile =>
                tile ? { value: tile.value, row: tile.row, col: tile.col } : null
            )),
            score: this.score,
            highestValue: this.getHighestPig()
        };
    }

    // Populate share card for image generation
    populateShareCard(pig, localizedName) {
        this.shareCardPig.src = pig.image;
        this.shareCardScore.textContent = formatNumber(this.score);
        this.shareCardMessage.textContent = getShareMessage(localizedName, this.score);
    }

    // Show feedback modal
    showFeedbackModal(context) {
        // Reset modal state
        this.feedbackSendToInput.value = '';
        this.feedbackImproveTextarea.value = '';
        this.feedbackContext = context;

        // Track feedback shown
        Analytics.track('feedback_shown', { context });

        this.showOverlay('feedback');
    }

    // Handle feedback submission
    async submitFeedback() {
        // Honeypot check - bots fill this hidden field, humans don't see it
        const honeypot = document.getElementById('feedback-honeypot');
        if (honeypot && honeypot.value) {
            this.closeFeedbackModal();
            return;
        }

        // Rate limit: max 1 submission per 60 seconds
        const RATE_LIMIT_KEY = 'pop_last_feedback';
        const RATE_LIMIT_MS = 60000;
        const lastSubmission = sessionStorage.getItem(RATE_LIMIT_KEY);
        if (lastSubmission && Date.now() - parseInt(lastSubmission) < RATE_LIMIT_MS) {
            this.closeFeedbackModal();
            return;
        }

        const sendToText = this.feedbackSendToInput.value.trim();
        const improvementText = this.feedbackImproveTextarea.value.trim();

        // Length validation (defense in depth - HTML maxlength is first line)
        if (sendToText.length > 500 || improvementText.length > 1000) {
            this.closeFeedbackModal();
            return;
        }

        // Get game data
        const highestValue = this.getHighestPig();
        const pig = getPig(highestValue);
        const deviceType = this.getDeviceType();

        // Track feedback submitted
        Analytics.track('feedback_submitted', {
            context: this.feedbackContext,
            has_send_to: sendToText.length > 0,
            has_improvement: improvementText.length > 0
        });

        // Send to Supabase (even if both fields are empty - still captures metadata)
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/player_feedback_comments`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    send_to_text: sendToText || null,
                    improvement_text: improvementText || null,
                    highest_pig_reached: pig.tier,
                    score: this.score,
                    moves: this.moveCount,
                    duration_seconds: this.lastGameDuration || 0,
                    device_type: deviceType
                })
            });
            // Mark submission time for rate limiting
            sessionStorage.setItem('pop_last_feedback', Date.now().toString());
        } catch (e) {
            // Fail silently - don't block game flow
            console.warn('Could not submit feedback:', e);
        }

        this.closeFeedbackModal();
    }

    // Skip feedback
    skipFeedback() {
        // Track feedback skipped
        Analytics.track('feedback_skipped', { context: this.feedbackContext });

        this.closeFeedbackModal();
    }

    // Close feedback modal
    closeFeedbackModal() {
        this.hideOverlay('feedback');

        // Handle based on context
        if (this.feedbackContext === 'gameOver') {
            // Track game over screen viewed
            const highestValue = this.capturedBoardState ? this.capturedBoardState.highestValue : this.getHighestPig();
            const pig = getPig(highestValue);
            Analytics.track('game_over_screen_viewed', {
                highest_tier: pig.tier,
                score: this.score
            });
            this.showScreen('gameover');
        }
        // For 'inGame' context, just close - return to current game

        this.feedbackContext = null;
    }

    // Handle share button click
    async handleShare(context = 'gameOver') {
        const strings = getStrings();
        const highestValue = context === 'gameOver' && this.capturedBoardState
            ? this.capturedBoardState.highestValue
            : this.getHighestPig();
        const pig = getPig(highestValue);
        const localizedName = strings.pigs[pig.tier] || pig.name;
        const scoreToShare = context === 'gameOver' && this.capturedBoardState
            ? this.capturedBoardState.score
            : this.score;

        // Generate share message based on context
        let shareMessage;
        if (context === 'gameOver') {
            shareMessage = getShareMessage(localizedName, scoreToShare);
        } else {
            shareMessage = getMidGameShareMessage(this.score);
        }

        const fullMessage = `${shareMessage}\n\n${strings.share.cta} → ${strings.share.ctaUrl}`;

        // Track share initiated
        Analytics.track('share_initiated', {
            context,
            method: ShareSystem.canNativeShare() ? 'native' : 'clipboard',
            highest_tier: pig.tier,
            score: scoreToShare
        });

        try {
            if (ShareSystem.canNativeShare()) {
                // Try to capture share card image (only for game over)
                let imageBlob = null;
                if (context === 'gameOver' && this.shareCard) {
                    imageBlob = await ShareSystem.captureShareCard(this.shareCard);
                }

                const result = await ShareSystem.nativeShare(fullMessage, imageBlob);

                if (result === 'completed') {
                    Analytics.track('share_completed', { context, method: 'native' });
                } else if (result === 'cancelled') {
                    Analytics.track('share_cancelled', { context });
                }
            } else {
                // Fallback to clipboard
                const success = await ShareSystem.copyToClipboard(fullMessage);

                if (success) {
                    Analytics.track('share_completed', { context, method: 'clipboard' });
                    this.showToast(strings.share.copiedToClipboard);
                } else {
                    this.showToast(strings.share.shareError);
                }
            }
        } catch (e) {
            console.warn('Share failed:', e);
            // Fallback to clipboard
            const success = await ShareSystem.copyToClipboard(fullMessage);
            if (success) {
                Analytics.track('share_completed', { context, method: 'clipboard_fallback' });
                this.showToast(strings.share.copiedToClipboard);
            }
        }
    }

    // Show toast notification
    showToast(message) {
        // Check if toast already exists
        let toast = document.querySelector('.share-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'share-toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 2000);
    }

    // Show frozen board view
    showViewBoard() {
        if (!this.capturedBoardState) return;

        Analytics.track('view_board_clicked', {
            highest_tier: getPig(this.capturedBoardState.highestValue).tier,
            score: this.capturedBoardState.score
        });

        // Create background cells
        this.viewBoardGrid.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            this.viewBoardGrid.appendChild(cell);
        }

        // Render captured tiles
        this.viewBoardTiles.innerHTML = '';
        const grid = this.capturedBoardState.grid;

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const tile = grid[row][col];
                if (tile) {
                    this.renderViewBoardTile(tile);
                }
            }
        }

        this.showOverlay('view-board');
    }

    // Render a single tile in view board
    renderViewBoardTile(tile) {
        const pig = getPig(tile.value);
        const strings = getStrings();
        const localizedName = strings.pigs[pig.tier] || pig.name;

        const element = document.createElement('div');
        element.className = `tile tile-${tile.value}`;
        element.style.gridColumn = tile.col + 1;
        element.style.gridRow = tile.row + 1;

        if (pig.color) {
            element.style.backgroundColor = pig.color;
        }
        if (tile.value === 131072) {
            element.style.background = 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #9b59b6)';
        }

        const imgEl = document.createElement('img');
        imgEl.className = 'tile-image';
        imgEl.src = pig.image;
        imgEl.alt = localizedName;
        imgEl.draggable = false;

        const nameEl = document.createElement('div');
        nameEl.className = 'tile-name';
        nameEl.textContent = localizedName;

        element.appendChild(imgEl);
        element.appendChild(nameEl);
        this.viewBoardTiles.appendChild(element);
    }

    // Hide view board
    hideViewBoard() {
        this.hideOverlay('view-board');
    }

    // Get device type for feedback
    getDeviceType() {
        // Check screen width first (more reliable than UA)
        if (window.innerWidth <= 768) {
            return 'mobile';
        }
        // Fallback to user agent for tablets in desktop mode
        const ua = navigator.userAgent.toLowerCase();
        if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    }

    // Show win screen
    showWinScreen() {
        this.showScreen('win');
    }

    // Continue playing after win
    continueGame() {
        this.keepPlaying = true;
        this.showScreen('game');
    }

    // Render collection/badge gallery
    renderCollection() {
        this.badgeGrid.innerHTML = '';

        PIG_VALUES.forEach(value => {
            const pig = getPig(value);
            const isUnlocked = this.unlockedPigs.has(value);

            const badge = document.createElement('div');
            badge.className = `badge-item ${isUnlocked ? 'unlocked' : 'locked'}`;

            if (isUnlocked) {
                if (value === 131072) {
                    badge.style.background = 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #9b59b6)';
                } else {
                    badge.style.backgroundColor = pig.color;
                }
            }

            const strings = getStrings();
            if (isUnlocked) {
                // Get localized pig name
                const localizedName = strings.pigs[pig.tier] || pig.name;
                badge.innerHTML = `
                    <img class="badge-image" src="${pig.image}" alt="${localizedName}" draggable="false">
                    <div class="badge-name">${localizedName}</div>
                `;
            } else {
                badge.innerHTML = `
                    <div class="badge-icon">${strings.collection.lockedIcon}</div>
                    <div class="badge-name">${strings.collection.lockedName}</div>
                `;
            }

            this.badgeGrid.appendChild(badge);
        });

        this.collectionProgress.textContent = getStrings().collection.progress(this.unlockedPigs.size);
    }

    // Toggle sound
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        soundSystem.setEnabled(this.soundEnabled);
        // Haptics remain always on, independent of sound toggle
        this.updateSoundButton();
        this.saveGame();
    }

    // Update sound button display
    updateSoundButton() {
        this.soundButton.textContent = this.soundEnabled ? getStrings().game.soundOn : getStrings().game.soundOff;
    }

    // ========== LANGUAGE MANAGEMENT ==========

    // Set up language toggle button event listeners
    setupLanguageToggles() {
        document.querySelectorAll('.lang-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                toggleLanguage();
                this.updateAllText();
            });
        });
    }

    // Update all language toggle buttons to show current language
    updateLanguageToggles() {
        const lang = getCurrentLanguage().toUpperCase();
        document.querySelectorAll('.lang-toggle').forEach(btn => {
            btn.textContent = lang;
        });
    }

    // Get a nested string value from the strings object using a dot-notation key
    getNestedString(obj, key) {
        return key.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj);
    }

    // Update all translatable text in the UI
    updateAllText() {
        const strings = getStrings();

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = this.getNestedString(strings, key);
            if (value && typeof value === 'string') {
                el.textContent = value;
            }
        });

        // Update all elements with data-i18n-placeholder attribute (for inputs)
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const value = this.getNestedString(strings, key);
            if (value && typeof value === 'string') {
                el.placeholder = value;
            }
        });

        // Update dynamic elements
        this.updateSoundButton();
        this.updateLanguageToggles();

        // Re-render based on current screen
        if (this.currentScreen === 'collection') {
            this.renderCollection();
        } else if (this.currentScreen === 'game') {
            // Re-render tiles with localized names
            this.render();
        }
    }

    // ========== PERSISTENCE (LOCAL STORAGE) ==========

    // Save game data to local storage
    saveGame() {
        const data = {
            highScore: this.highScore,
            unlockedPigs: Array.from(this.unlockedPigs),
            soundEnabled: this.soundEnabled
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            // Storage might be full or disabled - fail silently
            console.warn('Could not save game:', e);
        }
    }

    // Load game data from local storage
    loadGame() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);

                // Restore high score
                if (typeof data.highScore === 'number') {
                    this.highScore = data.highScore;
                }

                // Restore unlocked pigs
                if (Array.isArray(data.unlockedPigs)) {
                    this.unlockedPigs = new Set(data.unlockedPigs);
                }

                // Restore sound preference
                if (typeof data.soundEnabled === 'boolean') {
                    this.soundEnabled = data.soundEnabled;
                }
            }
        } catch (e) {
            // Invalid data or storage disabled - start fresh
            console.warn('Could not load game:', e);
        }
    }

    // Set up all event listeners
    setupEventListeners() {
        // Home screen buttons
        document.getElementById('play-button').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('collection-button').addEventListener('click', () => {
            this.showScreen('collection');
        });

        // Game screen buttons
        document.getElementById('home-button').addEventListener('click', () => {
            this.showOverlay('pause');
        });

        document.getElementById('pause-button').addEventListener('click', () => {
            this.showOverlay('pause');
        });

        document.getElementById('undo-button').addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('sound-button').addEventListener('click', () => {
            this.toggleSound();
        });

        // Pause menu buttons
        document.getElementById('resume-button').addEventListener('click', () => {
            this.hideOverlay('pause');
        });

        document.getElementById('restart-button').addEventListener('click', () => {
            this.hideOverlay('pause');
            this.showOverlay('restart');
        });

        document.getElementById('pause-home-button').addEventListener('click', () => {
            this.hideAllOverlays();
            this.showScreen('home');
        });

        // Restart confirmation buttons
        document.getElementById('restart-cancel').addEventListener('click', () => {
            this.hideOverlay('restart');
        });

        document.getElementById('restart-confirm').addEventListener('click', () => {
            this.hideOverlay('restart');
            this.startGame();
        });

        // Game over screen buttons
        document.getElementById('play-again-button').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('gameover-home-button').addEventListener('click', () => {
            this.showScreen('home');
        });

        // Share button (game over screen)
        document.getElementById('share-button').addEventListener('click', () => {
            this.handleShare('gameOver');
        });

        // View board button
        document.getElementById('view-board-button').addEventListener('click', () => {
            this.showViewBoard();
        });

        // View board close button
        document.getElementById('view-board-close').addEventListener('click', () => {
            this.hideViewBoard();
        });

        // Mid-game share button
        document.getElementById('share-mid-game-button').addEventListener('click', () => {
            this.handleShare('midGame');
        });

        // Feedback modal buttons
        document.getElementById('feedback-submit').addEventListener('click', () => {
            this.submitFeedback();
        });

        document.getElementById('feedback-skip').addEventListener('click', () => {
            this.skipFeedback();
        });

        // "Give Feedback" link (opens same modal with inGame context)
        document.getElementById('feedback-link').addEventListener('click', () => {
            this.showFeedbackModal('inGame');
        });

        // "Stuck?" click handler (shows hint arrow)
        document.querySelector('.instructions').addEventListener('click', () => {
            if (this.stuckHintVisible) {
                this.showHintArrow();
            }
        });

        // Win screen buttons
        document.getElementById('continue-button').addEventListener('click', () => {
            this.continueGame();
        });

        document.getElementById('new-game-button').addEventListener('click', () => {
            this.startGame();
        });

        // Collection screen back button
        document.getElementById('collection-back-button').addEventListener('click', () => {
            this.showScreen('home');
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.currentScreen !== 'game') return;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.showOverlay('pause');
                    break;
            }
        });

        // Touch controls (swipe)
        let touchStartX = 0;
        let touchStartY = 0;
        const minSwipeDistance = 30;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (this.currentScreen !== 'game') return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) >= minSwipeDistance) {
                    this.move(deltaX > 0 ? 'right' : 'left');
                }
            } else {
                if (Math.abs(deltaY) >= minSwipeDistance) {
                    this.move(deltaY > 0 ? 'down' : 'up');
                }
            }
        }, { passive: true });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.currentScreen === 'game') {
                // Invalidate position cache
                this.cellPositions = null;

                // Recalculate positions
                this.calculateCellPositions();

                // Update all tile positions without animation
                for (const [tileId, element] of this.tileElements) {
                    // Find tile in grid
                    for (let row = 0; row < this.size; row++) {
                        for (let col = 0; col < this.size; col++) {
                            const tile = this.grid[row][col];
                            if (tile && tile.id === tileId) {
                                const pos = this.getCellPosition(row, col);

                                // Disable transition temporarily
                                element.style.transition = 'none';
                                element.style.width = pos.width + 'px';
                                element.style.height = pos.height + 'px';
                                element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

                                // Force reflow and restore transition
                                element.offsetHeight;
                                element.style.transition = '';
                                break;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
