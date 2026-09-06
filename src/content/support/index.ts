import type { SupportEntry, SupportLanguage, SupportPack } from '../../types/content';
import { supportTr } from './tr';
import { supportEs } from './es';
import { supportEn } from './en';
import { usSupportEs } from './us-es';

/**
 * Registry der Verständnishilfen, gemeinsam für alle Content-Packs.
 * Die Übungs-IDs sind global eindeutig (deutsche Lektionen a1…, US-Lektionen ua1…),
 * deshalb reicht eine Ebene je Sprache.
 *
 * Neue Sprache = neue Datei + Eintrag hier. Kein Code im Lektionsmotor ändert sich.
 */
export const supportPacks: Partial<Record<SupportLanguage, SupportPack>> = {
  tr: supportTr,
  es: { ...supportEs, ...usSupportEs },
  en: supportEn,
};

export interface SupportLanguageInfo {
  id: SupportLanguage;
  nativeLabel: string;
  flag: string;
}

const allSupportLanguages: SupportLanguageInfo[] = [
  { id: 'tr', nativeLabel: 'Türkçe', flag: '🇹🇷' },
  { id: 'es', nativeLabel: 'Español', flag: '🇪🇸' },
  { id: 'en', nativeLabel: 'English', flag: '🇬🇧' },
];

/** Nur die Sprachen, die für dieses Pack vollständig vorliegen. */
export function supportLanguagesFor(available: SupportLanguage[]): SupportLanguageInfo[] {
  return allSupportLanguages.filter((l) => available.includes(l.id));
}

export function getSupport(lang: SupportLanguage | null, exerciseId: string): SupportEntry | null {
  if (!lang) return null;
  return supportPacks[lang]?.[exerciseId] ?? null;
}

export function supportLanguageInfo(lang: SupportLanguage): SupportLanguageInfo | undefined {
  return allSupportLanguages.find((l) => l.id === lang);
}
