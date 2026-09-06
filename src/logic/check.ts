import type { AnswerValue, Exercise } from '../types/content';

function sameStringSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

/** Prüft die Antwort gegen die Musterlösung der Übung. */
export function checkAnswer(exercise: Exercise, answer: AnswerValue): boolean {
  switch (exercise.interactionType) {
    case 'select-one':
      return typeof answer === 'string' && answer === exercise.correctAnswer;

    case 'select-multiple':
      return Array.isArray(answer) && sameStringSet(answer, exercise.correctAnswer);

    case 'sort-groups': {
      if (typeof answer !== 'object' || answer === null || Array.isArray(answer)) return false;
      const given = answer as Record<string, string>;
      const expected = exercise.correctAnswer;
      const keys = Object.keys(expected);
      if (Object.keys(given).length !== keys.length) return false;
      return keys.every((k) => given[k] === expected[k]);
    }

    case 'move-objects':
      return typeof answer === 'number' && answer === exercise.correctAnswer;

    case 'number-input':
      return typeof answer === 'number' && answer === exercise.correctAnswer;

    default:
      return false;
  }
}

/** Wie viele Teilentscheidungen sind noch offen? Steuert den „Fertig"-Button. */
export function isAnswerComplete(exercise: Exercise, answer: AnswerValue): boolean {
  switch (exercise.interactionType) {
    case 'select-one':
      return typeof answer === 'string' && answer.length > 0;
    case 'select-multiple':
      return Array.isArray(answer) && answer.length > 0;
    case 'sort-groups':
      return (
        typeof answer === 'object' &&
        answer !== null &&
        !Array.isArray(answer) &&
        Object.keys(answer as Record<string, string>).length === exercise.items.length
      );
    case 'move-objects':
      return typeof answer === 'number';
    case 'number-input':
      return typeof answer === 'number' && Number.isFinite(answer);
    default:
      return false;
  }
}
