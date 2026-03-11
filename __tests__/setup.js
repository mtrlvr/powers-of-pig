// Test setup file - runs before all tests
// Sets up global variables needed by source files

import {
  PIGS,
  PIG_VALUES,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  STORAGE_KEY,
  TUTORIAL_COMPLETE_KEY,
  FIRST_MERGE_CELEBRATED_KEY,
  CAMPAIGN_STORAGE_KEY
} from '../src/constants.js';

// Mock browser globals
global.Image = class Image {
  constructor() {
    this.src = '';
  }
};

// Make constants globally available for game.js and other modules
global.PIGS = PIGS;
global.PIG_VALUES = PIG_VALUES;
global.SUPABASE_URL = SUPABASE_URL;
global.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
global.STORAGE_KEY = STORAGE_KEY;
global.TUTORIAL_COMPLETE_KEY = TUTORIAL_COMPLETE_KEY;
global.FIRST_MERGE_CELEBRATED_KEY = FIRST_MERGE_CELEBRATED_KEY;
global.CAMPAIGN_STORAGE_KEY = CAMPAIGN_STORAGE_KEY;

// Mock sound system
global.soundSystem = {
  init: () => {},
  setEnabled: () => {},
  playOink: () => {},
  preloadSounds: () => {}
};

// Mock haptics system
global.hapticsSystem = {
  merge: () => {}
};

// Mock analytics
global.posthog = {
  capture: () => {}
};
