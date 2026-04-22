// src/utils/slug.ts

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
  ж: "zh", з: "z", и: "i", й: "j", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  А: "a", Б: "b", В: "v", Г: "g", Д: "d", Е: "e", Ё: "yo",
  Ж: "zh", З: "z", И: "i", Й: "j", К: "k", Л: "l", М: "m",
  Н: "n", О: "o", П: "p", Р: "r", С: "s", Т: "t", У: "u",
  Ф: "f", Х: "kh", Ц: "ts", Ч: "ch", Ш: "sh", Щ: "shch",
  Ъ: "", Ы: "y", Ь: "", Э: "e", Ю: "yu", Я: "ya",
};

/**
 * Converts a title string into a URL-friendly slug.
 *
 * Steps:
 * 1. Transliterate Cyrillic characters to Latin equivalents
 * 2. Convert to lowercase
 * 3. Replace spaces and non-alphanumeric characters with hyphens
 * 4. Collapse consecutive hyphens into one
 * 5. Trim leading and trailing hyphens
 *
 * Returns a string matching /^[a-z0-9]+(?:-[a-z0-9]+)*$/ for non-empty input
 * that contains at least one alphanumeric character. Returns an empty string
 * if the input produces no valid characters.
 */
export function generateSlug(title: string): string {
  // Step 1: Transliterate Cyrillic → Latin
  const transliterated = title
    .split("")
    .map((char) => (char in CYRILLIC_TO_LATIN ? CYRILLIC_TO_LATIN[char] : char))
    .join("");

  // Step 2: Lowercase
  const lowered = transliterated.toLowerCase();

  // Step 3: Replace spaces and non-alphanumeric characters with hyphens
  const hyphenated = lowered.replace(/[^a-z0-9]+/g, "-");

  // Step 4: Collapse consecutive hyphens
  const collapsed = hyphenated.replace(/-{2,}/g, "-");

  // Step 5: Trim leading/trailing hyphens
  const trimmed = collapsed.replace(/^-+|-+$/g, "");

  return trimmed;
}
