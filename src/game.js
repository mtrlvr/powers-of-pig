// Powers of Pig - Core Game Engine
// A 2048 clone with pig theming

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

// Get pig info by value
function getPig(value) {
    return PIGS[value] || { tier: 0, name: '?', color: '#ccc' };
}

// Lives system constants
const MAX_LIVES = 3;
const LIFE_REGEN_TIME = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

// Local storage key
const STORAGE_KEY = 'powersOfPig';

// ========== SOUND SYSTEM (Preloaded MP3 files) ==========
class SoundSystem {
    constructor() {
        this.enabled = true;
        this.sounds = {};  // Cache for preloaded Audio elements
        this.loaded = false;
    }

    // Preload all 17 oink sounds
    init() {
        if (this.loaded) return;

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

        // Preload all sounds
        for (const [tier, filename] of Object.entries(oinkFiles)) {
            const audio = new Audio(`assets/sounds/${filename}`);
            audio.preload = 'auto';
            // Clone audio for overlapping plays
            this.sounds[tier] = audio;
        }

        this.loaded = true;
    }

    // Play an oink sound for a specific pig tier (1-17)
    playOink(tier) {
        if (!this.enabled || !this.sounds[tier]) return;

        try {
            // Reuse audio element (cloneNode doesn't work reliably on mobile)
            const sound = this.sounds[tier];
            sound.currentTime = 0;
            sound.volume = 0.7;
            sound.play().catch(() => {
                // Autoplay might be blocked - fail silently
            });
        } catch (e) {
            // Audio playback failed - fail silently
        }
    }

