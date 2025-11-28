// Powers of Pig - Core Game Engine
// A 2048 clone with pig theming

// The 17 Pigs - mapping value to pig data
const PIGS = {
    2:      { tier: 1,  name: 'Pip',              color: '#FFE4E1' },
    4:      { tier: 2,  name: 'Sprout',           color: '#FFCCCB' },
    8:      { tier: 3,  name: 'Trotter',          color: '#FFB6B0' },
    16:     { tier: 4,  name: 'Hamlet',           color: '#FFA07A' },
    32:     { tier: 5,  name: 'Hog',              color: '#FF8C69' },
    64:     { tier: 6,  name: 'Sir Oinks',        color: '#FF7F50' },
    128:    { tier: 7,  name: 'Wiggleton',        color: '#FF6347' },
    256:    { tier: 8,  name: 'Baron von Bubble', color: '#FF4500' },
    512:    { tier: 9,  name: 'Sherlock Hams',    color: '#DC143C' },
    1024:   { tier: 10, name: 'Sir Loin',         color: '#C71585' },
    2048:   { tier: 11, name: 'Lord Porkington',  color: '#9932CC' },
    4096:   { tier: 12, name: 'Neil Hamstrong',   color: '#4169E1' },
    8192:   { tier: 13, name: 'Erik the Pink',    color: '#228B22' },
    16384:  { tier: 14, name: 'Gandalf the Ham',  color: '#6B8E23' },
    32768:  { tier: 15, name: 'His Royal Hogness', color: '#DAA520' },
    65536:  { tier: 16, name: 'The Cosmic Sow',   color: '#4B0082' },
    131072: { tier: 17, name: 'THE LION PIG',     color: null }
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

        // Cache DOM elements
        this.cacheElements();

        // Set up event listeners
        this.setupEventListeners();

        // Check for life regeneration
        this.checkLifeRegen();

        // Show home screen
        this.showScreen('home');

        // Update displays
        this.updateHighScoreDisplay();
        this.updateLivesDisplay();
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
        if (screenName === 'game') {
            setTimeout(() => {
                this.calculateDimensions();
                this.render();
            }, 10);
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

    // Calculate tile size and gap based on container
    calculateDimensions() {
        const container = document.querySelector('.board-container');
        if (!container) return;

        const containerStyle = getComputedStyle(container);
        const padding = parseFloat(containerStyle.padding) || 12;
        const containerSize = container.clientWidth - (padding * 2);

        this.gap = window.innerWidth <= 520 ? 8 : 12;
        this.tileSize = (containerSize - (this.gap * 3)) / 4;
    }

    // Start a new game
    startGame() {
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

        return true;
    }

    // Unlock a pig (add to collection)
    unlockPig(value) {
        if (PIGS[value] && !this.unlockedPigs.has(value)) {
            this.unlockedPigs.add(value);
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

        const left = tile.col * (this.tileSize + this.gap);
        const top = tile.row * (this.tileSize + this.gap);

        element.style.width = `${this.tileSize}px`;
        element.style.height = `${this.tileSize}px`;
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;

        if (pig.color) {
            element.style.backgroundColor = pig.color;
        }

        element.textContent = pig.name;
        this.tileContainer.appendChild(element);
    }

    // Move tiles in a direction
    move(direction) {
        if (this.gameOver || this.currentScreen !== 'game') return;

        // Save state before move (for undo)
        this.saveState();

        let moved = false;

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
                        moved = this.moveTile(row, col, 0, -1) || moved;
                    }
                }
            }
        } else if (direction === 'right') {
            for (let row = 0; row < this.size; row++) {
                for (let col = this.size - 2; col >= 0; col--) {
                    if (this.grid[row][col]) {
                        moved = this.moveTile(row, col, 0, 1) || moved;
                    }
                }
            }
        } else if (direction === 'up') {
            for (let col = 0; col < this.size; col++) {
                for (let row = 1; row < this.size; row++) {
                    if (this.grid[row][col]) {
                        moved = this.moveTile(row, col, -1, 0) || moved;
                    }
                }
            }
        } else if (direction === 'down') {
            for (let col = 0; col < this.size; col++) {
                for (let row = this.size - 2; row >= 0; row--) {
                    if (this.grid[row][col]) {
                        moved = this.moveTile(row, col, 1, 0) || moved;
                    }
                }
            }
        }

        if (moved) {
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
    moveTile(row, col, rowDir, colDir) {
        const tile = this.grid[row][col];
        if (!tile) return false;

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
            } else {
                tile.row = newRow;
                tile.col = newCol;
                this.grid[newRow][newCol] = tile;
            }

            return true;
        }

        return false;
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
        }
    }

    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }

    // Show game over screen
    showGameOverScreen() {
        // Lose a life on game over
        this.loseLife();

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

            badge.innerHTML = `
                <div class="badge-icon">${isUnlocked ? '🐷' : '?'}</div>
                <div class="badge-name">${isUnlocked ? pig.name : '???'}</div>
            `;

            this.badgeGrid.appendChild(badge);
        });

        this.collectionProgress.textContent = `${this.unlockedPigs.size}/17`;
    }

    // Toggle sound
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundButton.textContent = this.soundEnabled ? '🔊' : '🔇';
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
