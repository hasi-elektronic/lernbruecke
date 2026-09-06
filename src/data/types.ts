export type UiLanguage = 'de' | 'tr';

export interface ChildProfile {
  nickname: string;
  avatar: string;
  /** Türkische Hilfe im Kinderbereich anbieten? */
  turkishHelp: boolean;
  createdAt: number;
}

export interface Settings {
  /** Sprache der Elternoberfläche. */
  parentLanguage: UiLanguage;
  reducedMotion: boolean;
  soundEnabled: boolean;
}

export interface AttemptRecord {
  lessonId: string;
  exerciseId: string;
  skillId: string;
  isTransfer: boolean;
  /** Beim ersten Versuch korrekt und ohne Hilfe. */
  correctFirstTry: boolean;
  hintsUsed: number;
  usedTurkishHelp: boolean;
  attempts: number;
  timestamp: number;
}

export interface LessonCompletion {
  lessonId: string;
  skillId: string;
  completedAt: number;
  exerciseCount: number;
  /** Übungen, die ohne Hilfe im ersten Versuch richtig waren. */
  unassistedCorrect: number;
  hintsUsed: number;
  /** Kontrollaufgabe im ersten Versuch ohne Hilfe richtig? */
  transferFirstTryCorrect: boolean;
}

export const SCHEMA_VERSION = 1;

export interface AppData {
  schemaVersion: number;
  profile: ChildProfile | null;
  settings: Settings;
  attempts: AttemptRecord[];
  completions: LessonCompletion[];
}

export const defaultSettings: Settings = {
  parentLanguage: 'de',
  reducedMotion: false,
  soundEnabled: true,
};

export function emptyData(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: null,
    settings: { ...defaultSettings },
    attempts: [],
    completions: [],
  };
}
