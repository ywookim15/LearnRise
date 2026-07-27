// -----------------------------------------------------------------------------
// SUPPORTED LANGUAGES (shared client + server, no secrets).
//
// The 10 languages LearnRise supports for BOTH the interface locale and the
// language a learner studies in (roadmaps, resources, and the tutor are
// generated in this language). English and Korean are required; the other
// eight are chosen for large speaker bases AND deep availability of online
// learning resources. `code` doubles as the i18n locale code.
// -----------------------------------------------------------------------------

export interface Language {
  code: string; // BCP-47 / locale code, also the i18n locale
  /** Name in English, used inside LLM prompts and English UI. */
  englishName: string;
  /** Endonym, shown in the picker so speakers recognize their language. */
  nativeName: string;
  /** A search hint appended to resource queries to bias toward this language. */
  searchHint: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", englishName: "English", nativeName: "English", searchHint: "" },
  { code: "ko", englishName: "Korean", nativeName: "한국어", searchHint: "한국어" },
  { code: "es", englishName: "Spanish", nativeName: "Español", searchHint: "en español" },
  { code: "zh", englishName: "Chinese (Mandarin)", nativeName: "中文", searchHint: "中文" },
  { code: "ja", englishName: "Japanese", nativeName: "日本語", searchHint: "日本語" },
  { code: "fr", englishName: "French", nativeName: "Français", searchHint: "en français" },
  { code: "de", englishName: "German", nativeName: "Deutsch", searchHint: "auf Deutsch" },
  { code: "pt", englishName: "Portuguese", nativeName: "Português", searchHint: "em português" },
  { code: "ru", englishName: "Russian", nativeName: "Русский", searchHint: "на русском" },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी", searchHint: "हिंदी में" },
];

export const DEFAULT_LANGUAGE = "en";
export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

const BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

/** Resolve a code to a Language, falling back to English for anything unknown. */
export function getLanguage(code: string | null | undefined): Language {
  return (code && BY_CODE.get(code)) || BY_CODE.get(DEFAULT_LANGUAGE)!;
}

export function isSupportedLanguage(code: string | null | undefined): code is string {
  return !!code && BY_CODE.has(code);
}

/** Normalize any input (e.g. "en-US", "ES") down to a supported code or 'en'. */
export function normalizeLanguage(code: string | null | undefined): string {
  if (!code) return DEFAULT_LANGUAGE;
  const lower = code.toLowerCase();
  if (BY_CODE.has(lower)) return lower;
  const base = lower.split(/[-_]/)[0];
  return BY_CODE.has(base) ? base : DEFAULT_LANGUAGE;
}
