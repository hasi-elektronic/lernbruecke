import type { ContentPack, LearningModule, Lesson, SkillInfo, TargetLocale } from '../types/content';
import { moduleALessons } from './moduleA';
import { moduleBLessons } from './moduleB';
import { moduleCLessons } from './moduleC';
import { moduleDLessons } from './moduleD';
import { usPack } from './us';

const modules: LearningModule[] = [
  { id: 'A', title: 'Aufgaben verstehen', subtitle: 'markieren · auswählen · zuordnen', emoji: '🔍', tone: 'brand' },
  { id: 'B', title: 'Dazu und weg', subtitle: 'mehr werden · weniger werden', emoji: '🍪', tone: 'turq' },
  { id: 'C', title: 'Vergleichen', subtitle: 'mehr · weniger · Unterschied', emoji: '⚖️', tone: 'sun' },
  { id: 'D', title: 'Was ist gefragt?', subtitle: 'Frage · Zahlen · Bild', emoji: '💡', tone: 'ink' },
];

const lessons: Lesson[] = [
  ...moduleALessons,
  ...moduleBLessons,
  ...moduleCLessons,
  ...moduleDLessons,
];

const skills: SkillInfo[] = [
  { id: 'anweisung-markieren', label: { de: 'Markieren verstehen', en: 'Understanding „mark all"', es: 'Entender „marcar todo"' } },
  { id: 'anweisung-auswaehlen', label: { de: 'Auswählen verstehen', en: 'Understanding „choose one"', es: 'Entender „elegir uno"' } },
  { id: 'anweisung-zuordnen', label: { de: 'Zuordnen verstehen', en: 'Understanding „sort into groups"', es: 'Entender „clasificar"' } },
  { id: 'dazu-rechnen', label: { de: 'Dazulegen erkennen', en: 'Recognising adding on', es: 'Reconocer cuando se agrega' } },
  { id: 'weg-rechnen', label: { de: 'Wegnehmen erkennen', en: 'Recognising taking away', es: 'Reconocer cuando se quita' } },
  { id: 'dazu-oder-weg', label: { de: 'Mehr oder weniger entscheiden', en: 'Deciding more or fewer', es: 'Decidir si aumenta o disminuye' } },
  { id: 'vergleichen-mehr-weniger', label: { de: 'Mengen vergleichen', en: 'Comparing amounts', es: 'Comparar cantidades' } },
  { id: 'unterschied-bestimmen', label: { de: 'Unterschied bestimmen', en: 'Finding the difference', es: 'Hallar la diferencia' } },
  { id: 'ausgleichen', label: { de: 'Gleich viele machen', en: 'Making amounts equal', es: 'Igualar cantidades' } },
  { id: 'frage-erkennen', label: { de: 'Frage erkennen', en: 'Identifying the question', es: 'Identificar la pregunta' } },
  { id: 'zahlen-auswaehlen', label: { de: 'Nötige Zahlen finden', en: 'Picking the needed numbers', es: 'Elegir los números necesarios' } },
  { id: 'modell-waehlen', label: { de: 'Passendes Bild wählen', en: 'Choosing the right model', es: 'Elegir el modelo correcto' } },
];

export const dePack: ContentPack = {
  targetLocale: 'de-DE',
  nativeLabel: 'Deutsch',
  flag: '🇩🇪',
  speechLang: 'de-DE',
  modules,
  lessons,
  skills,
  supportLanguages: ['tr', 'es', 'en'],
};

export const contentPacks: Record<TargetLocale, ContentPack> = {
  'de-DE': dePack,
  'en-US': usPack,
};

export const packList: ContentPack[] = [dePack, usPack];

export function getPack(locale: TargetLocale): ContentPack {
  return contentPacks[locale] ?? dePack;
}

export function getLesson(pack: ContentPack, id: string): Lesson | undefined {
  return pack.lessons.find((l) => l.id === id);
}

export function lessonsOfModule(pack: ContentPack, moduleId: LearningModule['id']): Lesson[] {
  return pack.lessons.filter((l) => l.moduleId === moduleId);
}

export function getSkill(pack: ContentPack, id: string): SkillInfo | undefined {
  return pack.skills.find((s) => s.id === id);
}

/** Reihenfolge, in der Lektionen innerhalb eines Packs empfohlen werden. */
export function lessonOrder(pack: ContentPack): string[] {
  return pack.lessons.map((l) => l.id);
}
