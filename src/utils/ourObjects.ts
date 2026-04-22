import { OurObject } from '../types/ourObjects';

/**
 * Returns only objects where is_published === true.
 */
export function filterPublished(objects: OurObject[]): OurObject[] {
  return objects.filter((obj) => obj.is_published === true);
}

/**
 * Sorts objects by display_order ASC, then by created_at DESC for equal display_order values.
 * Does not mutate the input array.
 */
export function sortObjects(objects: OurObject[]): OurObject[] {
  return [...objects].sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }
    // Equal display_order: sort by created_at DESC (newer first)
    return b.created_at.localeCompare(a.created_at);
  });
}
