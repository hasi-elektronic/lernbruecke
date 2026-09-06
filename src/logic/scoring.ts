/**
 * Bewertungsregeln der Lektion – bewusst als reine Funktionen, damit sie
 * getestet werden können und nicht in Komponenten versteckt sind.
 */

/** Eine Aufgabe zählt nur dann als „allein geschafft", wenn sie im ersten
 *  Versuch UND ohne jede Hilfe richtig war. */
export function isUnassisted(tries: number, hintsUsed: number): boolean {
  return tries === 1 && hintsUsed === 0;
}

export interface LessonTotals {
  unassisted: number;
  hints: number;
  transferOk: boolean;
}

export function applyResult(
  totals: LessonTotals,
  input: { unassisted: boolean; hintsUsed: number; isTransfer: boolean },
): LessonTotals {
  return {
    unassisted: totals.unassisted + (input.unassisted ? 1 : 0),
    hints: totals.hints + input.hintsUsed,
    transferOk: input.isTransfer ? input.unassisted : totals.transferOk,
  };
}
