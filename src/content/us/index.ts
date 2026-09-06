import type { ContentPack, LearningModule, SkillInfo } from '../../types/content';
import { usModuleAB } from './moduleAB';
import { usModuleCD } from './moduleCD';

const modules: LearningModule[] = [
  { id: 'A', title: 'Reading directions', subtitle: 'circle · choose · sort', emoji: '🔍', tone: 'brand' },
  { id: 'B', title: 'Adding and taking away', subtitle: 'gets bigger · gets smaller', emoji: '🍪', tone: 'turq' },
  { id: 'C', title: 'Comparing', subtitle: 'more · fewer · difference', emoji: '⚖️', tone: 'sun' },
  { id: 'D', title: 'What is the question?', subtitle: 'question · numbers · picture', emoji: '💡', tone: 'ink' },
];

const skills: SkillInfo[] = [
  { id: 'us-instruction-circle', label: { de: 'Alle markieren („circle all")', en: 'Understanding “circle all”', es: 'Entender „circle all"' } },
  { id: 'us-instruction-choose', label: { de: 'Eines auswählen („choose")', en: 'Understanding “choose”', es: 'Entender „choose"' } },
  { id: 'us-instruction-sort', label: { de: 'Zuordnen („sort")', en: 'Understanding “sort”', es: 'Entender „sort"' } },
  { id: 'us-join', label: { de: 'Dazulegen erkennen', en: 'Recognising joining', es: 'Reconocer cuando se agrega' } },
  { id: 'us-separate', label: { de: 'Wegnehmen erkennen', en: 'Recognising taking away', es: 'Reconocer cuando se quita' } },
  { id: 'us-join-or-separate', label: { de: 'Mehr oder weniger entscheiden', en: 'Deciding bigger or smaller', es: 'Decidir si aumenta o disminuye' } },
  { id: 'us-compare', label: { de: 'Mengen vergleichen', en: 'Comparing amounts', es: 'Comparar cantidades' } },
  { id: 'us-difference', label: { de: 'Unterschied bestimmen', en: 'Finding the difference', es: 'Hallar la diferencia' } },
  { id: 'us-make-equal', label: { de: 'Gleich viele machen', en: 'Making amounts equal', es: 'Igualar cantidades' } },
  { id: 'us-find-question', label: { de: 'Frage erkennen', en: 'Identifying the question', es: 'Identificar la pregunta' } },
  { id: 'us-needed-numbers', label: { de: 'Nötige Zahlen finden', en: 'Picking the needed numbers', es: 'Elegir los números necesarios' } },
  { id: 'us-choose-model', label: { de: 'Passendes Bild wählen', en: 'Choosing the right model', es: 'Elegir el modelo correcto' } },
];

/**
 * US-Pack: gleiche Fähigkeiten, amerikanische Aufgabensprache und Kontexte.
 * Hilfssprache: Spanisch (größte Gruppe der English Learners in den USA).
 */
export const usPack: ContentPack = {
  targetLocale: 'en-US',
  nativeLabel: 'English (US)',
  flag: '🇺🇸',
  speechLang: 'en-US',
  modules,
  lessons: [...usModuleAB, ...usModuleCD],
  skills,
  supportLanguages: ['es'],
};
