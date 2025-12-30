import { Syllable } from '../types';

const vowels = ['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü'];
const consonants = ['B', 'C', 'Ç', 'D', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'Ş', 'T', 'V', 'Y', 'Z'];

// Blacklist for inappropriate or sensitive syllables/words in Turkish context
const BLOCKED_SYLLABLES = new Set([
  'AM', 'GÖT', 'SİK', 'PİÇ', 'YAR', 'MEM', 'ÇİŞ', 'KAK', 'BOK' // Common 2-3 letter combinations to avoid
]);

// Helper to create a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateSyllables = (): Syllable[] => {
  const allSyllables: Syllable[] = [];

  // Consonant + Vowel (e.g., BA, CE)
  consonants.forEach(c => {
    vowels.forEach(v => {
      const text = `${c}${v}`;
      if (!BLOCKED_SYLLABLES.has(text)) {
        allSyllables.push({ text, id: generateId() });
      }
    });
  });

  // Vowel + Consonant (e.g., AB, EL)
  vowels.forEach(v => {
    consonants.forEach(c => {
      const text = `${v}${c}`;
      if (!BLOCKED_SYLLABLES.has(text)) {
        allSyllables.push({ text, id: generateId() });
      }
    });
  });

  // Shuffle array using Fisher-Yates
  for (let i = allSyllables.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allSyllables[i], allSyllables[j]] = [allSyllables[j], allSyllables[i]];
  }

  return allSyllables;
};