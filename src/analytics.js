// Powers of Pig - Analytics (PostHog)
// Event tracking and milestone management

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

// Export for Node/test compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MILESTONES_KEY, Analytics };
}