    // Play a soft pop sound for spawning new tiles (use tier 1 sound quietly)
    playSpawn() {
        if (!this.enabled || !this.sounds[1]) return;

        try {
            // Reuse audio element (cloneNode doesn't work reliably on mobile)
            const sound = this.sounds[1];
            sound.currentTime = 0;
            sound.volume = 0.2;
            sound.playbackRate = 1.5;  // Play faster for a "pop" feel
            sound.play().catch(() => {});
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

        // Lives system
        this.lives = MAX_LIVES;
        this.lastLifeLostTime = null; // Timestamp when a life was last lost (for regen)
        this.lifeRegenInterval = null;

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

        // Check for life regeneration
        this.checkLifeRegen();

        // Show home screen
        this.showScreen('home');

        // Update displays
        this.updateHighScoreDisplay();
        this.updateLivesDisplay();
        this.updateSoundButton();
    }

    // Cache all DOM elements
    cacheElements() {
        // Screens
        this.screens = {
            home: document.getElementById('home-screen'),
            game: document.getElementById('game-screen'),
            gameover: document.getElementById('gameover-screen'),
            win: document.getElementById('win-screen'),
            collection: document.getElementById('collection-screen'),
            nolives: document.getElementById('nolives-screen')
        };

        // Overlays
        this.overlays = {
            pause: document.getElementById('pause-overlay'),
            restart: document.getElementById('restart-overlay'),
            purchase: document.getElementById('purchase-overlay')
        };

        // Purchase modal elements
        this.purchaseMessage = document.getElementById('purchase-message');

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

        // Lives elements
        this.homeLivesDisplay = document.getElementById('home-lives');
        this.nextLifeCountdown = document.getElementById('next-life-countdown');
        this.buyOneLifeBtn = document.getElementById('buy-one-life');
        this.buyThreeLivesBtn = document.getElementById('buy-three-lives');
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
        // Use double requestAnimationFrame to ensure CSS Grid layout is complete on mobile
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
        // Kept for compatibility with existing calls
    }

    // Start a new game
    startGame() {
        // Initialize sound on first user interaction
        soundSystem.init();
        soundSystem.setEnabled(this.soundEnabled);
        // Haptics are always on, independent of sound toggle

        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.keepPlaying = false;
        this.previousState = null;

        this.tileContainer.innerHTML = '';
        this.createBackgroundCells();

        this.spawnTile();
        this.spawnTile();

        this.updateScore();
        this.showScreen('game');
        this.render();
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

        this.grid = this.previousState.grid;
        this.score = this.previousState.score;
        this.previousState = null;

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

    // Render all tiles to the DOM
    render() {
        this.tileContainer.innerHTML = '';

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const tile = this.grid[row][col];
                if (tile) {
                    this.renderTile(tile);
                }
            }
        }

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
        }, 200);
    }

    // Render a single tile
    renderTile(tile) {
        const pig = getPig(tile.value);
        const element = document.createElement('div');
        element.className = `tile tile-${tile.value}`;

        if (tile.isNew) element.classList.add('new');
        if (tile.merged) element.classList.add('merged');

        // Use CSS Grid placement (1-indexed)
        element.style.gridColumn = tile.col + 1;
        element.style.gridRow = tile.row + 1;

        if (pig.color) {
            element.style.backgroundColor = pig.color;
        }

        // Create image element for pig
        const imgEl = document.createElement('img');
        imgEl.className = 'tile-image';
        imgEl.src = pig.image;
        imgEl.alt = pig.name;
        imgEl.draggable = false;

        const nameEl = document.createElement('div');
        nameEl.className = 'tile-name';
        nameEl.textContent = pig.name;

        element.appendChild(imgEl);
        element.appendChild(nameEl);
        this.tileContainer.appendChild(element);
    }

    // Move tiles in a direction
    move(direction) {
        if (this.gameOver || this.currentScreen !== 'game') return;

        // Save state before move (for undo)
        this.saveState();

        let moved = false;
        let highestMergeTier = 0;  // Track highest tier pig created from merges

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
                        const result = this.moveTile(row, col, 0, -1);
                        moved = result.moved || moved;
                        highestMergeTier = Math.max(highestMergeTier, result.mergeTier);
                    }
                }
            }
        } else if (direction === 'right') {
            for (let row = 0; row < this.size; row++) {
                for (let col = this.size - 2; col >= 0; col--) {
                    if (this.grid[row][col]) {
                        const result = this.moveTile(row, col, 0, 1);
                        moved = result.moved || moved;
                        highestMergeTier = Math.max(highestMergeTier, result.mergeTier);
                    }
                }
            }
        } else if (direction === 'up') {
            for (let col = 0; col < this.size; col++) {
                for (let row = 1; row < this.size; row++) {
                    if (this.grid[row][col]) {
                        const result = this.moveTile(row, col, -1, 0);
                        moved = result.moved || moved;
                        highestMergeTier = Math.max(highestMergeTier, result.mergeTier);
                    }
                }
            }
        } else if (direction === 'down') {
            for (let col = 0; col < this.size; col++) {
                for (let row = this.size - 2; row >= 0; row--) {
                    if (this.grid[row][col]) {
                        const result = this.moveTile(row, col, 1, 0);
                        moved = result.moved || moved;
                        highestMergeTier = Math.max(highestMergeTier, result.mergeTier);
                    }
                }
            }
        }

        if (moved) {
            // Play sound/haptic for highest tier merge only (if any merges occurred)
            if (highestMergeTier > 0) {
                soundSystem.playOink(highestMergeTier);
                hapticsSystem.vibrateForTier(highestMergeTier);
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
                setTimeout(() => this.showGameOverScreen(), 300);
            }
        } else {
            // No move happened, discard saved state
            this.previousState = null;
        }
    }

    // Move a single tile as far as possible in the given direction
    // Returns { moved: boolean, mergeTier: number } where mergeTier is 0 if no merge
    moveTile(row, col, rowDir, colDir) {
        const tile = this.grid[row][col];
        if (!tile) return { moved: false, mergeTier: 0 };

        let newRow = row;
        let newCol = col;
        let merged = false;

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
                break;
            } else {
                break;
            }
        }

        if (newRow !== row || newCol !== col) {
            this.grid[row][col] = null;

            if (merged) {
                const newValue = tile.value * 2;
                this.grid[newRow][newCol] = {
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
        // Lose a life on game over
        this.loseLife();

        // Sad haptic feedback
        hapticsSystem.vibrateGameOver();

        this.finalScoreElement.textContent = this.score;

        const highestValue = this.getHighestPig();
        const pig = getPig(highestValue);

        this.highestPigBadge.textContent = pig.name;
        this.highestPigBadge.style.backgroundColor = pig.color || '';
        if (highestValue === 131072) {
            this.highestPigBadge.style.background = 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #9b59b6)';
        }

        // Hide new pig message for now (will implement in persistence phase)
        this.newPigMessage.style.display = 'none';

        this.showScreen('gameover');
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

            if (isUnlocked) {
                badge.innerHTML = `
                    <img class="badge-image" src="${pig.image}" alt="${pig.name}" draggable="false">
                    <div class="badge-name">${pig.name}</div>
                `;
            } else {
                badge.innerHTML = `
                    <div class="badge-icon">?</div>
                    <div class="badge-name">???</div>
                `;
            }

            this.badgeGrid.appendChild(badge);
        });

        this.collectionProgress.textContent = `${this.unlockedPigs.size}/17`;
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
        this.soundButton.textContent = this.soundEnabled ? '🔊' : '🔇';
    }

    // ========== PERSISTENCE (LOCAL STORAGE) ==========

    // Save game data to local storage
    saveGame() {
        const data = {
            highScore: this.highScore,
            lives: this.lives,
            lastLifeLostTime: this.lastLifeLostTime,
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

                // Restore lives
                if (typeof data.lives === 'number') {
                    this.lives = Math.min(MAX_LIVES, Math.max(0, data.lives));
                }

                // Restore life regen timestamp
                if (data.lastLifeLostTime) {
                    this.lastLifeLostTime = data.lastLifeLostTime;
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

    // ========== LIVES SYSTEM ==========

    // Update the lives display on home screen
    updateLivesDisplay() {
        const icons = this.homeLivesDisplay.querySelectorAll('.life-icon');
        icons.forEach((icon, index) => {
            if (index < this.lives) {
                icon.classList.remove('empty');
            } else {
                icon.classList.add('empty');
            }
        });
    }

    // Lose a life
    loseLife() {
        if (this.lives > 0) {
            this.lives--;
            // Start regen timer if we just lost a life and aren't at max
            if (this.lives < MAX_LIVES && !this.lastLifeLostTime) {
                this.lastLifeLostTime = Date.now();
            }
            this.updateLivesDisplay();
            this.saveGame();
        }
    }

    // Add a life (from purchase or regen)
    addLife(count = 1) {
        this.lives = Math.min(MAX_LIVES, this.lives + count);
        // If at max lives, clear the regen timer
        if (this.lives >= MAX_LIVES) {
            this.lastLifeLostTime = null;
        }
        this.updateLivesDisplay();
        this.saveGame();
    }

    // Check if life should regenerate
    checkLifeRegen() {
        if (this.lives >= MAX_LIVES) {
            this.lastLifeLostTime = null;
            return;
        }

        if (this.lastLifeLostTime) {
            const elapsed = Date.now() - this.lastLifeLostTime;
            if (elapsed >= LIFE_REGEN_TIME) {
                // Regenerate a life
                this.addLife(1);
                // Reset timer for next regen if still not at max
                if (this.lives < MAX_LIVES) {
                    this.lastLifeLostTime = Date.now();
                }
            }
        }
    }

    // Start the countdown timer display
    startCountdownTimer() {
        // Clear any existing interval
        if (this.lifeRegenInterval) {
            clearInterval(this.lifeRegenInterval);
        }

        this.updateCountdownDisplay();

        this.lifeRegenInterval = setInterval(() => {
            this.checkLifeRegen();
            this.updateCountdownDisplay();

            // If we've regained a life and are on nolives screen, go home
            if (this.lives > 0 && this.currentScreen === 'nolives') {
                this.showScreen('home');
            }
        }, 1000);
    }

    // Stop the countdown timer
    stopCountdownTimer() {
        if (this.lifeRegenInterval) {
            clearInterval(this.lifeRegenInterval);
            this.lifeRegenInterval = null;
        }
    }

    // Update the countdown display
    updateCountdownDisplay() {
        if (this.lives >= MAX_LIVES || !this.lastLifeLostTime) {
            this.nextLifeCountdown.textContent = '--:--:--';
            return;
        }

        const elapsed = Date.now() - this.lastLifeLostTime;
        const remaining = Math.max(0, LIFE_REGEN_TIME - elapsed);

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        this.nextLifeCountdown.textContent =
            `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Update purchase button visibility
    updatePurchaseButtons() {
        // Show "buy 1 life" if player has < 3 lives
        this.buyOneLifeBtn.style.display = this.lives < MAX_LIVES ? 'flex' : 'none';
        // Show "buy 3 lives" only if player has 0 lives
        this.buyThreeLivesBtn.style.display = this.lives === 0 ? 'flex' : 'none';
    }

    // Handle purchasing lives (placeholder - simulates purchase)
    purchaseLives(count) {
        // In a real app, this would trigger payment flow
        // For now, show a styled modal and add the lives
        this.pendingPurchaseCount = count;
        this.purchaseMessage.textContent = `You would purchase ${count} life${count > 1 ? 's' : ''} here!`;
        this.showOverlay('purchase');
    }

    // Confirm the purchase (called when OK is clicked on modal)
    confirmPurchase() {
        if (this.pendingPurchaseCount) {
            this.addLife(this.pendingPurchaseCount);
            this.pendingPurchaseCount = null;
        }
        this.hideOverlay('purchase');

        // If we now have lives, go to home screen
        if (this.lives > 0) {
            this.showScreen('home');
        } else {
            this.updatePurchaseButtons();
        }
    }

    // Show out of lives screen
    showNoLivesScreen() {
        // Start regeneration timer if not already running
        if (!this.lastLifeLostTime) {
            this.lastLifeLostTime = Date.now();
        }
        this.updatePurchaseButtons();
        this.startCountdownTimer();
        this.showScreen('nolives');
    }

    // Set up all event listeners
    setupEventListeners() {
        // Home screen buttons
        document.getElementById('play-button').addEventListener('click', () => {
            if (this.lives > 0) {
                this.startGame();
            } else {
                this.showNoLivesScreen();
            }
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
            // Restart costs a life
            this.loseLife();
            if (this.lives > 0) {
                this.startGame();
            } else {
                this.showNoLivesScreen();
            }
        });

        // Game over screen buttons
        document.getElementById('play-again-button').addEventListener('click', () => {
            if (this.lives > 0) {
                this.startGame();
            } else {
                this.showNoLivesScreen();
            }
        });

        document.getElementById('gameover-home-button').addEventListener('click', () => {
            this.showScreen('home');
        });

        // No lives screen buttons
        document.getElementById('buy-one-life').addEventListener('click', () => {
            this.purchaseLives(1);
        });

        document.getElementById('buy-three-lives').addEventListener('click', () => {
            this.purchaseLives(3);
        });

        document.getElementById('nolives-home-button').addEventListener('click', () => {
            this.stopCountdownTimer();
            this.showScreen('home');
        });

        // Purchase modal OK button
        document.getElementById('purchase-ok').addEventListener('click', () => {
            this.confirmPurchase();
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
                this.calculateDimensions();
                this.render();
            }
        });
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
