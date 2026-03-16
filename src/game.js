// Powers of Pig - Core Game Engine
// A 2048 clone with pig theming

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

        // Campaign mode state
        this.campaignMode = false;
        this.currentLevel = null;

        // Daily challenge state
        this.dailyMode = false;
        this.currentWorldId = 1;
        this.levelMoves = 0;
        this.levelMerges = 0;
        this.levelStartTime = null;
        this.usedUndo = false;
        this.tierReachedCount = {}; // Track how many times each tier was reached (for reach_tier_count goal)
        this.campaignProgress = {
            completedLevels: {},
            currentLevel: 1
        };

        // Timer state (for time_limit modifier)
        this.timerInterval = null;
        this.timeRemaining = null;
        this.moveLimit = null; // for move_limit modifier

        // World 2 modifiers
        this.blockedCells = new Set(); // for blocked_cells modifier (stores "row,col" strings)
        this.singleCellMovement = false; // for single_cell_movement modifier

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
            collection: document.getElementById('collection-screen'),
            'world-select': document.getElementById('world-select-screen'),
            'level-select': document.getElementById('level-select-screen')
        };

        // Overlays
        this.overlays = {
            pause: document.getElementById('pause-overlay'),
            restart: document.getElementById('restart-overlay'),
            feedback: document.getElementById('feedback-overlay'),
            'view-board': document.getElementById('view-board-overlay'),
            'level-complete': document.getElementById('level-complete-overlay'),
            'level-failed': document.getElementById('level-failed-overlay'),
            'world-intro': document.getElementById('world-intro-overlay'),
            'level-intro': document.getElementById('level-intro-overlay'),
            'daily-complete': document.getElementById('daily-complete-overlay')
        };

        // Feedback modal elements
        this.feedbackSendToInput = document.getElementById('feedback-send-to');
        this.feedbackImproveTextarea = document.getElementById('feedback-improve');
        this.feedbackSubmitBtn = document.getElementById('feedback-submit');
        this.feedbackSkipBtn = document.getElementById('feedback-skip');

        // Game elements
        this.boardContainer = document.querySelector('.board-container');
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

        // Campaign elements
        this.worldGrid = document.getElementById('world-grid');
        this.levelGrid = document.getElementById('level-grid');
        this.levelSelectWorldName = document.getElementById('level-select-world-name');

        // World intro modal elements
        this.worldIntroName = document.getElementById('world-intro-name');
        this.worldIntroDescription = document.getElementById('world-intro-description');

        this.campaignHeader = document.getElementById('campaign-header');
        this.campaignLevelNumber = document.getElementById('campaign-level-number');
        this.campaignLevelName = document.getElementById('campaign-level-name');
        this.campaignGoal = document.getElementById('campaign-goal');
        this.campaignStats = document.getElementById('campaign-stats');
        this.campaignMovesElement = document.getElementById('campaign-moves');
        this.campaignMergesElement = document.getElementById('campaign-merges');
        this.campaignStatMerges = document.getElementById('campaign-stat-merges');
        this.campaignTimerElement = document.getElementById('campaign-timer');
        this.campaignStatTimer = document.getElementById('campaign-stat-timer');
        this.endlessButton = document.getElementById('endless-button');

        // Level complete overlay elements
        this.levelCompleteAchievement = document.getElementById('level-complete-achievement');
        this.levelCompleteScoreValue = document.getElementById('level-complete-score-value');
        this.pigUnlockSection = document.getElementById('pig-unlock-section');
        this.pigUnlockImage = document.getElementById('pig-unlock-image');
        this.pigUnlockName = document.getElementById('pig-unlock-name');
        this.pigUnlockQuote = document.getElementById('pig-unlock-quote');

        // Emoji feedback elements
        this.emojiFeedback = document.getElementById('emoji-feedback');
        this.emojiFeedbackThanks = document.getElementById('emoji-feedback-thanks');
        this.emojiFeedbackButtons = document.querySelectorAll('.emoji-btn');

        // Level failed overlay elements
        this.levelFailedProgress = document.getElementById('level-failed-progress');
        this.levelFailedTip = document.getElementById('level-failed-tip');

        // Level intro overlay elements
        this.levelIntroNumber = document.getElementById('level-intro-number');
        this.levelIntroName = document.getElementById('level-intro-name');
        this.levelIntroGoal = document.getElementById('level-intro-goal');
        this.levelIntroModifiers = document.getElementById('level-intro-modifiers');
        this.levelIntroStartButton = document.getElementById('level-intro-start-button');

        // Daily challenge elements
        this.dailyButton = document.getElementById('daily-button');
        this.homeStreakBadge = document.getElementById('home-streak-badge');
        this.dailyStreakCount = document.getElementById('daily-streak-count');
        this.dailyFinalScore = document.getElementById('daily-final-score');
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

        // Update daily badge on home screen
        if (screenName === 'home') {
            this.updateDailyBadge();
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
        const expectedCells = this.size * this.size;
        if (cells.length !== expectedCells) {
            console.error(`Expected ${expectedCells} cells, found`, cells.length);
            return null;
        }

        // tile-container is inset from board-container by this padding
        // so cell positions need this subtracted
        const boardStyle = getComputedStyle(this.gridBackground.parentElement);
        const paddingLeft = parseFloat(boardStyle.paddingLeft) || 0;
        const paddingTop = parseFloat(boardStyle.paddingTop) || 0;

        const positions = [];

        for (let row = 0; row < this.size; row++) {
            positions[row] = [];
            for (let col = 0; col < this.size; col++) {
                const cellIndex = row * this.size + col;
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

    // Start a new game (endless mode)
    startGame() {
        // Initialize sound on first user interaction
        soundSystem.init();
        soundSystem.setEnabled(this.soundEnabled);
        // Haptics are always on, independent of sound toggle

        // Ensure campaign/daily mode is off for endless
        this.campaignMode = false;
        this.dailyMode = false;
        this.currentLevel = null;

        // Reset to standard 4x4 grid for endless mode
        this.size = 4;
        this.boardContainer.setAttribute('data-size', '4');

        // Clear World 2 modifiers for endless mode
        this.blockedCells.clear();
        this.singleCellMovement = false;

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

        // Hide campaign UI elements
        this.updateCampaignUI();

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

    // Start daily challenge
    startDailyChallenge() {
        // Check if already completed today
        if (hasCompletedToday()) {
            // Show "already played" message
            const strings = getStrings();
            alert(strings.daily.alreadyPlayed);
            return;
        }

        // Initialize sound on first user interaction
        soundSystem.init();
        soundSystem.setEnabled(this.soundEnabled);

        // Set daily mode
        this.dailyMode = true;
        this.campaignMode = false;
        this.currentLevel = generateDailyLevel();

        // Reset to standard 4x4 grid
        this.size = 4;
        this.boardContainer.setAttribute('data-size', '4');

        // Apply daily modifiers
        this.blockedCells.clear();
        this.singleCellMovement = false;
        this.timeRemaining = null;
        this.moveLimit = null;

        if (this.currentLevel.modifiers && this.currentLevel.modifiers.length > 0) {
            for (const mod of this.currentLevel.modifiers) {
                if (mod.type === 'time_limit') {
                    this.timeRemaining = mod.seconds;
                }
                if (mod.type === 'move_limit') {
                    this.moveLimit = mod.moves;
                }
                if (mod.type === 'blocked_cells' && mod.positions) {
                    mod.positions.forEach(([row, col]) => {
                        this.blockedCells.add(`${row},${col}`);
                    });
                }
                if (mod.type === 'single_cell_movement') {
                    this.singleCellMovement = true;
                }
            }
        }

        // Reset game state
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.keepPlaying = false;
        this.previousState = null;
        this.gameStartTime = Date.now();
        this.moveCount = 0;
        this.levelMoves = 0;

        // Clear any active timers
        this.clearInactivityTimer();
        this.stopLevelTimer();

        // Clear tile elements for fresh start
        this.tileContainer.innerHTML = '';
        this.tileElements.clear();
        this.cellPositions = null;

        this.createBackgroundCells();

        // Initialize grid
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.tutorialActive = false;
        this.spawnTile();
        this.spawnTile();

        // Track daily start
        const dailyModifier = this.currentLevel.modifiers.length > 0 ? this.currentLevel.modifiers[0].type : null;
        Analytics.track('daily_start', {
            modifier: dailyModifier || 'none',
            seed: this.currentLevel.seed
        });
        Tracking.dailyStart(dailyModifier);

        // Start timer if time limit modifier
        if (this.timeRemaining !== null) {
            this.startLevelTimer();
        }

        // Update UI and show game
        this.updateScore();
        this.updateCampaignUI();
        this.showScreen('game');
    }

    // Show daily complete overlay
    showDailyComplete() {
        const progress = recordDailyComplete(this.score);
        const strings = getStrings();

        // Update overlay content
        this.dailyStreakCount.textContent = progress.streak;
        this.dailyFinalScore.textContent = formatNumber(this.score);

        // Track analytics
        Analytics.track('daily_complete', {
            score: this.score,
            streak: progress.streak,
            moves: this.moveCount
        });
        Tracking.dailyComplete(this.score, progress.streak);

        this.showOverlay('daily-complete');
    }

    // Update daily button badge on home screen
    updateDailyBadge() {
        const streak = getCurrentStreak();
        if (streak > 0) {
            this.homeStreakBadge.textContent = `🔥${streak}`;
            this.homeStreakBadge.style.display = 'inline';
        } else {
            this.homeStreakBadge.style.display = 'none';
        }
    }

    // Create the empty cell backgrounds
    createBackgroundCells() {
        this.gridBackground.innerHTML = '';
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                // Add blocked class for World 2 blocked_cells modifier
                if (this.isBlockedCell(row, col)) {
                    cell.classList.add('blocked');
                }

                this.gridBackground.appendChild(cell);
            }
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

        // Track undo usage for campaign analytics
        if (this.campaignMode) {
            this.usedUndo = true;
        }

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

    // Helper method to check if a cell is blocked (World 2 modifier)
    isBlockedCell(row, col) {
        return this.blockedCells.has(`${row},${col}`);
    }

    // Spawn a new tile in a random empty position
    spawnTile() {
        const emptyCells = [];

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                // Skip blocked cells (World 2 modifier)
                if (this.grid[row][col] === null && !this.isBlockedCell(row, col)) {
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

    // Show confetti when completing a world (full-screen)
    showWorldCompleteConfetti() {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container world-complete-confetti';
        document.body.appendChild(confettiContainer);

        // Create 30 confetti pieces (more than first merge)
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            // Random colors
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];

            // Random position and animation delay
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 1 + 1.5) + 's';

            confettiContainer.appendChild(confetti);
        }

        // Remove after animation
        setTimeout(() => {
            confettiContainer.remove();
        }, 3000);
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

        // Campaign mode: increment level move counter and track merges
        if (this.campaignMode) {
            this.levelMoves++;
            if (highestMergeTier > 0) {
                this.levelMerges++;
                // Track tier reached count for reach_tier_count goal
                if (!this.tierReachedCount[highestMergeTier]) {
                    this.tierReachedCount[highestMergeTier] = 0;
                }
                this.tierReachedCount[highestMergeTier]++;
            }
            // Update campaign stats UI
            if (this.moveLimit !== null) {
                this.campaignMovesElement.textContent = `${this.levelMoves}/${this.moveLimit}`;
            } else {
                this.campaignMovesElement.textContent = this.levelMoves;
            }
            this.campaignMergesElement.textContent = this.levelMerges;

            // Check if move limit exceeded
            if (this.moveLimit !== null && this.levelMoves >= this.moveLimit) {
                // Exceeded move limit - will check for goal after spawning
                // If goal not met, fail the level
            }
        }

        // Play sound/haptic for highest tier merge only (if any merges occurred)
        if (highestMergeTier > 0) {
            soundSystem.playOink(highestMergeTier);
            hapticsSystem.vibrateForTier(highestMergeTier);

            // First merge celebration (only once ever, not in campaign)
            if (!this.campaignMode && !this.isFirstMergeCelebrated()) {
                this.showFirstMergeCelebration();
            }
        }

        // Advance tutorial if active
        if (this.tutorialActive) {
            this.advanceTutorial();
        }

        this.spawnTile();
        this.render();

        // Campaign mode: check for level goal completion
        if (this.campaignMode && this.checkLevelGoal()) {
            this.gameOver = true;
            setTimeout(() => this.completeCampaignLevel(), 300);
            this.isAnimating = false;
            return;
        }

        // Campaign mode: check for move limit exceeded (after goal check)
        if (this.campaignMode && this.moveLimit !== null && this.levelMoves >= this.moveLimit) {
            // Move limit reached and goal not met - fail
            this.gameOver = true;
            setTimeout(() => this.failCampaignLevel('move_limit'), 300);
            this.isAnimating = false;
            return;
        }

        // Check for win (only show once, only in endless mode)
        if (!this.campaignMode && !this.won && this.checkWin()) {
            this.won = true;
            this.unlockPig(this.winValue);
            this.updateHighScore();
            setTimeout(() => this.showWinScreen(), 300);
        }
        // Check for game over
        else if (this.checkGameOver()) {
            this.gameOver = true;

            if (this.campaignMode) {
                // Campaign mode: show failure screen
                setTimeout(() => this.failCampaignLevel(), 300);
            } else if (this.dailyMode) {
                // Daily challenge: show daily complete overlay
                this.updateHighScore();
                setTimeout(() => this.showDailyComplete(), 300);
            } else {
                // Endless mode: show game over screen
                this.updateHighScore();

                // If still in tutorial, mark it complete
                if (this.tutorialActive) {
                    this.completeTutorial();
                }

                setTimeout(() => this.showGameOverScreen(), 300);
            }
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

            // Check for empty cell (and not blocked)
            if (nextTile === null && !this.isBlockedCell(nextRow, nextCol)) {
                newRow = nextRow;
                newCol = nextCol;

                // World 2 modifier: single_cell_movement (only move 1 cell per swipe)
                if (this.singleCellMovement) {
                    break;
                }
            } else if (nextTile && nextTile.value === tile.value && !nextTile.merged) {
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
        // Check for empty cells (skip blocked cells)
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (!this.isBlockedCell(row, col) && this.grid[row][col] === null) {
                    return false;
                }
            }
        }

        // Check for adjacent matching tiles (skip blocked cells)
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                // Skip blocked cells
                if (this.isBlockedCell(row, col)) continue;

                const tile = this.grid[row][col];
                if (tile) {
                    // Check right neighbor (skip if it's blocked)
                    if (col < this.size - 1 && !this.isBlockedCell(row, col + 1) &&
                        this.grid[row][col + 1] && this.grid[row][col + 1].value === tile.value) {
                        return false;
                    }
                    // Check bottom neighbor (skip if it's blocked)
                    if (row < this.size - 1 && !this.isBlockedCell(row + 1, col) &&
                        this.grid[row + 1][col] && this.grid[row + 1][col].value === tile.value) {
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
        if (this.highScoreElement) {
            this.highScoreElement.textContent = this.highScore;
        }
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
        this.feedbackContext = Feedback.showModal({
            sendToInput: this.feedbackSendToInput,
            improveTextarea: this.feedbackImproveTextarea,
            showOverlay: this.showOverlay.bind(this)
        }, context);
    }

    // Handle feedback submission
    async submitFeedback() {
        // Get game data
        const highestValue = this.getHighestPig();
        const pig = getPig(highestValue);
        const deviceType = this.getDeviceType();

        const gameState = {
            score: this.score,
            moves: this.moveCount,
            duration: this.lastGameDuration || 0,
            highestTier: pig.tier,
            deviceType: deviceType
        };

        const inputs = {
            sendToText: this.feedbackSendToInput.value,
            improvementText: this.feedbackImproveTextarea.value
        };

        await Feedback.submit(gameState, inputs, this.feedbackContext);
        this.closeFeedbackModal();
    }

    // Skip feedback
    skipFeedback() {
        Feedback.skip(this.feedbackContext);
        this.closeFeedbackModal();
    }

    // Close feedback modal
    closeFeedbackModal() {
        const context = this.feedbackContext;
        this.feedbackContext = null;

        Feedback.closeModal({
            hideOverlay: this.hideOverlay.bind(this),
            showScreen: this.showScreen.bind(this),
            trackGameOverScreen: () => {
                const highestValue = this.capturedBoardState ? this.capturedBoardState.highestValue : this.getHighestPig();
                const pig = getPig(highestValue);
                Analytics.track('game_over_screen_viewed', {
                    highest_tier: pig.tier,
                    score: this.score
                });
            }
        }, context);
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
        if (context === 'daily') {
            const streak = getCurrentStreak();
            shareMessage = getDailyShareMessage(scoreToShare, streak);
        } else if (context === 'gameOver') {
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
        const buttons = document.querySelectorAll('.lang-toggle');
        buttons.forEach(btn => {
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

    // ========== CAMPAIGN MODE METHODS ==========

    // Show campaign (go to world select screen)
    showCampaign() {
        this.showWorldSelect();
    }

    // Show world select screen
    showWorldSelect() {
        this.renderWorldSelect();
        this.showScreen('world-select');
    }

    // Render world select buttons
    renderWorldSelect() {
        const strings = getStrings();
        const lang = getCurrentLanguage();

        // Get world grid container
        const worldGrid = document.getElementById('world-grid');
        if (!worldGrid) return;

        worldGrid.innerHTML = '';

        for (const world of WORLDS) {
            const isUnlocked = isWorldUnlocked(world.id, this.campaignProgress);

            const button = document.createElement('button');
            button.className = `world-button ${isUnlocked ? '' : 'locked'}`;

            if (isUnlocked) {
                button.innerHTML = `
                    <div class="world-number">${world.id}</div>
                    <div class="world-name">${world.name[lang] || world.name.en}</div>
                `;
                button.addEventListener('click', () => {
                    this.showLevelSelect(world.id);
                });
            } else {
                const unlockKey = `completeWorld${world.id - 1}`;
                const unlockText = strings.campaign[unlockKey] || (console.warn(`Missing string: campaign.${unlockKey}`), strings.campaign.completeWorld1);
                button.innerHTML = `
                    <div class="world-lock-icon">🔒</div>
                    <div class="world-name">${world.name[lang] || world.name.en}</div>
                    <div class="world-locked-message">${unlockText}</div>
                `;
            }

            worldGrid.appendChild(button);
        }
    }

    // Show level select screen for a specific world
    showLevelSelect(worldId) {
        this.currentWorldId = worldId;
        this.renderLevelSelect(worldId);
        this.showScreen('level-select');
    }

    // Render level select buttons for a world
    renderLevelSelect(worldId) {
        const strings = getStrings();
        const lang = getCurrentLanguage();
        const world = getWorldById(worldId);
        const levels = getLevelsForWorld(worldId);
        const completedCount = getCompletedLevelCount(this.campaignProgress);

        // Update header
        this.levelSelectWorldName.textContent = world.name[lang] || world.name.en;

        this.levelGrid.innerHTML = '';

        for (const level of levels) {
            const isUnlocked = isLevelUnlocked(level.id, this.campaignProgress);
            const completion = this.campaignProgress.completedLevels[level.id];

            const button = document.createElement('button');
            button.className = `level-button ${isUnlocked ? '' : 'locked'} ${completion ? 'completed' : ''}`;

            if (isUnlocked) {
                button.innerHTML = `
                    <div class="level-number">${level.id}</div>
                    ${completion ? '<div class="level-checkmark">✓</div>' : ''}
                `;
                button.addEventListener('click', () => {
                    this.startCampaignLevel(level.id);
                });
            } else {
                button.innerHTML = `
                    <div class="level-lock-icon">🔒</div>
                `;
            }

            this.levelGrid.appendChild(button);
        }
    }

    // Show world introduction modal before starting level 1
    showWorldIntroduction(worldId, onStart) {
        const world = getWorldById(worldId);
        if (!world) return;

        const strings = getStrings();
        const lang = getCurrentLanguage();

        // Populate modal content
        this.worldIntroName.textContent = world.name[lang] || world.name.en;
        this.worldIntroDescription.textContent = world.description[lang] || world.description.en;

        // Show overlay
        this.showOverlay('world-intro');

        // Store callback for when user clicks "Let's Go!"
        this.worldIntroCallback = onStart;
    }

    // Start a campaign level
    startCampaignLevel(levelId) {
        const level = getLevelById(levelId);
        if (!level) return;

        // Check if this is the first level of a world (show world intro first)
        const worldLevels = getLevelsForWorld(level.world);
        const isFirstLevel = worldLevels.length > 0 && levelId === worldLevels[0].id;

        if (isFirstLevel) {
            // Show world introduction first, then level intro
            this.showWorldIntroduction(level.world, () => {
                this.hideOverlay('world-intro');
                this.showLevelIntroduction(levelId);
            });
        } else {
            // Show level introduction
            this.showLevelIntroduction(levelId);
        }
    }

    // Show level introduction modal
    showLevelIntroduction(levelId) {
        const level = getLevelById(levelId);
        if (!level) return;

        const lang = getCurrentLanguage();
        const strings = getStrings();

        // Populate level intro modal
        this.levelIntroNumber.textContent = `${strings.campaign.level} ${level.id}`;
        this.levelIntroName.textContent = level.name[lang] || level.name.en;
        this.levelIntroGoal.textContent = level.goal.description[lang] || level.goal.description.en;

        // Show modifiers if any
        if (level.modifiers && level.modifiers.length > 0) {
            const modifierTexts = level.modifiers.map(mod => {
                if (mod.type === 'time_limit') {
                    const minutes = Math.floor(mod.seconds / 60);
                    const seconds = mod.seconds % 60;
                    const timeStr = seconds > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${minutes} min`;
                    return `⏱️ ${timeStr}`;
                } else if (mod.type === 'move_limit') {
                    return `📊 ${mod.moves} ${strings.campaign.moves}`;
                } else if (mod.type === 'small_board') {
                    return `📐 ${mod.size}x${mod.size}`;
                } else if (mod.type === 'blocked_cells') {
                    return `🚫 ${strings.daily.modifier.blocked_cells}`;
                } else if (mod.type === 'single_cell_movement') {
                    return `🐢 ${strings.daily.modifier.single_cell_movement}`;
                }
                return '';
            }).filter(Boolean);
            this.levelIntroModifiers.textContent = modifierTexts.join(' • ');
        } else {
            this.levelIntroModifiers.textContent = '';
        }

        // Store the pending level ID for the start button
        this.pendingLevelId = levelId;

        this.showOverlay('level-intro');
    }

    // Actually start a campaign level (renamed from startCampaignLevel)
    actuallyStartCampaignLevel(levelId) {
        const level = getLevelById(levelId);
        if (!level) return;

        this.campaignMode = true;
        this.currentLevel = level;
        this.currentWorldId = level.world;
        this.levelMoves = 0;
        this.levelMerges = 0;
        this.levelStartTime = Date.now();
        this.usedUndo = false;
        this.tierReachedCount = {};

        // Clear any previous level timer
        this.stopLevelTimer();

        // Check for modifiers
        this.timeRemaining = null;
        this.moveLimit = null;
        this.size = 4; // Default size
        this.blockedCells.clear(); // Reset World 2 modifiers
        this.singleCellMovement = false;

        if (level.modifiers && level.modifiers.length > 0) {
            for (const mod of level.modifiers) {
                if (mod.type === 'time_limit') {
                    this.timeRemaining = mod.seconds;
                }
                if (mod.type === 'move_limit') {
                    this.moveLimit = mod.moves;
                }
                if (mod.type === 'small_board') {
                    this.size = mod.size || 3;
                }
                if (mod.type === 'blocked_cells') {
                    // Store blocked cells as "row,col" strings for O(1) lookup
                    for (const pos of mod.positions) {
                        this.blockedCells.add(`${pos[0]},${pos[1]}`);
                    }
                }
                if (mod.type === 'single_cell_movement') {
                    this.singleCellMovement = true;
                }
            }
        }

        // Initialize sound on first user interaction
        soundSystem.init();
        soundSystem.setEnabled(this.soundEnabled);

        // Reset game state
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.keepPlaying = false;
        this.previousState = null;
        this.moveCount = 0;

        // Clear any active timers
        this.clearInactivityTimer();

        // Clear tile elements for fresh start
        this.tileContainer.innerHTML = '';
        this.tileElements.clear();
        this.cellPositions = null;

        // Update board container for different grid sizes
        this.boardContainer.setAttribute('data-size', this.size);

        this.createBackgroundCells();

        // Standard grid setup (no tutorial in campaign)
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.tutorialActive = false;
        this.spawnTile();
        this.spawnTile();

        // Show campaign UI elements
        this.updateCampaignUI();

        // Start timer if time limit modifier is active
        if (this.timeRemaining !== null) {
            this.startLevelTimer();
        }

        // Track level start
        Analytics.track('campaign_level_start', {
            level_id: level.id,
            level_name: level.name.en,
            world: level.world
        });

        this.updateScore();
        this.showScreen('game');
    }

    // Update campaign-specific UI elements
    updateCampaignUI() {
        const strings = getStrings();
        const lang = getCurrentLanguage();

        if (this.campaignMode && this.currentLevel) {
            // Show campaign header
            this.campaignHeader.classList.add('visible');
            this.campaignStats.classList.add('visible');

            // Update level info
            this.campaignLevelNumber.textContent = `${strings.campaign.level} ${this.currentLevel.id}`;
            this.campaignLevelName.textContent = this.currentLevel.name[lang] || this.currentLevel.name.en;
            this.campaignGoal.textContent = this.currentLevel.goal.description[lang] || this.currentLevel.goal.description.en;

            // Update move display - show limit if move_limit modifier active
            if (this.moveLimit !== null) {
                this.campaignMovesElement.textContent = `${this.levelMoves}/${this.moveLimit}`;
            } else {
                this.campaignMovesElement.textContent = this.levelMoves;
            }
            this.campaignMergesElement.textContent = this.levelMerges;

            // Show merges counter for merge_count goals
            if (this.currentLevel.goal.type === 'merge_count') {
                this.campaignStatMerges.classList.add('visible');
            } else {
                this.campaignStatMerges.classList.remove('visible');
            }

            // Show/hide timer based on time_limit modifier
            if (this.timeRemaining !== null) {
                this.campaignStatTimer.classList.add('visible');
                this.updateTimerDisplay();
            } else {
                this.campaignStatTimer.classList.remove('visible');
            }
        } else {
            // Hide campaign header for endless mode
            this.campaignHeader.classList.remove('visible');
            this.campaignStats.classList.remove('visible');
        }
    }

    // Start the level timer (for time_limit modifier)
    startLevelTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                this.stopLevelTimer();
                if (!this.gameOver) {
                    this.gameOver = true;
                    this.failCampaignLevel('time_out');
                }
            }
        }, 1000);
    }

    // Stop the level timer
    stopLevelTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Update timer display
    updateTimerDisplay() {
        if (this.timeRemaining !== null) {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            this.campaignTimerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            // Add warning class when time is low
            if (this.timeRemaining <= 10) {
                this.campaignStatTimer.classList.add('warning');
            } else {
                this.campaignStatTimer.classList.remove('warning');
            }
        }
    }

    // Check if the current level goal is met (called after each move)
    checkLevelGoal() {
        if (!this.campaignMode || !this.currentLevel) return false;

        const goal = this.currentLevel.goal;

        switch (goal.type) {
            case 'reach_tier': {
                const targetValue = getTierValue(goal.value);
                for (let row = 0; row < this.size; row++) {
                    for (let col = 0; col < this.size; col++) {
                        if (this.grid[row][col] && this.grid[row][col].value >= targetValue) {
                            return true;
                        }
                    }
                }
                return false;
            }

            case 'reach_tier_count': {
                const targetValue = getTierValue(goal.value);
                const count = this.tierReachedCount[goal.value] || 0;
                return count >= goal.count;
            }

            case 'reach_score': {
                return this.score >= goal.value;
            }

            case 'merge_count': {
                return this.levelMerges >= goal.value;
            }

            case 'clear_tier': {
                const targetValue = getTierValue(goal.value);
                for (let row = 0; row < this.size; row++) {
                    for (let col = 0; col < this.size; col++) {
                        if (this.grid[row][col] && this.grid[row][col].value === targetValue) {
                            return false; // Still has tiles of this tier
                        }
                    }
                }
                // Make sure we've played at least a few moves (can't win immediately)
                return this.levelMoves > 0;
            }

            default:
                return false;
        }
    }

    // Complete the current campaign level
    completeCampaignLevel() {
        // Stop any active timer
        this.stopLevelTimer();

        const level = this.currentLevel;
        const lang = getCurrentLanguage();
        const strings = getStrings();
        const timeSeconds = Math.floor((Date.now() - this.levelStartTime) / 1000);

        // Save progress (only if not already completed, or if better score)
        const prevCompletion = this.campaignProgress.completedLevels[level.id];
        if (!prevCompletion || this.score > prevCompletion.bestScore) {
            this.campaignProgress.completedLevels[level.id] = {
                completed: true,
                bestMoves: this.levelMoves,
                bestScore: this.score,
                bestTime: timeSeconds
            };
            this.saveCampaignProgress();
        }

        // Track completion
        Analytics.track('level_completed', {
            level_id: level.id,
            level_name: level.name.en,
            time_seconds: timeSeconds,
            moves: this.levelMoves,
            modifier: getLevelModifierType(level)
        });
        Tracking.levelComplete(level.id, level.world);

        // Update achievement text (goal description)
        const goalDescription = level.goal.description[lang] || level.goal.description.en;
        this.levelCompleteAchievement.textContent = goalDescription;

        // Update score display
        this.levelCompleteScoreValue.textContent = formatNumber(this.score);

        // Handle pig unlock
        if (level.unlocksPig) {
            const pigValue = getTierValue(level.unlocksPig);
            const isNewUnlock = this.unlockPig(pigValue);

            if (isNewUnlock) {
                const pig = getPig(pigValue);
                const quote = PIG_UNLOCK_QUOTES[level.unlocksPig];

                this.pigUnlockImage.src = pig.image;
                this.pigUnlockName.textContent = strings.pigs[pig.tier] || pig.name;
                this.pigUnlockQuote.textContent = quote[lang] || quote.en;
                this.pigUnlockSection.classList.add('visible');
            } else {
                this.pigUnlockSection.classList.remove('visible');
            }
        } else {
            this.pigUnlockSection.classList.remove('visible');
        }

        // Update "Next Level" button text and visibility
        const nextLevelButton = document.getElementById('next-level-button');
        const nextLevelId = level.id + 1;
        const nextLevel = getLevelById(nextLevelId);

        if (nextLevel && nextLevel.world === level.world && isLevelUnlocked(nextLevelId, this.campaignProgress)) {
            // Next level in same world
            nextLevelButton.style.display = 'block';
            nextLevelButton.setAttribute('data-i18n', 'campaign.next');
            nextLevelButton.textContent = strings.campaign.next; // "Next Level"
        } else {
            // Check if next world exists
            const nextWorldId = level.world + 1;
            if (getWorldById(nextWorldId) && isWorldUnlocked(nextWorldId, this.campaignProgress)) {
                // Next world unlocked!
                nextLevelButton.style.display = 'block';
                nextLevelButton.setAttribute('data-i18n', 'campaign.nextWorld');
                nextLevelButton.textContent = strings.campaign.nextWorld; // "Next World"
            } else {
                // No next world or not unlocked
                nextLevelButton.style.display = 'none';
            }
        }

        // Reset emoji feedback state
        this.resetEmojiFeedback();

        this.showOverlay('level-complete');
    }

    // Reset emoji feedback to initial state
    resetEmojiFeedback() {
        this.emojiFeedback.classList.remove('submitted');
        this.emojiFeedbackThanks.classList.remove('visible');
        this.emojiFeedbackButtons.forEach(btn => btn.classList.remove('selected'));
    }

    // Handle emoji feedback click
    handleEmojiFeedback(btn) {
        // Ignore if already submitted
        if (this.emojiFeedback.classList.contains('submitted')) return;

        const rating = parseInt(btn.dataset.rating);

        // Mark as selected and submitted
        this.emojiFeedbackButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.emojiFeedback.classList.add('submitted');
        this.emojiFeedbackThanks.classList.add('visible');

        // Track via PostHog
        Analytics.track('level_feedback', {
            level_id: this.currentLevel.id,
            level_name: this.currentLevel.name.en,
            rating: rating,
            rating_emoji: btn.textContent
        });
    }

    // Fail the current campaign level (show "So Close!" screen)
    failCampaignLevel(reason = 'no_moves') {
        // Stop any active timer
        this.stopLevelTimer();

        const level = this.currentLevel;
        const goal = level.goal;
        const lang = getCurrentLanguage();

        // Calculate progress for failure message
        const progressMessage = this.getFailureProgressMessage(goal, lang);
        const tip = this.getFailureTip(reason, lang);

        this.levelFailedProgress.textContent = progressMessage;
        this.levelFailedTip.textContent = tip;

        // Track failure
        Analytics.track('level_failed', {
            level_id: level.id,
            level_name: level.name.en,
            time_seconds: Math.floor((Date.now() - this.levelStartTime) / 1000),
            moves: this.levelMoves,
            modifier: getLevelModifierType(level),
            failure_reason: reason
        });
        Tracking.levelFail(level.id, level.world);

        this.showOverlay('level-failed');
    }

    // Get failure progress message based on goal type
    getFailureProgressMessage(goal, lang) {
        const messages = FAILURE_MESSAGES.progress;
        const strings = getStrings();

        switch (goal.type) {
            case 'reach_tier': {
                const highestValue = this.getHighestPig();
                const highestTier = getPig(highestValue).tier;
                const targetTier = goal.value;
                const remaining = targetTier - highestTier;
                const achievedName = strings.pigs[highestTier];
                const targetName = strings.pigs[targetTier];

                let msg = messages.reach_tier[lang] || messages.reach_tier.en;
                return msg.replace('{achieved}', achievedName)
                          .replace('{remaining}', remaining)
                          .replace('{target}', targetName);
            }

            case 'reach_tier_count': {
                const count = this.tierReachedCount[goal.value] || 0;
                const remaining = goal.count - count;
                const targetName = strings.pigs[goal.value];

                let msg = messages.reach_tier_count[lang] || messages.reach_tier_count.en;
                return msg.replace('{achieved}', count)
                          .replace('{target}', goal.count)
                          .replace('{remaining}', remaining);
            }

            case 'reach_score': {
                const remaining = goal.value - this.score;
                let msg = messages.reach_score[lang] || messages.reach_score.en;
                return msg.replace('{achieved}', formatNumber(this.score))
                          .replace('{remaining}', formatNumber(remaining));
            }

            case 'merge_count': {
                const remaining = goal.value - this.levelMerges;
                let msg = messages.merge_count[lang] || messages.merge_count.en;
                return msg.replace('{achieved}', this.levelMerges)
                          .replace('{remaining}', remaining);
            }

            case 'clear_tier': {
                const targetValue = getTierValue(goal.value);
                let count = 0;
                for (let row = 0; row < this.size; row++) {
                    for (let col = 0; col < this.size; col++) {
                        if (this.grid[row][col] && this.grid[row][col].value === targetValue) {
                            count++;
                        }
                    }
                }
                let msg = messages.clear_tier[lang] || messages.clear_tier.en;
                return msg.replace('{remaining}', count);
            }

            default:
                return '';
        }
    }

    // Get contextual failure tip
    getFailureTip(reason, lang) {
        const tips = FAILURE_MESSAGES.tips;

        // Use reason-specific tip if available
        if (reason === 'time_out' && tips.time_out) {
            return tips.time_out[lang] || tips.time_out.en;
        }

        if (reason === 'move_limit' && tips.move_limit) {
            return tips.move_limit[lang] || tips.move_limit.en;
        }

        // If they were close (got to high tier), encourage them
        const highestValue = this.getHighestPig();
        const highestTier = getPig(highestValue).tier;
        if (this.currentLevel.goal.type === 'reach_tier' && highestTier >= this.currentLevel.goal.value - 1) {
            return tips.close[lang] || tips.close.en;
        }

        // Default tip
        return tips.default[lang] || tips.default.en;
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

        // Save campaign progress separately
        this.saveCampaignProgress();
    }

    // Save campaign progress to local storage
    saveCampaignProgress() {
        try {
            localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(this.campaignProgress));
        } catch (e) {
            console.warn('Could not save campaign progress:', e);
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

        // Load campaign progress
        this.loadCampaignProgress();
    }

    // Load campaign progress from local storage
    loadCampaignProgress() {
        try {
            const saved = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.completedLevels) {
                    this.campaignProgress = data;
                }
            }
        } catch (e) {
            console.warn('Could not load campaign progress:', e);
        }

    }

    // Set up all event listeners
    setupEventListeners() {
        // Home screen buttons
        document.getElementById('campaign-button').addEventListener('click', () => {
            this.showCampaign();
        });

        this.endlessButton.addEventListener('click', () => {
            this.campaignMode = false;
            this.currentLevel = null;
            this.startGame();
        });

        document.getElementById('collection-button').addEventListener('click', () => {
            this.showScreen('collection');
        });

        // Daily challenge button
        this.dailyButton.addEventListener('click', () => {
            this.startDailyChallenge();
        });

        // Daily complete overlay buttons
        document.getElementById('daily-home-button').addEventListener('click', () => {
            this.hideOverlay('daily-complete');
            this.dailyMode = false;
            this.showScreen('home');
            this.updateDailyBadge();
        });

        document.getElementById('daily-share-button').addEventListener('click', () => {
            this.handleShare('daily');
        });

        // World select back button
        // World select back button (goes to home)
        document.getElementById('world-back-button').addEventListener('click', () => {
            this.showScreen('home');
        });

        // Level select back button (goes to world select)
        document.getElementById('level-back-button').addEventListener('click', () => {
            this.showWorldSelect();
        });

        // World intro "Let's Go!" button
        document.getElementById('world-intro-start-button').addEventListener('click', () => {
            if (this.worldIntroCallback) {
                this.worldIntroCallback();
                this.worldIntroCallback = null; // Clear callback
            }
        });

        // Level intro start button
        document.getElementById('level-intro-start-button').addEventListener('click', () => {
            this.hideOverlay('level-intro');
            if (this.pendingLevelId) {
                this.actuallyStartCampaignLevel(this.pendingLevelId);
                this.pendingLevelId = null;
            }
        });

        // Level complete overlay buttons
        document.getElementById('next-level-button').addEventListener('click', () => {
            this.hideOverlay('level-complete');
            const nextLevelId = this.currentLevel.id + 1;
            const nextLevel = getLevelById(nextLevelId);

            // Check if there's a next level in the current world
            if (nextLevel && nextLevel.world === this.currentWorldId && isLevelUnlocked(nextLevelId, this.campaignProgress)) {
                this.startCampaignLevel(nextLevelId);
            } else {
                // Check if next world exists and is unlocked
                const nextWorldId = this.currentWorldId + 1;
                const nextWorld = getWorldById(nextWorldId);

                if (nextWorld && isWorldUnlocked(nextWorldId, this.campaignProgress)) {
                    // Next world unlocked! Show confetti and go to it
                    this.showWorldCompleteConfetti();

                    // Start level 1 of next world after confetti
                    setTimeout(() => {
                        const nextWorldLevels = getLevelsForWorld(nextWorldId);
                        if (nextWorldLevels.length > 0) {
                            this.startCampaignLevel(nextWorldLevels[0].id);
                        }
                    }, 1500); // 1.5s delay for confetti
                } else {
                    // No next world or not unlocked - go back to level select
                    this.showLevelSelect(this.currentWorldId);
                }
            }
        });

        document.getElementById('retry-level-button').addEventListener('click', () => {
            this.hideOverlay('level-complete');
            this.startCampaignLevel(this.currentLevel.id);
        });

        document.getElementById('level-complete-home-button').addEventListener('click', () => {
            this.hideOverlay('level-complete');
            this.showLevelSelect(this.currentWorldId);
        });

        // Emoji feedback buttons
        this.emojiFeedbackButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleEmojiFeedback(btn));
        });

        // Level failed overlay buttons
        document.getElementById('retry-failed-button').addEventListener('click', () => {
            this.hideOverlay('level-failed');
            this.startCampaignLevel(this.currentLevel.id);
        });

        document.getElementById('level-failed-home-button').addEventListener('click', () => {
            this.hideOverlay('level-failed');
            this.showLevelSelect(this.currentWorldId);
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
            if (this.campaignMode) {
                this.showLevelSelect(this.currentWorldId);
            } else {
                this.showScreen('home');
            }
        });

        // Restart confirmation buttons
        document.getElementById('restart-cancel').addEventListener('click', () => {
            this.hideOverlay('restart');
        });

        document.getElementById('restart-confirm').addEventListener('click', () => {
            this.hideOverlay('restart');
            if (this.campaignMode && this.currentLevel) {
                this.startCampaignLevel(this.currentLevel.id);
            } else {
                this.startGame();
            }
        });

        // Game over screen buttons (endless mode only)
        document.getElementById('play-again-button').addEventListener('click', () => {
            if (this.campaignMode && this.currentLevel) {
                this.startCampaignLevel(this.currentLevel.id);
            } else {
                this.startGame();
            }
        });

        document.getElementById('gameover-home-button').addEventListener('click', () => {
            if (this.campaignMode) {
                this.showLevelSelect(this.currentWorldId);
            } else {
                this.showScreen('home');
            }
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
    Tracking.sessionStart();
    new Game();
});

// Export for Node/test compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game };
}
