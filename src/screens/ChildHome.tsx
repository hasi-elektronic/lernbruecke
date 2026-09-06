import { lessons, lessonsOfModule, modules } from '../content';
import { completedLessonIds, recommendNextLesson } from '../logic/progress';
import { useAppState } from '../state';

const toneClasses: Record<string, string> = {
  brand: 'border-brand-300 bg-brand-50',
  turq: 'border-turq-300 bg-turq-200/40',
  sun: 'border-sun-300 bg-sun-100',
  ink: 'border-brand-200 bg-white',
};

export function ChildHome({
  onStartLesson,
  onParentArea,
}: {
  onStartLesson: (lessonId: string) => void;
  onParentArea: () => void;
}) {
  const { data } = useAppState();
  const done = new Set(completedLessonIds(data.completions));
  const recommendation = recommendNextLesson(data.attempts, data.completions);
  const name = data.profile?.nickname ?? '';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-5">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden="true">
            {data.profile?.avatar}
          </span>
          <h1 className="text-2xl font-extrabold text-ink-900">Hallo, {name}!</h1>
        </div>
        <button
          type="button"
          onClick={onParentArea}
          className="focus-ring rounded-2xl bg-white px-4 py-3 text-sm font-bold text-brand-700 shadow-sm"
        >
          👤 Eltern
        </button>
      </header>

      <section className="lb-card mb-6 p-5">
        <p className="text-base font-bold text-brand-700">
          {recommendation.reason === 'repeat-weak'
            ? 'Das üben wir noch einmal:'
            : recommendation.reason === 'free-repeat'
              ? 'Du hast alles geschafft! Noch einmal üben:'
              : 'Deine nächste Aufgabe:'}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-ink-900">{recommendation.lesson.title}</h2>
        <p className="mt-1 text-base text-ink-700">{recommendation.lesson.objective}</p>
        <button
          type="button"
          onClick={() => onStartLesson(recommendation.lesson.id)}
          className="lb-btn-primary mt-4 w-full text-xl"
        >
          ▶︎ Weiterlernen
        </button>
        <p className="mt-3 text-sm text-ink-700">
          Geschafft: {done.size} von {lessons.length} Lektionen
        </p>
      </section>

      <h2 className="mb-3 text-xl font-extrabold text-ink-900">Deine Lernorte</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <section key={m.id} className={`rounded-3xl border-4 p-4 ${toneClasses[m.tone]}`}>
            <p className="text-3xl" aria-hidden="true">
              {m.emoji}
            </p>
            <h3 className="mt-1 text-lg font-extrabold text-ink-900">{m.title}</h3>
            <p className="text-sm text-ink-700">{m.subtitle}</p>
            <ul className="mt-3 space-y-2">
              {lessonsOfModule(m.id).map((lesson) => {
                const isDone = done.has(lesson.id);
                const isNext = recommendation.lesson.id === lesson.id;
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => onStartLesson(lesson.id)}
                      className={`focus-ring flex w-full items-center gap-3 rounded-2xl bg-white/90 p-3 text-left hover:bg-white ${
                        isNext ? 'ring-4 ring-brand-300' : ''
                      }`}
                    >
                      <span aria-hidden="true" className="text-2xl">
                        {isDone ? '✅' : isNext ? '⭐' : '⬜'}
                      </span>
                      <span className="flex-1">
                        <span className="block text-base font-bold text-ink-900">{lesson.title}</span>
                        <span className="block text-xs font-bold uppercase tracking-wide text-ink-700/70">
                          {isDone ? 'geschafft' : isNext ? 'als Nächstes' : 'offen'}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
