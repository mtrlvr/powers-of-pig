/**
 * Tracking System
 *
 * Minimal Supabase event logging for campaign mode.
 * Three events: session_start, level_complete, level_fail.
 * Fire-and-forget pattern - never blocks gameplay.
 */

const PLAYER_ID_KEY = 'pop_player_id';

/**
 * Get or create a persistent player ID
 * @returns {string} UUID player ID
 */
function getOrCreatePlayerId() {
    let id = localStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(PLAYER_ID_KEY, id);
    }
    return id;
}

/**
 * Send event to Supabase (fire-and-forget)
 * @param {string} eventType - Event type (session_start, level_complete, level_fail)
 * @param {Object} data - Event-specific data
 */
async function trackEvent(eventType, data = {}) {
    try {
        fetch(`${SUPABASE_URL}/rest/v1/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                player_id: getOrCreatePlayerId(),
                event_type: eventType,
                data: data
            })
        });
        // Don't await - fire and forget
    } catch (e) {
        // Silently fail - never break the game for tracking
    }
}

const Tracking = {
    /**
     * Track session start (page load)
     */
    sessionStart() {
        trackEvent('session_start', {
            referrer: document.referrer || null
        });
    },

    /**
     * Track campaign level completion
     * @param {number} levelId - Level ID
     * @param {number} world - World number
     */
    levelComplete(levelId, world) {
        trackEvent('level_complete', {
            level_id: levelId,
            world: world
        });
    },

    /**
     * Track campaign level failure
     * @param {number} levelId - Level ID
     * @param {number} world - World number
     */
    levelFail(levelId, world) {
        trackEvent('level_fail', {
            level_id: levelId,
            world: world
        });
    }
};

// Node.js export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Tracking, getOrCreatePlayerId };
}
