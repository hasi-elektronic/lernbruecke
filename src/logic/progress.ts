import type { AttemptRecord, LessonCompletion, UiLanguage } from '../data/types';
import { lessonOrder, lessons } from '../content';
import type { Lesson } from '../types/content';

export interface SkillStat {
  skillId: string;
  /** Alle gewerteten Übungen zu diesem Skill. */
  total: number;
  /** Ohne Hilfe im ersten Versuch richtig. */
  unassisted: number;
  /** Nur Kontrollaufgaben (neuer Kontext). */
  transferTotal: number;
  transferUnassisted: number;
  hintsUsed: number;
  /** 0..1, bezogen auf alle Übungen. Null, wenn noch nichts geübt wurde. */
  ratio: number | null;
  /** 0..1, nur Kontrollaufgaben. Null, wenn noch keine gemacht wurde. */
  transferRatio: number | null;
}

export function isLessonCompleted(completions: LessonCompletion[], lessonId: string): boolean {
  return completions.some((c) => c.lessonId === lessonId);
}

export function completedLessonIds(completions: LessonCompletion[]): string[] {
  return Array.from(new Set(completions.map((c) => c.lessonId)));
}

export function skillStats(attempts: AttemptRecord[]): SkillStat[] {
  const map = new Map<string, SkillStat>();
  for (const a of attempts) {
    const stat: SkillStat = map.get(a.skillId) ?? {
      skillId: a.skillId,
      total: 0,
      unassisted: 0,
      transferTotal: 0,
      transferUnassisted: 0,
      hintsUsed: 0,
      ratio: null,
      transferRatio: null,
    };
    stat.total += 1;
    if (a.correctFirstTry) stat.unassisted += 1;
    if (a.isTransfer) {
      stat.transferTotal += 1;
      if (a.correctFirstTry) stat.transferUnassisted += 1;
    }
    stat.hintsUsed += a.hintsUsed;
    map.set(a.skillId, stat);
  }
  for (const stat of map.values()) {
    stat.ratio = stat.total > 0 ? stat.unassisted / stat.total : null;
    stat.transferRatio = stat.transferTotal > 0 ? stat.transferUnassisted / stat.transferTotal : null;
  }
  return Array.from(map.values());
}

export function hintUsageRate(attempts: AttemptRecord[]): number | null {
  if (attempts.length === 0) return null;
  const withHint = attempts.filter((a) => a.hintsUsed > 0).length;
  return withHint / attempts.length;
}

export function supportUsageRate(attempts: AttemptRecord[]): number | null {
  if (attempts.length === 0) return null;
  return attempts.filter((a) => a.usedSupportLanguage).length / attempts.length;
}

const WEAK_THRESHOLD = 0.6;

/**
 * Nächste empfohlene Lektion.
 *
 * Regel (bewusst einfach und nachvollziehbar, keine KI):
 * 1. Ist eine bereits abgeschlossene Lektion schwach gelaufen (Kontrollaufgabe
 *    falsch oder Skill-Quote unter 60 %), wird sie zur Wiederholung empfohlen.
 * 2. Sonst die erste noch nicht abgeschlossene Lektion in fester Reihenfolge.
 * 3. Sind alle abgeschlossen und stark, wird die erste Lektion mit der
 *    schwächsten Quote als freie Wiederholung vorgeschlagen.
 */
export function recommendNextLesson(
  attempts: AttemptRecord[],
  completions: LessonCompletion[],
): { lesson: Lesson; reason: 'repeat-weak' | 'next-new' | 'free-repeat' } {
  const stats = new Map(skillStats(attempts).map((s) => [s.skillId, s]));
  const done = new Set(completedLessonIds(completions));

  for (const id of lessonOrder) {
    if (!done.has(id)) continue;
    const lesson = lessons.find((l) => l.id === id);
    if (!lesson) continue;
    const stat = stats.get(lesson.skillId);
    const lastCompletion = [...completions].reverse().find((c) => c.lessonId === id);
    const weakTransfer = lastCompletion ? !lastCompletion.transferFirstTryCorrect : false;
    const weakRatio = stat?.ratio !== null && stat?.ratio !== undefined && stat.ratio < WEAK_THRESHOLD;
    if (weakTransfer || weakRatio) {
      return { lesson, reason: 'repeat-weak' };
    }
  }

  for (const id of lessonOrder) {
    if (!done.has(id)) {
      const lesson = lessons.find((l) => l.id === id);
      if (lesson) return { lesson, reason: 'next-new' };
    }
  }

  const sorted = [...lessons].sort((a, b) => {
    const ra = stats.get(a.skillId)?.ratio ?? 1;
    const rb = stats.get(b.skillId)?.ratio ?? 1;
    return ra - rb;
  });
  return { lesson: sorted[0] ?? lessons[0], reason: 'free-repeat' };
}

