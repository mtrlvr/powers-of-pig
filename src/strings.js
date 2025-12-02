// ========== CENTRALIZED UI STRINGS ==========
// All user-facing text in one place for easy localization
// Supports English (en) and French (fr)

const STRINGS = {
    en: {
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
    },

    fr: {
        // Gate Screen
        gate: {
            title: 'Entre dans la Porcherie',
            placeholder: 'Mot de passe',
            button: 'Entrer',
            error: 'Nom d\'un cochon, mauvais gruik, réessaie.'
        },

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
            message: 'Cela te coûtera 1 vie.',
            cancel: 'Annuler',
            confirm: 'Confirmer'
        },

        // Purchase Modal
        purchase: {
            title: 'Acheter des vies',
            message: (count) => `Tu achèterais ${count} ${count === 1 ? 'vie' : 'vies'} ici !`,
            placeholder: '[Test – pas de vrai paiement]',
            ok: 'OK'
        },

        // Feedback Modals
        feedback: {
            rateTitle: 'Note ta partie',
            thumbsUp: '👍',
            thumbsDown: '👎',
            thanks: 'Merci !',
            commentTitle: 'Qu\'as-tu pensé du jeu ?',
            submit: 'Envoyer'
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

        // Out of Lives Screen
        outOfLives: {
            title: 'Plus de gruiks !',
            nextLife: 'Prochaine vie dans :',
            timerComplete: '--:--:--',
            get1Life: 'Obtenir 1 vie',
            price1: '0,50 €',
            get3Lives: 'Obtenir 3 vies',
            price3: '1,00 €',
            home: 'Accueil'
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
