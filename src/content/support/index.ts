import type { SupportLanguage, SupportPack, SupportEntry } from '../../types/content';
import { supportTr } from './tr';
import { supportEs } from './es';
import { supportEn } from './en';

/**
 * Registry der Verständnishilfen. Eine weitere Sprache (z. B. Arabisch)
 * bedeutet: neue Datei anlegen, hier eintragen, fertig — kein Code im
 * Lektionsmotor ändert sich.
 */
export const supportPacks: Partial<Record<SupportLanguage, SupportPack>> = {
  tr: supportTr,
  es: supportEs,
  en: supportEn,
};

export interface SupportLanguageInfo {
  id: SupportLanguage;
  /** Bezeichnung in der Sprache selbst. */
  nativeLabel: string;
  flag: string;
}

export const supportLanguages: SupportLanguageInfo[] = [
  { id: 'tr', nativeLabel: 'Türkçe', flag: '🇹🇷' },
  { id: 'es', nativeLabel: 'Español', flag: '🇪🇸' },
  { id: 'en', nativeLabel: 'English', flag: '🇬🇧' },
];

export function getSupport(lang: SupportLanguage | null, exerciseId: string): SupportEntry | null {
  if (!lang) return null;
  return supportPacks[lang]?.[exerciseId] ?? null;
}

export function supportLanguageInfo(lang: SupportLanguage): SupportLanguageInfo | undefined {
  return supportLanguages.find((l) => l.id === lang);
}
