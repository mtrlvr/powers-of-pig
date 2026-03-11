import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  STRINGS,
  getCurrentLanguage,
  setLanguage,
  getStrings,
  toggleLanguage,
  formatNumber,
  getShareMessage,
  getMidGameShareMessage
} from '../src/strings.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; }
  };
})();

// Mock navigator.language
const mockNavigator = (language) => {
  Object.defineProperty(window.navigator, 'language', {
    writable: true,
    configurable: true,
    value: language
  });
};

describe('strings.js - localization tests', () => {
  beforeEach(() => {
    // Reset localStorage and navigator before each test
    localStorageMock.clear();
    global.localStorage = localStorageMock;
    mockNavigator('en-US');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ========== getCurrentLanguage Tests ==========
  describe('getCurrentLanguage', () => {
    it('returns stored language from localStorage if valid', () => {
      localStorage.setItem('powersofpig-language', 'fr');
      expect(getCurrentLanguage()).toBe('fr');

      localStorage.setItem('powersofpig-language', 'en');
      expect(getCurrentLanguage()).toBe('en');
    });

    it('detects French browser locale when no localStorage value', () => {
      mockNavigator('fr-FR');
      expect(getCurrentLanguage()).toBe('fr');

      mockNavigator('fr-CA');
      expect(getCurrentLanguage()).toBe('fr');

      mockNavigator('fr');
      expect(getCurrentLanguage()).toBe('fr');
    });

    it('defaults to English for non-French browser locales', () => {
      mockNavigator('en-US');
      expect(getCurrentLanguage()).toBe('en');

      mockNavigator('en-GB');
      expect(getCurrentLanguage()).toBe('en');

      mockNavigator('es-ES');
      expect(getCurrentLanguage()).toBe('en');

      mockNavigator('de-DE');
      expect(getCurrentLanguage()).toBe('en');
    });

    it('ignores invalid stored language and falls back to browser detection', () => {
      localStorage.setItem('powersofpig-language', 'invalid');
      mockNavigator('fr-FR');
      expect(getCurrentLanguage()).toBe('fr');

      localStorage.clear();
      localStorage.setItem('powersofpig-language', 'es');
      mockNavigator('en-US');
      expect(getCurrentLanguage()).toBe('en');
    });

    it('handles missing navigator.language gracefully', () => {
      Object.defineProperty(window.navigator, 'language', {
        writable: true,
        configurable: true,
        value: undefined
      });
      Object.defineProperty(window.navigator, 'userLanguage', {
        writable: true,
        configurable: true,
        value: undefined
      });
      expect(getCurrentLanguage()).toBe('en');
    });
  });

  // ========== setLanguage Tests ==========
  describe('setLanguage', () => {
    it('persists valid language to localStorage', () => {
      setLanguage('en');
      expect(localStorage.getItem('powersofpig-language')).toBe('en');

      setLanguage('fr');
      expect(localStorage.getItem('powersofpig-language')).toBe('fr');
    });

    it('ignores invalid language codes', () => {
      setLanguage('es');
      expect(localStorage.getItem('powersofpig-language')).toBeNull();

      setLanguage('invalid');
      expect(localStorage.getItem('powersofpig-language')).toBeNull();

      setLanguage('');
      expect(localStorage.getItem('powersofpig-language')).toBeNull();
    });
  });

  // ========== getStrings Tests ==========
  describe('getStrings', () => {
    it('returns English strings when language is en', () => {
      setLanguage('en');
      const strings = getStrings();
      expect(strings.home.title).toBe('Powers of Pig');
      expect(strings.home.play).toBe('Play');
    });

    it('returns French strings when language is fr', () => {
      setLanguage('fr');
      const strings = getStrings();
      expect(strings.home.title).toBe('Gruik');
      expect(strings.home.play).toBe('Jouer');
    });

    it('returns correct pig names for each language', () => {
      setLanguage('en');
      let strings = getStrings();
      expect(strings.pigs[1]).toBe('Pip');
      expect(strings.pigs[17]).toBe('THE LION PIG');

      setLanguage('fr');
      strings = getStrings();
      expect(strings.pigs[1]).toBe('Pépin');
      expect(strings.pigs[17]).toBe('LE GROIN LION');
    });
  });

  // ========== toggleLanguage Tests ==========
  describe('toggleLanguage', () => {
    it('switches from English to French', () => {
      setLanguage('en');
      expect(getCurrentLanguage()).toBe('en');
      toggleLanguage();
      expect(getCurrentLanguage()).toBe('fr');
    });

    it('switches from French to English', () => {
      setLanguage('fr');
      expect(getCurrentLanguage()).toBe('fr');
      toggleLanguage();
      expect(getCurrentLanguage()).toBe('en');
    });

    it('toggles multiple times correctly', () => {
      setLanguage('en');
      toggleLanguage(); // en -> fr
      expect(getCurrentLanguage()).toBe('fr');
      toggleLanguage(); // fr -> en
      expect(getCurrentLanguage()).toBe('en');
      toggleLanguage(); // en -> fr
      expect(getCurrentLanguage()).toBe('fr');
    });
  });

  // ========== formatNumber Tests ==========
  describe('formatNumber', () => {
    it('formats numbers with comma separator for English', () => {
      setLanguage('en');
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('formats numbers with space separator for French', () => {
      setLanguage('fr');
      const result = formatNumber(1234);
      // French uses narrow no-break space (U+202F) or regular space
      expect(result).toMatch(/1[\s\u202F]234/);
    });

    it('handles small numbers without separators', () => {
      setLanguage('en');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(123)).toBe('123');
      expect(formatNumber(999)).toBe('999');
    });

    it('handles large numbers correctly', () => {
      setLanguage('en');
      expect(formatNumber(9999999)).toBe('9,999,999');
    });
  });

  // ========== getShareMessage Tests ==========
  describe('getShareMessage', () => {
    it('generates English share message', () => {
      setLanguage('en');
      const message = getShareMessage('Pip', 1234);
      expect(message).toContain('Pip');
      expect(message).toContain('1,234');
      expect(message).toContain('Can you beat me');
    });

    it('generates French share message', () => {
      setLanguage('fr');
      const message = getShareMessage('Pépin', 1234);
      expect(message).toContain('Pépin');
      expect(message).toMatch(/1[\s\u202F]234/);
      expect(message).toContain('faire mieux');
    });

    it('formats score with locale-appropriate separators', () => {
      setLanguage('en');
      expect(getShareMessage('THE LION PIG', 999999)).toContain('999,999');

      setLanguage('fr');
      const frMessage = getShareMessage('LE GROIN LION', 999999);
      expect(frMessage).toMatch(/999[\s\u202F]999/);
    });
  });

  // ========== getMidGameShareMessage Tests ==========
  describe('getMidGameShareMessage', () => {
    it('generates English mid-game share message', () => {
      setLanguage('en');
      const message = getMidGameShareMessage(5000);
      expect(message).toContain('5,000');
      expect(message).toContain('points and counting');
    });

    it('generates French mid-game share message', () => {
      setLanguage('fr');
      const message = getMidGameShareMessage(5000);
      expect(message).toMatch(/5[\s\u202F]000/);
      expect(message).toContain('points');
      expect(message).toContain('série en cours');
    });
  });

  // ========== STRINGS Data Integrity Tests ==========
  describe('STRINGS data integrity', () => {
    it('has both en and fr keys at top level', () => {
      expect(STRINGS).toHaveProperty('en');
      expect(STRINGS).toHaveProperty('fr');
    });

    it('both languages have the same top-level sections', () => {
      const enKeys = Object.keys(STRINGS.en).sort();
      const frKeys = Object.keys(STRINGS.fr).sort();
      expect(enKeys).toEqual(frKeys);
    });

    it('home section is complete in both languages', () => {
      expect(STRINGS.en.home).toHaveProperty('title');
      expect(STRINGS.en.home).toHaveProperty('play');
      expect(STRINGS.en.home).toHaveProperty('collection');
      expect(STRINGS.en.home).toHaveProperty('highScore');

      expect(STRINGS.fr.home).toHaveProperty('title');
      expect(STRINGS.fr.home).toHaveProperty('play');
      expect(STRINGS.fr.home).toHaveProperty('collection');
      expect(STRINGS.fr.home).toHaveProperty('highScore');
    });

    it('all 17 pig names are defined in both languages', () => {
      for (let tier = 1; tier <= 17; tier++) {
        expect(STRINGS.en.pigs[tier]).toBeTruthy();
        expect(STRINGS.fr.pigs[tier]).toBeTruthy();
      }
    });

    it('pig names are different between languages (not just copies)', () => {
      expect(STRINGS.en.pigs[1]).not.toBe(STRINGS.fr.pigs[1]); // Pip vs Pépin
      expect(STRINGS.en.pigs[5]).not.toBe(STRINGS.fr.pigs[5]); // Hog vs Gros Cochon
    });

    it('game section has all required keys', () => {
      const requiredKeys = ['score', 'instructions', 'giveFeedback', 'soundOn', 'soundOff'];
      requiredKeys.forEach(key => {
        expect(STRINGS.en.game).toHaveProperty(key);
        expect(STRINGS.fr.game).toHaveProperty(key);
      });
    });

    it('feedback section has all required keys', () => {
      const requiredKeys = ['title', 'question1', 'placeholder1', 'question2', 'submit', 'skip'];
      requiredKeys.forEach(key => {
        expect(STRINGS.en.feedback).toHaveProperty(key);
        expect(STRINGS.fr.feedback).toHaveProperty(key);
      });
    });

    it('campaign section exists in both languages', () => {
      expect(STRINGS.en.campaign).toBeDefined();
      expect(STRINGS.fr.campaign).toBeDefined();
    });

    it('collection.progress is a function in both languages', () => {
      expect(typeof STRINGS.en.collection.progress).toBe('function');
      expect(typeof STRINGS.fr.collection.progress).toBe('function');

      expect(STRINGS.en.collection.progress(5)).toBe('5/17');
      expect(STRINGS.fr.collection.progress(5)).toBe('5/17');
    });
  });
});
