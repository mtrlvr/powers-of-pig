// Powers of Pig - Constants
// Supabase configuration, pig definitions, and storage keys

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

// Local storage keys
const STORAGE_KEY = 'powersOfPig';
const TUTORIAL_COMPLETE_KEY = 'pop_tutorial_complete';
const FIRST_MERGE_CELEBRATED_KEY = 'pop_first_merge_celebrated';
const CAMPAIGN_STORAGE_KEY = 'pop_campaign';

// Export for Node/test compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_URL, SUPABASE_ANON_KEY, PIGS, PIG_VALUES, STORAGE_KEY, TUTORIAL_COMPLETE_KEY, FIRST_MERGE_CELEBRATED_KEY, CAMPAIGN_STORAGE_KEY };
}
