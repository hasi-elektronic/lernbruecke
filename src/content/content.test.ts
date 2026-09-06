import { describe, expect, it } from 'vitest';
import { lessonsOfModule, packList } from './index';
import { supportLanguagesFor, supportPacks } from './support';
import type { ContentPack } from '../types/content';
import type { Exercise } from '../types/content';

function exercisesOf(pack: ContentPack): Exercise[] {
  return pack.lessons.flatMap((l) => [...l.steps, l.transferTask]);
}

function allExercises(): Exercise[] {
  return packList.flatMap(exercisesOf);
}

const allLessons = packList.flatMap((p) => p.lessons);

describe('Lektionsbestand', () => {
  it('enthält je Pack 12 Lektionen, 3 pro Modul', () => {
    expect(packList.length).toBeGreaterThanOrEqual(2);
    for (const pack of packList) {
      expect(pack.lessons, pack.targetLocale).toHaveLength(12);
      for (const m of pack.modules) {
        expect(lessonsOfModule(pack, m.id), `${pack.targetLocale}/${m.id}`).toHaveLength(3);
      }
    }
  });

  it('hat eindeutige Lektions- und Übungs-IDs', () => {
    const lessonIds = allLessons.map((l) => l.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
    const exerciseIds = allExercises().map((e) => e.id);
    expect(new Set(exerciseIds).size).toBe(exerciseIds.length);
  });

  it('nutzt nur Skills, die im eigenen Pack registriert sind', () => {
    for (const pack of packList) {
      const known = new Set(pack.skills.map((s) => s.id));
      for (const lesson of pack.lessons) {
        expect(known.has(lesson.skillId), `${pack.targetLocale}: ${lesson.skillId}`).toBe(true);
      }
    }
  });

  it('hat je Lektion mindestens zwei Übungen plus Kontrollaufgabe', () => {
    for (const lesson of allLessons) {
      expect(lesson.steps.length).toBeGreaterThanOrEqual(2);
      expect(lesson.transferTask).toBeTruthy();
      expect(lesson.title.length).toBeGreaterThan(3);
      expect(lesson.objective.length).toBeGreaterThan(10);
    }
  });

  it('hat überall alle drei Hilfestufen und eine Erklärung', () => {
    for (const e of allExercises()) {
      expect(e.instruction.trim().length).toBeGreaterThan(3);
      expect(e.hint.trim().length).toBeGreaterThan(3);
      expect(e.hintDetail.trim().length).toBeGreaterThan(3);
      expect(e.explanation.trim().length).toBeGreaterThan(3);
      expect(e.hintDetail).not.toBe(e.hint);
    }
  });
});

describe('Hilfssprachen', () => {
  it('deckt jede Übung in allen Sprachen ab, die das Pack anbietet', () => {
    for (const pack of packList) {
      const ids = exercisesOf(pack).map((e) => e.id);
      const langs = supportLanguagesFor(pack.supportLanguages);
      expect(langs.length, `${pack.targetLocale} ohne Hilfssprache`).toBeGreaterThan(0);
      for (const lang of langs) {
        const dict = supportPacks[lang.id];
        expect(dict, `Sprachdatei fehlt: ${lang.id}`).toBeTruthy();
        for (const id of ids) {
          const entry = dict?.[id];
          expect(entry, `${lang.id} fehlt für ${id}`).toBeTruthy();
          expect(entry?.hint.trim().length).toBeGreaterThan(3);
          expect(entry?.explanation.trim().length).toBeGreaterThan(3);
        }
      }
    }
  });

  it('enthält keine verwaisten Einträge', () => {
    const ids = new Set(allExercises().map((e) => e.id));
    for (const lang of ['tr', 'es', 'en'] as const) {
      for (const key of Object.keys(supportPacks[lang] ?? {})) {
        expect(ids.has(key), `${lang}: unbekannte Übung ${key}`).toBe(true);
      }
    }
  });
});

describe('Lösungen sind konsistent', () => {
  it('verweist bei Auswahlaufgaben auf vorhandene Elemente', () => {
    for (const e of allExercises()) {
      if (e.interactionType === 'select-one') {
        expect(e.items.map((i) => i.id)).toContain(e.correctAnswer);
        expect(e.items.length).toBeGreaterThanOrEqual(2);
      }
      if (e.interactionType === 'select-multiple') {
        expect(e.correctAnswer.length).toBeGreaterThan(0);
        expect(e.correctAnswer.length).toBeLessThan(e.items.length);
        for (const id of e.correctAnswer) {
          expect(e.items.map((i) => i.id)).toContain(id);
        }
      }
      if (e.interactionType === 'sort-groups') {
        const targetIds = e.targets.map((t) => t.id);
        expect(Object.keys(e.correctAnswer).sort()).toEqual(e.items.map((i) => i.id).sort());
        for (const target of Object.values(e.correctAnswer)) {
          expect(targetIds).toContain(target);
        }
      }
    }
  });

  it('bleibt im Zahlenraum bis 20', () => {
    for (const e of allExercises()) {
      if (e.interactionType === 'number-input') {
        expect(e.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(e.correctAnswer).toBeLessThanOrEqual(20);
      }
      if (e.interactionType === 'move-objects') {
        expect(e.startCount).toBeLessThanOrEqual(20);
        expect(e.moveCount).toBeLessThanOrEqual(e.startCount + e.moveCount);
        expect(e.correctAnswer).toBe(e.moveCount);
      }
      for (const g of e.sceneGroups ?? []) {
        expect(g.count).toBeGreaterThan(0);
        expect(g.count).toBeLessThanOrEqual(20);
      }
    }
  });

  it('wiederholt keine Aufgabenstellung wortgleich mit gleichem Kontext', () => {
    const seen = new Set<string>();
    for (const e of allExercises()) {
      const key = `${e.context ?? ''}|${e.instruction}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('nutzt in der Kontrollaufgabe einen anderen Kontext als in den Übungen', () => {
    for (const lesson of allLessons) {
      const stepTexts = lesson.steps.map((s) => `${s.context ?? ''}${s.instruction}`);
      const transferText = `${lesson.transferTask.context ?? ''}${lesson.transferTask.instruction}`;
      expect(stepTexts).not.toContain(transferText);
    }
  });
});
