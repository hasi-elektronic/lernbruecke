import { describe, expect, it } from 'vitest';
import { ProgressRepository, STORAGE_KEY, createMemoryStore, migrate, parseImport } from './storage';
import type { AttemptRecord } from './types';
import { SCHEMA_VERSION } from './types';

const sampleAttempt: AttemptRecord = {
  lessonId: 'b2',
  exerciseId: 'b2-s1',
  skillId: 'weg-rechnen',
  isTransfer: false,
  correctFirstTry: true,
  hintsUsed: 0,
  usedTurkishHelp: false,
  attempts: 1,
  timestamp: 1700000000000,
};

describe('migrate', () => {
  it('liefert leere, gültige Daten für Müll-Eingaben', () => {
    for (const bad of [null, 42, 'text', [], undefined]) {
      const data = migrate(bad);
      expect(data.schemaVersion).toBe(SCHEMA_VERSION);
      expect(data.profile).toBeNull();
      expect(data.attempts).toEqual([]);
    }
  });

  it('wirft kaputte Einzelsätze weg, behält gültige', () => {
    const data = migrate({
      schemaVersion: 1,
      profile: { nickname: 'Zeyno', avatar: '🦊', turkishHelp: true, createdAt: 1 },
      settings: { parentLanguage: 'tr', soundEnabled: false },
      attempts: [sampleAttempt, { lessonId: 5 }, null, { exerciseId: 'x' }],
      completions: [{ nonsense: true }],
    });
    expect(data.profile?.nickname).toBe('Zeyno');
    expect(data.settings.parentLanguage).toBe('tr');
    expect(data.settings.soundEnabled).toBe(false);
    expect(data.attempts).toHaveLength(1);
    expect(data.completions).toHaveLength(0);
  });

  it('liest Altdaten ohne Versionsfeld', () => {
    const data = migrate({ profile: { nickname: 'Ali' }, attempts: [sampleAttempt] });
    expect(data.schemaVersion).toBe(SCHEMA_VERSION);
    expect(data.profile?.avatar).toBe('🦊');
    expect(data.attempts).toHaveLength(1);
  });

  it('übernimmt aus neueren Versionen nur Profil und Einstellungen', () => {
    const data = migrate({
      schemaVersion: SCHEMA_VERSION + 5,
      profile: { nickname: 'Neu', avatar: '🐼', turkishHelp: false, createdAt: 2 },
      settings: { parentLanguage: 'de' },
      attempts: [sampleAttempt],
    });
    expect(data.profile?.nickname).toBe('Neu');
    expect(data.attempts).toEqual([]);
  });

  it('verwirft leere Spitznamen', () => {
    expect(migrate({ profile: { nickname: '   ' } }).profile).toBeNull();
  });
});

describe('ProgressRepository', () => {
  it('behält Daten über einen Neustart hinweg', () => {
    const store = createMemoryStore();
    const repo = new ProgressRepository(store);
    repo.setProfile({ nickname: 'Zeyno', avatar: '🐢', turkishHelp: true, createdAt: 1 });
    repo.addAttempt(sampleAttempt);
    repo.addCompletion({
      lessonId: 'b2',
      skillId: 'weg-rechnen',
      completedAt: 2,
      exerciseCount: 5,
      unassistedCorrect: 4,
      hintsUsed: 1,
      transferFirstTryCorrect: true,
    });

    const reopened = new ProgressRepository(store);
    expect(reopened.getData().profile?.nickname).toBe('Zeyno');
    expect(reopened.getData().attempts).toHaveLength(1);
    expect(reopened.getData().completions).toHaveLength(1);
  });

  it('startet sauber, wenn der Speicher beschädigt ist', () => {
    const store = createMemoryStore();
    store.write(STORAGE_KEY, '{ das ist kein json');
    const repo = new ProgressRepository(store);
    expect(repo.getData().profile).toBeNull();
    expect(repo.getData().attempts).toEqual([]);
  });

  it('löscht alle Daten vollständig', () => {
    const store = createMemoryStore();
    const repo = new ProgressRepository(store);
    repo.setProfile({ nickname: 'Zeyno', avatar: '🐢', turkishHelp: false, createdAt: 1 });
    repo.addAttempt(sampleAttempt);
    repo.clear();
    expect(repo.getData().profile).toBeNull();
    expect(new ProgressRepository(store).getData().attempts).toEqual([]);
  });

  it('exportiert und importiert denselben Fortschritt', () => {
    const repo = new ProgressRepository(createMemoryStore());
    repo.setProfile({ nickname: 'Zeyno', avatar: '🦉', turkishHelp: true, createdAt: 1 });
    repo.addAttempt(sampleAttempt);
    const json = repo.exportJson();

    const target = new ProgressRepository(createMemoryStore());
    const parsed = parseImport(json);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) target.replaceAll(parsed.data);
    expect(target.getData().attempts).toHaveLength(1);
    expect(target.getData().profile?.avatar).toBe('🦉');
  });
});

describe('parseImport', () => {
  it('weist ungültige Dateien ab', () => {
    expect(parseImport('kein json').ok).toBe(false);
    expect(parseImport('[]').ok).toBe(false);
    expect(parseImport('{"foo":1}').ok).toBe(false);
  });

  it('akzeptiert eine Exportdatei', () => {
    expect(parseImport('{"schemaVersion":1,"attempts":[],"completions":[]}').ok).toBe(true);
  });
});
