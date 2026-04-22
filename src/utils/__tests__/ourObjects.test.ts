import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filterPublished, sortObjects } from '../ourObjects';
import type { OurObject } from '@/types/ourObjects';

describe('ourObjects utilities', () => {
  // Feature: our-objects, Property 1: Фильтрация опубликованных объектов
  describe('filterPublished', () => {
    it('should filter only published objects', () => {
      const objects: Partial<OurObject>[] = [
        { id: '1', title: 'Object 1', is_published: true, display_order: 0, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '2', title: 'Object 2', is_published: false, display_order: 0, created_at: '2024-01-02', updated_at: '2024-01-02' },
        { id: '3', title: 'Object 3', is_published: true, display_order: 0, created_at: '2024-01-03', updated_at: '2024-01-03' },
      ];

      const result = filterPublished(objects as OurObject[]);
      
      expect(result).toHaveLength(2);
      expect(result.every(obj => obj.is_published === true)).toBe(true);
    });

    it('should return empty array when no published objects', () => {
      const objects: Partial<OurObject>[] = [
        { id: '1', title: 'Object 1', is_published: false, display_order: 0, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '2', title: 'Object 2', is_published: false, display_order: 0, created_at: '2024-01-02', updated_at: '2024-01-02' },
      ];

      const result = filterPublished(objects as OurObject[]);
      
      expect(result).toHaveLength(0);
    });

    // Property-based test
    it('property: filters only published objects for any array', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string(),
              is_published: fc.boolean(),
              display_order: fc.integer(),
              created_at: fc.integer({ min: 1577836800000, max: 1767225600000 }).map(ts => new Date(ts).toISOString()),
              updated_at: fc.integer({ min: 1577836800000, max: 1767225600000 }).map(ts => new Date(ts).toISOString()),
            })
          ),
          (objects) => {
            const result = filterPublished(objects as OurObject[]);
            return result.every((o) => o.is_published === true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: our-objects, Property 2: Сортировка объектов
  describe('sortObjects', () => {
    it('should sort by display_order ascending', () => {
      const objects: Partial<OurObject>[] = [
        { id: '1', title: 'Object 1', is_published: true, display_order: 3, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Object 2', is_published: true, display_order: 1, created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },
        { id: '3', title: 'Object 3', is_published: true, display_order: 2, created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' },
      ];

      const result = sortObjects(objects as OurObject[]);
      
      expect(result[0].display_order).toBe(1);
      expect(result[1].display_order).toBe(2);
      expect(result[2].display_order).toBe(3);
    });

    it('should sort by created_at descending when display_order is equal', () => {
      const objects: Partial<OurObject>[] = [
        { id: '1', title: 'Object 1', is_published: true, display_order: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Object 2', is_published: true, display_order: 1, created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' },
        { id: '3', title: 'Object 3', is_published: true, display_order: 1, created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },
      ];

      const result = sortObjects(objects as OurObject[]);
      
      // Should be sorted by created_at DESC (newest first)
      expect(result[0].id).toBe('2'); // 2024-01-03
      expect(result[1].id).toBe('3'); // 2024-01-02
      expect(result[2].id).toBe('1'); // 2024-01-01
    });

    // Property-based test
    it('property: sorts by display_order ascending, then created_at descending', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string(),
              is_published: fc.boolean(),
              display_order: fc.integer({ min: 0, max: 100 }),
              created_at: fc.integer({ min: 1577836800000, max: 1767225600000 }).map(ts => new Date(ts).toISOString()),
              updated_at: fc.integer({ min: 1577836800000, max: 1767225600000 }).map(ts => new Date(ts).toISOString()),
            }),
            { minLength: 2 }
          ),
          (objects) => {
            const result = sortObjects(objects as OurObject[]);
            
            // Check that display_order is ascending
            for (let i = 0; i < result.length - 1; i++) {
              if (result[i].display_order > result[i + 1].display_order) {
                return false;
              }
              
              // If display_order is equal, check that created_at is descending
              if (result[i].display_order === result[i + 1].display_order) {
                const date1 = new Date(result[i].created_at).getTime();
                const date2 = new Date(result[i + 1].created_at).getTime();
                if (date1 < date2) {
                  return false;
                }
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
