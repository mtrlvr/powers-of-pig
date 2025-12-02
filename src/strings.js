// ========== CENTRALIZED UI STRINGS ==========
// All user-facing text in one place for easy localization

const STRINGS = {
    // Gate Screen
    gate: {
        title: 'Enter the Sty',
        placeholder: 'Password',
        button: 'Enter',
        error: 'Wrong snort, try again.'
    },

    // Home Screen
    home: {
        title: 'Powers of Pig',
        play: 'Play',
        collection: 'Collection',
        highScore: 'High Score:'
    },

    // Game Screen
    game: {
        score: 'Score',
        instructions: 'Swipe or use arrow keys to move tiles',
        giveFeedback: 'Give Feedback',
        soundOn: '🔊',
        soundOff: '🔇'
    },

    // Pause Overlay
    pause: {
        title: 'Paused',
        resume: 'Resume',
        restart: 'Restart',
        home: 'Home'
    },

    // Restart Confirmation
    restart: {
        title: 'Start Over?',
        message: 'This will cost 1 life.',
        cancel: 'Cancel',
        confirm: 'Confirm'
    },

    // Purchase Modal
    purchase: {
        title: 'Purchase Lives',
        message: (count) => `You would purchase ${count} ${count === 1 ? 'life' : 'lives'} here!`,
        placeholder: '[Placeholder - no real payment]',
        ok: 'OK'
    },

    // Feedback Modals
    feedback: {
        rateTitle: 'Rate your game',
        thumbsUp: '👍',
        thumbsDown: '👎',
        thanks: 'Thanks!',
        commentTitle: 'What did you think of the game?',
        submit: 'Submit'
    },

    // Game Over Screen
    gameOver: {
        title: 'Game Over!',
        score: 'Score:',
        highestPig: 'Highest pig:',
        newPig: 'New pig discovered!',
        playAgain: 'Play Again',
        home: 'Home'
    },

    // Win Screen
    win: {
        title: '🎉 Congratulations! 🎉',
        created: "You've created",
        lionPig: 'THE LION PIG',
        emoji: '🐷🦁',
        continue: 'Continue Playing',
        newGame: 'New Game'
    },

    // Collection Screen
    collection: {
        title: 'Collection',
        progress: (count) => `${count}/17`,
        lockedName: '???',
        lockedIcon: '?'
    },

    // Out of Lives Screen
    outOfLives: {
        title: 'Out of Oinks!',
        nextLife: 'Next life in:',
        timerComplete: '--:--:--',
        get1Life: 'Get 1 Life',
        price1: '£0.50',
        get3Lives: 'Get 3 Lives',
        price3: '£1.00',
        home: 'Home'
    },

    // Pig Names (17 tiers)
    pigs: {
        1: 'Pip',
        2: 'Sprout',
        3: 'Trotter',
        4: 'Hamlet',
        5: 'Hog',
        6: 'Sir Oinks',
        7: 'Wiggleton',
        8: 'Baron von Bubble',
        9: 'Sherlock Hams',
        10: 'Sir Loin',
        11: 'Lord Porkington',
        12: 'Neil Hamstrong',
        13: 'Erik the Pink',
        14: 'Gandalf the Ham',
        15: 'His Royal Hogness',
        16: 'The Cosmic Sow',
        17: 'THE LION PIG'
    }
};

// Export for use in game.js (or use directly if loaded via script tag)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = STRINGS;
}
