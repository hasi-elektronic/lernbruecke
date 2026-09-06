/**
 * Inhaltsmodell für Lernbrücke.
 *
 * Regel: Aufgabeninhalte liegen ausschließlich als Daten vor (siehe src/content).
 * Die React-Komponenten kennen nur die `interactionType`-Varianten, niemals
 * konkrete Aufgabentexte. Eine neue Lektion = ein neues Datenobjekt.
 */

export type InteractionType =
  | 'select-one'
  | 'select-multiple'
  | 'sort-groups'
  | 'move-objects'
  | 'number-input';

export interface VisualItem {
  id: string;
  label: string;
  emoji?: string;
}

export interface SceneGroup {
  label: string;
  emoji: string;
  count: number;
}

export interface SortTarget {
  id: string;
  label: string;
}

interface ExerciseBase {
  id: string;
  /** Arbeitsanweisung in einfachem Deutsch (wird vorgelesen). */
  instruction: string;
  /** Optionaler Kontext/Story-Satz nur für diese Übung. */
  context?: string;
  /** Optionale Bild-Szene (zwei Mengen nebeneinander o. ä.). */
  sceneGroups?: SceneGroup[];
  /** Stufe 1: kurzer, sichtbarer Hinweis. */
  hint: string;
  /** Stufe 2: ausführlichere Erklärung auf Deutsch. */
  hintDetail: string;
  /** Erklärung der mathematischen Beziehung nach der Antwort. */
  explanation: string;
}

export interface SelectOneExercise extends ExerciseBase {
  interactionType: 'select-one';
  items: VisualItem[];
  correctAnswer: string;
}

export interface SelectMultipleExercise extends ExerciseBase {
  interactionType: 'select-multiple';
  items: VisualItem[];
  correctAnswer: string[];
}

export interface SortGroupsExercise extends ExerciseBase {
  interactionType: 'sort-groups';
  targets: SortTarget[];
  items: VisualItem[];
  /** itemId -> targetId */
  correctAnswer: Record<string, string>;
}

export interface MoveObjectsExercise extends ExerciseBase {
  interactionType: 'move-objects';
  /** 'add' = aus dem Vorrat dazulegen, 'remove' = wegnehmen. */
  mode: 'add' | 'remove';
  emoji: string;
  objectLabel: string;
  startCount: number;
  moveCount: number;
  sourceLabel: string;
  targetLabel: string;
  /** Anzahl der Objekte, die bewegt werden müssen. */
  correctAnswer: number;
}

export interface NumberInputExercise extends ExerciseBase {
  interactionType: 'number-input';
  unit: string;
  correctAnswer: number;
}

export type Exercise =
  | SelectOneExercise
  | SelectMultipleExercise
  | SortGroupsExercise
  | MoveObjectsExercise
  | NumberInputExercise;

export type AnswerValue = string | string[] | Record<string, string> | number | null;

export interface Lesson {
  id: string;
  moduleId: ModuleId;
  skillId: string;
  title: string;
  objective: string;
  /** Einstiegs-Geschichte, wird auf dem ersten Schritt vorgelesen. */
  story?: string;
  steps: Exercise[];
  /** Kontrollaufgabe in neuem Kontext – wird ohne Hilfe gewertet. */
  transferTask: Exercise;
}

export type ModuleId = 'A' | 'B' | 'C' | 'D';

/** Sprache, in der die Aufgaben gestellt sind – das ist die Sprache, die das
 *  Kind verstehen lernen soll. Ein Content-Pack pro Ziel-Locale. */
export type TargetLocale = 'de-DE' | 'en-US';

/** Sprache, die zu Hause gesprochen wird. Wird NUR als Verständnisbrücke
 *  eingeblendet, nie als Ersatz für die Zielsprache. */
export type SupportLanguage = 'tr' | 'es' | 'en' | 'de';

export interface SupportEntry {
  hint: string;
  explanation: string;
}

/** exerciseId -> Hilfstext. Eine neue Sprache ist reine Datenarbeit. */
export type SupportPack = Record<string, SupportEntry>;

export interface LearningModule {
  id: ModuleId;
  title: string;
  subtitle: string;
  emoji: string;
  /** Tailwind-Farbklassen-Schlüssel für die Aufgabenkarte. */
  tone: 'brand' | 'turq' | 'sun' | 'ink';
}

export interface SkillInfo {
  id: string;
  /** Bezeichnung je Oberflächensprache. */
  label: { de: string; en: string; es: string };
}
