import { describe, expect, it } from 'vitest';
import { buildParentAdvice, hintUsageRate, recommendNextLesson, skillStats } from './progress';
import type { AttemptRecord, LessonCompletion } from '../data/types';
import { lessons } from '../content';

function attempt(partial: Partial<AttemptRecord>): AttemptRecord {
  return {
    lessonId: 'a1',
    exerciseId: 'a1-s1',
    skillId: 'anweisung-markieren',
    isTransfer: false,
    correctFirstTry: true,
    hintsUsed: 0,
    usedTurkishHelp: false,
    attempts: 1,
    timestamp: 1,
    ...partial,
  };
}

function completion(partial: Partial<LessonCompletion>): LessonCompletion {
  return {
    lessonId: 'a1',
    skillId: 'anweisung-markieren',
    completedAt: 1,
    exerciseCount: 4,
    unassistedCorrect: 4,
    hintsUsed: 0,
    transferFirstTryCorrect: true,
    ...partial,
  };
}

describe('skillStats', () => {
  it('trennt Gesamtquote und Kontrollaufgaben-Quote', () => {
    const stats = skillStats([
      attempt({}),
      attempt({ correctFirstTry: false, hintsUsed: 2 }),
      attempt({ isTransfer: true, correctFirstTry: false, hintsUsed: 1 }),
    ]);
    expect(stats).toHaveLength(1);
    expect(stats[0].total).toBe(3);
    expect(stats[0].unassisted).toBe(1);
    expect(stats[0].ratio).toBeCloseTo(1 / 3);
    expect(stats[0].transferTotal).toBe(1);
    expect(stats[0].transferRatio).toBe(0);
    expect(stats[0].hintsUsed).toBe(3);
  });

  it('liefert null-Quoten ohne Daten', () => {
    expect(skillStats([])).toEqual([]);
    expect(hintUsageRate([])).toBeNull();
  });
});

describe('recommendNextLesson', () => {
  it('startet mit der ersten Lektion, wenn nichts gelernt wurde', () => {
    const rec = recommendNextLesson([], []);
    expect(rec.lesson.id).toBe(lessons[0].id);
    expect(rec.reason).toBe('next-new');
  });

  it('geht zur nächsten neuen Lektion, wenn die vorige stark war', () => {
    const rec = recommendNextLesson(
      [attempt({}), attempt({ exerciseId: 'a1-t', isTransfer: true })],
      [completion({})],
    );
    expect(rec.lesson.id).toBe('a2');
    expect(rec.reason).toBe('next-new');
  });

  it('empfiehlt die Wiederholung, wenn die Kontrollaufgabe nicht saß', () => {
    const rec = recommendNextLesson(
      [attempt({}), attempt({ exerciseId: 'a1-t', isTransfer: true, correctFirstTry: false, hintsUsed: 1 })],
      [completion({ transferFirstTryCorrect: false })],
    );
    expect(rec.lesson.id).toBe('a1');
    expect(rec.reason).toBe('repeat-weak');
  });

  it('empfiehlt Wiederholung bei schwacher Quote unter 60 %', () => {
    const weak = [
      attempt({ correctFirstTry: false, hintsUsed: 1 }),
      attempt({ correctFirstTry: false, hintsUsed: 1 }),
      attempt({ correctFirstTry: true }),
    ];
    const rec = recommendNextLesson(weak, [completion({ transferFirstTryCorrect: true })]);
    expect(rec.lesson.id).toBe('a1');
    expect(rec.reason).toBe('repeat-weak');
  });
});

describe('buildParentAdvice', () => {
  const label = (id: string) => ({ de: id, tr: id });

  it('sagt ehrlich, dass noch keine Daten da sind', () => {
    const advice = buildParentAdvice([], [], label);
    expect(advice).toHaveLength(1);
    expect(advice[0].key).toBe('no-data');
  });

  it('weist auf häufige Hilfe-Nutzung hin', () => {
    const attempts = [
      attempt({ hintsUsed: 2, correctFirstTry: false }),
      attempt({ hintsUsed: 1, correctFirstTry: false }),
      attempt({ hintsUsed: 1, correctFirstTry: false }),
    ];
    const advice = buildParentAdvice(attempts, [completion({})], label);
    expect(advice.some((a) => a.key === 'many-hints')).toBe(true);
    expect(advice.every((a) => a.de.length > 0 && a.tr.length > 0)).toBe(true);
  });
});
