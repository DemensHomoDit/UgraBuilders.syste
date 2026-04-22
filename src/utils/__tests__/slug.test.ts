import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateSlug } from '../slug';

describe('generateSlug', () => {
  // Unit tests
  describe('unit tests', () => {
    it('should convert Cyrillic to Latin', () => {
      expect(generateSlug('Привет Мир')).toBe('privet-mir');
    });

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should handle only special characters', () => {
      const result = generateSlug('!@#$%^&*()');
      expect(result).toBe('');
    });

    it('should handle already Latin text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should handle mixed Cyrillic and Latin', () => {
      expect(generateSlug('Дом в Surgut 2024')).toBe('dom-v-surgut-2024');
    });

    it('should remove multiple consecutive dashes', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world');
    });

    it('should trim dashes from start and end', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world');
    });
  });

  // Feature: our-objects, Property 13: Генерация slug из заголовка
  describe('property-based tests', () => {
    it('should produce valid slug for any non-empty title', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          (title) => {
            const slug = generateSlug(title);
            
            // If slug is not empty, it should match the pattern
            if (slug.length > 0) {
              return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
            }
            
            // Empty slug is acceptable for strings with only special characters
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not start or end with dash', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          (title) => {
            const slug = generateSlug(title);
            
            if (slug.length === 0) return true;
            
            return !slug.startsWith('-') && !slug.endsWith('-');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be lowercase', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          (title) => {
            const slug = generateSlug(title);
            return slug === slug.toLowerCase();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
