import { describe, expect, it } from 'vitest';
import { lessons, lessonsOfModule, modules, skills } from './index';
import type { Exercise } from '../types/content';

function allExercises(): Exercise[] {
  return lessons.flatMap((l) => [...l.steps, l.transferTask]);
}

describe('Lektionsbestand', () => {
  it('enthält 12 Lektionen, 3 je Modul', () => {
    expect(lessons).toHaveLength(12);
    for (const m of modules) {
      expect(lessonsOfModule(m.id)).toHaveLength(3);
    }
  });

  it('hat eindeutige Lektions- und Übungs-IDs', () => {
    const lessonIds = lessons.map((l) => l.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
    const exerciseIds = allExercises().map((e) => e.id);
    expect(new Set(exerciseIds).size).toBe(exerciseIds.length);
  });

  it('nutzt nur registrierte Skills', () => {
    const known = new Set(skills.map((s) => s.id));
    for (const lesson of lessons) {
      expect(known.has(lesson.skillId)).toBe(true);
    }
  });

  it('hat je Lektion mindestens zwei Übungen plus Kontrollaufgabe', () => {
    for (const lesson of lessons) {
      expect(lesson.steps.length).toBeGreaterThanOrEqual(2);
      expect(lesson.transferTask).toBeTruthy();
      expect(lesson.titleDe.length).toBeGreaterThan(3);
      expect(lesson.objectiveDe.length).toBeGreaterThan(10);
    }
  });

  it('hat überall alle drei Hilfestufen und eine Erklärung', () => {
    for (const e of allExercises()) {
      expect(e.instructionDe.trim().length).toBeGreaterThan(3);
      expect(e.hintDe.trim().length).toBeGreaterThan(3);
      expect(e.hintDetailDe.trim().length).toBeGreaterThan(3);
      expect(e.hintTr.trim().length).toBeGreaterThan(3);
      expect(e.explanationDe.trim().length).toBeGreaterThan(3);
      expect(e.explanationTr.trim().length).toBeGreaterThan(3);
      expect(e.hintDetailDe).not.toBe(e.hintDe);
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
      const key = `${e.contextDe ?? ''}|${e.instructionDe}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('nutzt in der Kontrollaufgabe einen anderen Kontext als in den Übungen', () => {
    for (const lesson of lessons) {
      const stepTexts = lesson.steps.map((s) => `${s.contextDe ?? ''}${s.instructionDe}`);
      const transferText = `${lesson.transferTask.contextDe ?? ''}${lesson.transferTask.instructionDe}`;
      expect(stepTexts).not.toContain(transferText);
    }
  });
});
