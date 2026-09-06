import { describe, expect, it } from 'vitest';
import { checkAnswer, isAnswerComplete } from './check';
import { applyResult, isUnassisted } from './scoring';
import type { Exercise } from '../types/content';

const base = {
  hintDe: 'h',
  hintDetailDe: 'hd',
  hintTr: 'ht',
  explanationDe: 'e',
  explanationTr: 'et',
};

const selectOne: Exercise = {
  ...base,
  id: 'x1',
  interactionType: 'select-one',
  instructionDe: 'Wähle aus.',
  items: [
    { id: 'a', labelDe: 'A' },
    { id: 'b', labelDe: 'B' },
  ],
  correctAnswer: 'b',
};

const selectMultiple: Exercise = {
  ...base,
  id: 'x2',
  interactionType: 'select-multiple',
  instructionDe: 'Markiere alle.',
  items: [
    { id: 'a', labelDe: 'A' },
    { id: 'b', labelDe: 'B' },
    { id: 'c', labelDe: 'C' },
  ],
  correctAnswer: ['a', 'c'],
};

const sortGroups: Exercise = {
  ...base,
  id: 'x3',
  interactionType: 'sort-groups',
  instructionDe: 'Ordne zu.',
  targets: [
    { id: 't1', labelDe: 'T1' },
    { id: 't2', labelDe: 'T2' },
  ],
  items: [
    { id: 'i1', labelDe: 'I1' },
    { id: 'i2', labelDe: 'I2' },
  ],
  correctAnswer: { i1: 't1', i2: 't2' },
};

const moveObjects: Exercise = {
  ...base,
  id: 'x4',
  interactionType: 'move-objects',
  instructionDe: 'Bewege 3.',
  mode: 'remove',
  emoji: '🔵',
  objectLabelDe: 'Murmel',
  startCount: 8,
  moveCount: 3,
  sourceLabelDe: 'Mina',
  targetLabelDe: 'Ben',
  correctAnswer: 3,
};

const numberInput: Exercise = {
  ...base,
  id: 'x5',
  interactionType: 'number-input',
  instructionDe: 'Wie viele?',
  unitDe: 'Murmeln',
  correctAnswer: 5,
};

describe('checkAnswer', () => {
  it('akzeptiert nur die richtige Einzelauswahl', () => {
    expect(checkAnswer(selectOne, 'b')).toBe(true);
    expect(checkAnswer(selectOne, 'a')).toBe(false);
    expect(checkAnswer(selectOne, null)).toBe(false);
  });

  it('prüft Mehrfachauswahl unabhängig von der Reihenfolge', () => {
    expect(checkAnswer(selectMultiple, ['c', 'a'])).toBe(true);
    expect(checkAnswer(selectMultiple, ['a'])).toBe(false);
    expect(checkAnswer(selectMultiple, ['a', 'b', 'c'])).toBe(false);
  });

  it('verlangt bei Zuordnung jedes Element am richtigen Platz', () => {
    expect(checkAnswer(sortGroups, { i1: 't1', i2: 't2' })).toBe(true);
    expect(checkAnswer(sortGroups, { i1: 't2', i2: 't1' })).toBe(false);
    expect(checkAnswer(sortGroups, { i1: 't1' })).toBe(false);
  });

  it('prüft bewegte Objekte und Zahleneingabe exakt', () => {
    expect(checkAnswer(moveObjects, 3)).toBe(true);
    expect(checkAnswer(moveObjects, 4)).toBe(false);
    expect(checkAnswer(numberInput, 5)).toBe(true);
    expect(checkAnswer(numberInput, 50)).toBe(false);
    expect(checkAnswer(numberInput, '5' as unknown as number)).toBe(false);
  });
});

describe('isAnswerComplete', () => {
  it('gibt den Fertig-Button erst bei vollständiger Antwort frei', () => {
    expect(isAnswerComplete(selectMultiple, [])).toBe(false);
    expect(isAnswerComplete(selectMultiple, ['a'])).toBe(true);
    expect(isAnswerComplete(sortGroups, { i1: 't1' })).toBe(false);
    expect(isAnswerComplete(sortGroups, { i1: 't1', i2: 't1' })).toBe(true);
    expect(isAnswerComplete(numberInput, null)).toBe(false);
    expect(isAnswerComplete(moveObjects, 0)).toBe(true);
  });
});

describe('Bewertung', () => {
  it('wertet nur fehlerfreie Lösungen ohne Hilfe als „allein geschafft"', () => {
    expect(isUnassisted(1, 0)).toBe(true);
    expect(isUnassisted(1, 1)).toBe(false);
    expect(isUnassisted(2, 0)).toBe(false);
  });

  it('summiert Ergebnisse und merkt sich die Kontrollaufgabe getrennt', () => {
    let totals = { unassisted: 0, hints: 0, transferOk: false };
    totals = applyResult(totals, { unassisted: true, hintsUsed: 0, isTransfer: false });
    totals = applyResult(totals, { unassisted: false, hintsUsed: 2, isTransfer: false });
    totals = applyResult(totals, { unassisted: true, hintsUsed: 0, isTransfer: true });
    expect(totals).toEqual({ unassisted: 2, hints: 2, transferOk: true });
  });

  it('markiert die Kontrollaufgabe als nicht bestanden, wenn Hilfe nötig war', () => {
    const totals = applyResult({ unassisted: 3, hints: 0, transferOk: false }, {
      unassisted: false,
      hintsUsed: 1,
      isTransfer: true,
    });
    expect(totals.transferOk).toBe(false);
  });
});
