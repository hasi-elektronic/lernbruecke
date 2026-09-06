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
  labelDe: string;
  emoji?: string;
}

export interface SceneGroup {
  labelDe: string;
  emoji: string;
  count: number;
}

export interface SortTarget {
  id: string;
  labelDe: string;
}

interface ExerciseBase {
  id: string;
  /** Arbeitsanweisung in einfachem Deutsch (wird vorgelesen). */
  instructionDe: string;
  /** Optionaler Kontext/Story-Satz nur für diese Übung. */
  contextDe?: string;
  /** Optionale Bild-Szene (zwei Mengen nebeneinander o. ä.). */
  sceneGroups?: SceneGroup[];
  /** Stufe 1: kurzer, sichtbarer Hinweis. */
  hintDe: string;
  /** Stufe 2: ausführlichere Erklärung auf Deutsch. */
  hintDetailDe: string;
  /** Stufe 3: türkische Hilfe (nur auf Wunsch). */
  hintTr: string;
  /** Erklärung der mathematischen Beziehung nach der Antwort. */
  explanationDe: string;
  explanationTr: string;
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
  objectLabelDe: string;
  startCount: number;
  moveCount: number;
  sourceLabelDe: string;
  targetLabelDe: string;
  /** Anzahl der Objekte, die bewegt werden müssen. */
  correctAnswer: number;
}

export interface NumberInputExercise extends ExerciseBase {
  interactionType: 'number-input';
  unitDe: string;
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
  titleDe: string;
  objectiveDe: string;
  /** Einstiegs-Geschichte, wird auf dem ersten Schritt vorgelesen. */
  storyDe?: string;
  steps: Exercise[];
  /** Kontrollaufgabe in neuem Kontext – wird ohne Hilfe gewertet. */
  transferTask: Exercise;
}

export type ModuleId = 'A' | 'B' | 'C' | 'D';

export interface LearningModule {
  id: ModuleId;
  titleDe: string;
  subtitleDe: string;
  emoji: string;
  /** Tailwind-Farbklassen-Schlüssel für die Aufgabenkarte. */
  tone: 'brand' | 'turq' | 'sun' | 'ink';
}

export interface SkillInfo {
  id: string;
  labelDe: string;
  labelTr: string;
}
