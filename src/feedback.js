/**
 * Feedback System
 *
 * Handles player feedback collection and submission to Supabase.
 * Rate-limited to 1 submission per 60 seconds with honeypot protection.
 */

// Rate limiting constants
const RATE_LIMIT_KEY = 'pop_last_feedback';
const RATE_LIMIT_MS = 60000;

const Feedback = {
    /**
     * Show feedback modal
     * @param {Object} elements - DOM element references
     * @param {HTMLInputElement} elements.sendToInput - "Who would you send this to?" input
     * @param {HTMLTextAreaElement} elements.improveTextarea - "What would make it better?" textarea
     * @param {Function} elements.showOverlay - Function to show overlay
     * @param {string} context - 'gameOver' or 'inGame'
     * @returns {string} context - Returns context for tracking
     */
    showModal(elements, context) {
        // Reset modal state
        elements.sendToInput.value = '';
        elements.improveTextarea.value = '';

        // Track feedback shown
        if (typeof Analytics !== 'undefined') {
            Analytics.track('feedback_shown', { context });
        }

        elements.showOverlay('feedback');

        return context;
    },

    /**
     * Submit feedback to Supabase
     * @param {Object} gameState - Current game state
     * @param {number} gameState.score - Player score
     * @param {number} gameState.moves - Move count
     * @param {number} gameState.duration - Game duration in seconds
     * @param {number} gameState.highestTier - Highest pig tier reached
     * @param {string} gameState.deviceType - 'mobile' or 'desktop'
     * @param {Object} inputs - User input values
     * @param {string} inputs.sendToText - Answer to "Who would you send this to?"
     * @param {string} inputs.improvementText - Answer to "What would make it better?"
     * @param {string} context - 'gameOver' or 'inGame'
     */
    async submit(gameState, inputs, context) {
        // Honeypot check - bots fill this hidden field, humans don't see it
        const honeypot = document.getElementById('feedback-honeypot');
        if (honeypot && honeypot.value) {
            return false; // Silent fail
        }

        // Rate limit: max 1 submission per 60 seconds
        const lastSubmission = sessionStorage.getItem(RATE_LIMIT_KEY);
        if (lastSubmission && Date.now() - parseInt(lastSubmission) < RATE_LIMIT_MS) {
            return false; // Silent fail
        }

        const sendToText = inputs.sendToText.trim();
        const improvementText = inputs.improvementText.trim();

        // Length validation (defense in depth - HTML maxlength is first line)
        if (sendToText.length > 500 || improvementText.length > 1000) {
            return false; // Silent fail
        }

        // Track feedback submitted
        if (typeof Analytics !== 'undefined') {
            Analytics.track('feedback_submitted', {
                context: context,
                has_send_to: sendToText.length > 0,
                has_improvement: improvementText.length > 0
            });
        }

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
                    highest_pig_reached: gameState.highestTier,
                    score: gameState.score,
                    moves: gameState.moves,
                    duration_seconds: gameState.duration,
                    device_type: gameState.deviceType
                })
            });
            // Mark submission time for rate limiting
            sessionStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
            return true;
        } catch (e) {
            // Fail silently - don't block game flow
            console.warn('Could not submit feedback:', e);
            return false;
        }
    },

    /**
     * Skip feedback
     * @param {string} context - 'gameOver' or 'inGame'
     */
    skip(context) {
        // Track feedback skipped
        if (typeof Analytics !== 'undefined') {
            Analytics.track('feedback_skipped', { context });
        }
    },

    /**
     * Close feedback modal and handle post-close actions
     * @param {Object} elements - DOM element references
     * @param {Function} elements.hideOverlay - Function to hide overlay
     * @param {Function} elements.showScreen - Function to show screen
     * @param {Function} elements.trackGameOverScreen - Function to track game over screen view
     * @param {string} context - 'gameOver' or 'inGame'
     */
    closeModal(elements, context) {
        elements.hideOverlay('feedback');

        // Handle based on context
        if (context === 'gameOver') {
            // Trigger game over screen tracking and display
            elements.trackGameOverScreen();
            elements.showScreen('gameover');
        }
        // For 'inGame' context, just close - return to current game
    }
};

// Node.js export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Feedback };
}