export interface ParentAdvice {
  key: string;
  de: string;
  en: string;
  es: string;
}

/** Konkrete, verständliche Hinweise – nur aus echten Daten abgeleitet. */
export function buildParentAdvice(
  attempts: AttemptRecord[],
  completions: LessonCompletion[],
  skillLabel: (id: string) => Record<UiLanguage, string>,
): ParentAdvice[] {
  const advice: ParentAdvice[] = [];
  if (completions.length === 0) {
    advice.push({
      key: 'no-data',
      de: 'Noch keine abgeschlossene Lektion. Nach der ersten Lektion erscheinen hier echte Auswertungen.',
      en: 'No lesson completed yet. Real figures appear here after the first lesson.',
      es: 'Todavía no hay lecciones completadas. Los datos reales aparecen tras la primera lección.',
    });
    return advice;
  }

  const stats = skillStats(attempts);
  const weak = stats
    .filter((s) => s.ratio !== null && s.total >= 2 && (s.ratio as number) < WEAK_THRESHOLD)
    .sort((a, b) => (a.ratio as number) - (b.ratio as number));

  for (const s of weak.slice(0, 2)) {
    const label = skillLabel(s.skillId);
    advice.push({
      key: `weak-${s.skillId}`,
      de: `„${label.de}" fällt noch schwer (${s.unassisted} von ${s.total} ohne Hilfe richtig). Diese Lektion in den nächsten Tagen wiederholen.`,
      en: `„${label.en}" is still hard (${s.unassisted} of ${s.total} correct without help). Repeat this lesson in the next few days.`,
      es: `„${label.es}" todavía cuesta (${s.unassisted} de ${s.total} correctos sin ayuda). Repitan esta lección en los próximos días.`,
    });
  }

  const strong = stats.filter(
    (s) => s.transferRatio !== null && (s.transferRatio as number) >= 1 && s.transferTotal >= 1,
  );
  if (strong.length > 0) {
    const label = skillLabel(strong[0].skillId);
    advice.push({
      key: `strong-${strong[0].skillId}`,
      de: `„${label.de}" sitzt: Die Kontrollaufgabe im neuen Kontext wurde ohne Hilfe gelöst.`,
      en: `„${label.en}" is solid: the check task in a new context was solved without help.`,
      es: `„${label.es}" está afianzado: el ejercicio de control en un contexto nuevo se resolvió sin ayuda.`,
    });
  }

  const hintRate = hintUsageRate(attempts);
  if (hintRate !== null && hintRate > 0.5) {
    advice.push({
      key: 'many-hints',
      de: 'Hilfen werden bei über der Hälfte der Aufgaben genutzt. Vor dem Antworten die Aufgabe gemeinsam laut vorlesen lassen.',
      en: 'Hints are used on more than half the tasks. Read the task out loud together before answering.',
      es: 'Se usan ayudas en más de la mitad de los ejercicios. Lean el enunciado en voz alta juntos antes de responder.',
    });
  }

  const supportRate = supportUsageRate(attempts);
  if (supportRate !== null && supportRate > 0.4) {
    advice.push({
      key: 'many-support',
      de: 'Die Hilfe in der Heimatsprache wird oft gebraucht. Die deutschen Schlüsselwörter (markiere, zusammen, noch, mehr) gezielt üben.',
      en: 'The home-language help is used often. Practise the German key words (markiere, zusammen, noch, mehr) separately.',
      es: 'La ayuda en el idioma del hogar se usa a menudo. Practiquen aparte las palabras clave en alemán (markiere, zusammen, noch, mehr).',
    });
  }

  if (advice.length === 0) {
    advice.push({
      key: 'ok',
      de: 'Die letzten Lektionen liefen stabil. Ein bis zwei kurze Einheiten pro Tag reichen aus.',
      en: 'The recent lessons went steadily. One or two short sessions a day are enough.',
      es: 'Las últimas lecciones fueron estables. Una o dos sesiones cortas al día son suficientes.',
    });
  }
  return advice;
}
