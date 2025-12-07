// ========== CENTRALIZED UI STRINGS ==========
// All user-facing text in one place for easy localization
// Supports English (en) and French (fr)

const STRINGS = {
    en: {
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
            cancel: 'Cancel',
            confirm: 'Confirm'
        },

        // Feedback Modal
        feedback: {
            title: 'Quick feedback',
            question1: 'Who would you send this to?',
            placeholder1: 'e.g. my brother, a friend who likes puzzle games...',
            question2: 'What would make it better?',
            submit: 'Submit',
            skip: 'Maybe later'
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
        },

        // Tutorial
        tutorial: {
            swipeInstruction: 'Swipe right',
            keyInstruction: 'Press → or swipe right',
            firstMerge: 'Pip + Pip = Sprout!',
            match17: 'Match pigs to discover all 17!'
        },

        // Help System
        help: {
            stuck: 'Stuck?'
        }
    },

    fr: {
        // Home Screen
        home: {
            title: 'Gruik',
            play: 'Jouer',
            collection: 'Collection',
            highScore: 'Meilleur score :'
        },

        // Game Screen
        game: {
            score: 'Score',
            instructions: 'Balaye ou utilise les flèches pour déplacer les tuiles',
            giveFeedback: 'Donne ton avis',
            soundOn: '🔊',
            soundOff: '🔇'
        },

        // Pause Overlay
        pause: {
            title: 'Pause',
            resume: 'Reprendre',
            restart: 'Recommencer',
            home: 'Accueil'
        },

        // Restart Confirmation
        restart: {
            title: 'Recommencer ?',
            cancel: 'Annuler',
            confirm: 'Confirmer'
        },

        // Feedback Modal
        feedback: {
            title: 'Un petit retour',
            question1: 'À qui enverrais-tu ce jeu ?',
            placeholder1: 'ex. mon frère, un ami qui aime les jeux de réflexion...',
            question2: 'Qu\'est-ce qui le rendrait meilleur ?',
            submit: 'Envoyer',
            skip: 'Peut-être plus tard'
        },

        // Game Over Screen
        gameOver: {
            title: 'Perdu !',
            score: 'Score :',
            highestPig: 'Meilleur cochon :',
            newPig: 'Nouveau cochon découvert !',
            playAgain: 'Rejouer',
            home: 'Accueil'
        },

        // Win Screen
        win: {
            title: '🎉 Félicitations ! 🎉',
            created: 'Tu as créé',
            lionPig: 'LE GROIN LION',
            emoji: '🐷🦁',
            continue: 'Continuer à jouer',
            newGame: 'Nouvelle partie'
        },

        // Collection Screen
        collection: {
            title: 'Collection',
            progress: (count) => `${count}/17`,
            lockedName: '???',
            lockedIcon: '?'
        },

        // Pig Names (17 tiers)
        pigs: {
            1: 'Pépin',
            2: 'Pousse',
            3: 'Trotteur',
            4: 'Goret',
            5: 'Gros Cochon',
            6: 'Sire Gruik',
            7: 'Marquis Tire-Bouchon',
            8: 'Baron von Bulle',
            9: 'Sherlock Grogne',
            10: 'Sire Longe',
            11: 'Duc de Jambon',
            12: 'Thomas Porcquet',
            13: 'Erik le Rose',
            14: 'Gandalf le Lard',
            15: 'Sa Majesté Porcine',
            16: 'La Truie Cosmique',
            17: 'LE GROIN LION'
        },

        // Tutorial
        tutorial: {
            swipeInstruction: 'Balaye vers la droite',
            keyInstruction: 'Appuie sur → ou balaye',
            firstMerge: 'Pépin + Pépin = Pousse !',
            match17: 'Combine les cochons pour tous les découvrir !'
        },

        // Help System
        help: {
            stuck: 'Bloqué ?'
        }
    }
};

// ========== LANGUAGE HELPER FUNCTIONS ==========

// Get current language from localStorage or detect from browser
function getCurrentLanguage() {
    const stored = localStorage.getItem('powersofpig-language');
    if (stored && (stored === 'en' || stored === 'fr')) {
        return stored;
    }
    // Detect browser locale
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang && browserLang.startsWith('fr') ? 'fr' : 'en';
}

// Set language and persist to localStorage
function setLanguage(lang) {
    if (lang === 'en' || lang === 'fr') {
        localStorage.setItem('powersofpig-language', lang);
    }
}

// Get strings for current language
function getStrings() {
    return STRINGS[getCurrentLanguage()];
}

// Toggle between languages
function toggleLanguage() {
    const current = getCurrentLanguage();
    setLanguage(current === 'en' ? 'fr' : 'en');
}

// Export for use in game.js (or use directly if loaded via script tag)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STRINGS, getCurrentLanguage, setLanguage, getStrings, toggleLanguage };
}
