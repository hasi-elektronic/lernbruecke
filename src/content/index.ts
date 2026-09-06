import type { LearningModule, Lesson, SkillInfo } from '../types/content';
import { moduleALessons } from './moduleA';
import { moduleBLessons } from './moduleB';
import { moduleCLessons } from './moduleC';
import { moduleDLessons } from './moduleD';

export const modules: LearningModule[] = [
  { id: 'A', titleDe: 'Aufgaben verstehen', subtitleDe: 'markieren · auswählen · zuordnen', emoji: '🔍', tone: 'brand' },
  { id: 'B', titleDe: 'Dazu und weg', subtitleDe: 'mehr werden · weniger werden', emoji: '🍪', tone: 'turq' },
  { id: 'C', titleDe: 'Vergleichen', subtitleDe: 'mehr · weniger · Unterschied', emoji: '⚖️', tone: 'sun' },
  { id: 'D', titleDe: 'Was ist gefragt?', subtitleDe: 'Frage · Zahlen · Bild', emoji: '💡', tone: 'ink' },
];

export const lessons: Lesson[] = [
  ...moduleALessons,
  ...moduleBLessons,
  ...moduleCLessons,
  ...moduleDLessons,
];

export const skills: SkillInfo[] = [
  { id: 'anweisung-markieren', labelDe: 'Markieren verstehen', labelTr: 'İşaretleme yönergesi' },
  { id: 'anweisung-auswaehlen', labelDe: 'Auswählen verstehen', labelTr: 'Seçme yönergesi' },
  { id: 'anweisung-zuordnen', labelDe: 'Zuordnen verstehen', labelTr: 'Eşleştirme yönergesi' },
  { id: 'dazu-rechnen', labelDe: 'Dazulegen erkennen', labelTr: 'Ekleme durumunu tanıma' },
  { id: 'weg-rechnen', labelDe: 'Wegnehmen erkennen', labelTr: 'Çıkarma durumunu tanıma' },
  { id: 'dazu-oder-weg', labelDe: 'Mehr oder weniger entscheiden', labelTr: 'Artıyor mu azalıyor mu' },
  { id: 'vergleichen-mehr-weniger', labelDe: 'Mengen vergleichen', labelTr: 'Miktar karşılaştırma' },
  { id: 'unterschied-bestimmen', labelDe: 'Unterschied bestimmen', labelTr: 'Farkı bulma' },
  { id: 'ausgleichen', labelDe: 'Gleich viele machen', labelTr: 'Eşitleme' },
  { id: 'frage-erkennen', labelDe: 'Frage erkennen', labelTr: 'Soruyu anlama' },
  { id: 'zahlen-auswaehlen', labelDe: 'Nötige Zahlen finden', labelTr: 'Gerekli sayıları bulma' },
  { id: 'modell-waehlen', labelDe: 'Passendes Bild wählen', labelTr: 'Uygun modeli seçme' },
];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function lessonsOfModule(moduleId: LearningModule['id']): Lesson[] {
  return lessons.filter((l) => l.moduleId === moduleId);
}

export function getSkill(id: string): SkillInfo | undefined {
  return skills.find((s) => s.id === id);
}

/** Reihenfolge, in der Lektionen empfohlen werden. */
export const lessonOrder: string[] = lessons.map((l) => l.id);
