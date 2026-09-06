import {
  SCHEMA_VERSION,
  defaultSettings,
  emptyData,
  type AppData,
  type AttemptRecord,
  type ChildProfile,
  type LessonCompletion,
  type Settings,
} from './types';

export const STORAGE_KEY = 'lernbruecke.data';

/**
 * Minimaler Key-Value-Store. Wird gekapselt, damit später ein echter Server
 * eingehängt werden kann, ohne UI-Code anzufassen.
 */
export interface KeyValueStore {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}

export function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    read: (k) => (map.has(k) ? (map.get(k) as string) : null),
    write: (k, v) => void map.set(k, v),
    remove: (k) => void map.delete(k),
  };
}

/**
 * localStorage kann fehlen oder blockiert sein (privates Fenster, sandboxed
 * iframe, file://). Dann läuft die App im Speicher weiter statt abzustürzen.
 */
export function createBrowserStore(): KeyValueStore {
  try {
    const probe = '__lb_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return {
      read: (k) => window.localStorage.getItem(k),
      write: (k, v) => window.localStorage.setItem(k, v),
      remove: (k) => window.localStorage.removeItem(k),
    };
  } catch {
    return createMemoryStore();
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeProfile(raw: unknown): ChildProfile | null {
  if (!isObject(raw)) return null;
  const nickname = typeof raw.nickname === 'string' ? raw.nickname.trim().slice(0, 20) : '';
  if (!nickname) return null;
  return {
    nickname,
    avatar: typeof raw.avatar === 'string' && raw.avatar ? raw.avatar : '🦊',
    turkishHelp: raw.turkishHelp === true,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  };
}

function sanitizeSettings(raw: unknown): Settings {
  if (!isObject(raw)) return { ...defaultSettings };
  return {
    parentLanguage: raw.parentLanguage === 'tr' ? 'tr' : 'de',
    reducedMotion: raw.reducedMotion === true,
    soundEnabled: raw.soundEnabled !== false,
  };
}

function sanitizeAttempt(raw: unknown): AttemptRecord | null {
  if (!isObject(raw)) return null;
  const { lessonId, exerciseId, skillId } = raw;
  if (typeof lessonId !== 'string' || typeof exerciseId !== 'string' || typeof skillId !== 'string') return null;
  return {
    lessonId,
    exerciseId,
    skillId,
    isTransfer: raw.isTransfer === true,
    correctFirstTry: raw.correctFirstTry === true,
    hintsUsed: typeof raw.hintsUsed === 'number' && raw.hintsUsed >= 0 ? Math.floor(raw.hintsUsed) : 0,
    usedTurkishHelp: raw.usedTurkishHelp === true,
    attempts: typeof raw.attempts === 'number' && raw.attempts > 0 ? Math.floor(raw.attempts) : 1,
    timestamp: typeof raw.timestamp === 'number' ? raw.timestamp : Date.now(),
  };
}

function sanitizeCompletion(raw: unknown): LessonCompletion | null {
  if (!isObject(raw)) return null;
  const { lessonId, skillId } = raw;
  if (typeof lessonId !== 'string' || typeof skillId !== 'string') return null;
  const num = (v: unknown): number => (typeof v === 'number' && v >= 0 ? Math.floor(v) : 0);
  return {
    lessonId,
    skillId,
    completedAt: typeof raw.completedAt === 'number' ? raw.completedAt : Date.now(),
    exerciseCount: num(raw.exerciseCount),
    unassistedCorrect: num(raw.unassistedCorrect),
    hintsUsed: num(raw.hintsUsed),
    transferFirstTryCorrect: raw.transferFirstTryCorrect === true,
  };
}

/**
 * Nimmt beliebigen (auch kaputten oder älteren) Input und liefert immer
 * gültige AppData. Unbekannte Felder werden verworfen.
 */
export function migrate(raw: unknown): AppData {
  if (!isObject(raw)) return emptyData();

  const version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 0;
  // Version 0 (Vorserien-Daten ohne Versionsfeld) wird wie Version 1 gelesen;
  // dank Sanitizing bleiben nur valide Felder übrig.
  if (version > SCHEMA_VERSION) {
    // Daten stammen aus einer neueren App-Version: nur sicher Lesbares übernehmen.
    return {
      ...emptyData(),
      profile: sanitizeProfile(raw.profile),
      settings: sanitizeSettings(raw.settings),
    };
  }

  const attempts = Array.isArray(raw.attempts)
    ? raw.attempts.map(sanitizeAttempt).filter((a): a is AttemptRecord => a !== null)
    : [];
  const completions = Array.isArray(raw.completions)
    ? raw.completions.map(sanitizeCompletion).filter((c): c is LessonCompletion => c !== null)
    : [];

  return {
    schemaVersion: SCHEMA_VERSION,
    profile: sanitizeProfile(raw.profile),
    settings: sanitizeSettings(raw.settings),
    attempts,
    completions,
  };
}

export function parseImport(json: string): { ok: true; data: AppData } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'invalid-json' };
  }
  if (!isObject(parsed)) return { ok: false, error: 'invalid-shape' };
  if (!('attempts' in parsed) && !('profile' in parsed) && !('completions' in parsed)) {
    return { ok: false, error: 'not-lernbruecke' };
  }
  return { ok: true, data: migrate(parsed) };
}

export class ProgressRepository {
  private store: KeyValueStore;
  private cache: AppData;

  constructor(store: KeyValueStore = createMemoryStore()) {
    this.store = store;
    this.cache = this.load();
  }

  private load(): AppData {
    const raw = this.store.read(STORAGE_KEY);
    if (!raw) return emptyData();
    try {
      return migrate(JSON.parse(raw));
    } catch {
      return emptyData();
    }
  }

  private persist(): void {
    try {
      this.store.write(STORAGE_KEY, JSON.stringify(this.cache));
    } catch {
      /* Speichern nicht möglich – App läuft trotzdem weiter. */
    }
  }

  getData(): AppData {
    return this.cache;
  }

  setProfile(profile: ChildProfile): AppData {
    this.cache = { ...this.cache, profile };
    this.persist();
    return this.cache;
  }

  setSettings(settings: Settings): AppData {
    this.cache = { ...this.cache, settings };
    this.persist();
    return this.cache;
  }

  addAttempt(attempt: AttemptRecord): AppData {
    this.cache = { ...this.cache, attempts: [...this.cache.attempts, attempt] };
    this.persist();
    return this.cache;
  }

  addCompletion(completion: LessonCompletion): AppData {
    this.cache = { ...this.cache, completions: [...this.cache.completions, completion] };
    this.persist();
    return this.cache;
  }

  replaceAll(data: AppData): AppData {
    this.cache = migrate(data);
    this.persist();
    return this.cache;
  }

  clear(): AppData {
    this.cache = emptyData();
    this.store.remove(STORAGE_KEY);
    return this.cache;
  }

  exportJson(): string {
    return JSON.stringify({ ...this.cache, exportedAt: new Date().toISOString() }, null, 2);
  }
}
