import type { LessonResult } from './LessonScreen';
import { getLesson } from '../content';

export function LessonEnd({ result, onHome }: { result: LessonResult; onHome: () => void }) {
  const lesson = getLesson(result.lessonId);
  const withHelp = result.exerciseCount - result.unassistedCorrect;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="lb-card lb-pop p-6 text-center">
        <p className="text-5xl" aria-hidden="true">
          🎈
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink-900">Fertig!</h1>
        {lesson ? (
          <p className="mt-2 text-lg text-ink-800">
            Du hast geübt: <strong>{lesson.objective}</strong>
          </p>
        ) : null}

        <dl className="mt-6 grid gap-3 text-left">
          <div className="flex items-center justify-between rounded-2xl bg-turq-200/40 p-4">
            <dt className="text-base font-bold text-ink-800">✅ Allein geschafft</dt>
            <dd className="text-2xl font-extrabold text-ink-900">
              {result.unassistedCorrect} / {result.exerciseCount}
            </dd>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-brand-50 p-4">
            <dt className="text-base font-bold text-ink-800">💡 Mit Tipp geschafft</dt>
            <dd className="text-2xl font-extrabold text-ink-900">{withHelp}</dd>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-sun-100 p-4">
            <dt className="text-base font-bold text-ink-800">⭐ Neue Aufgabe allein gelöst</dt>
            <dd className="text-xl font-extrabold text-ink-900">
              {result.transferFirstTryCorrect ? 'ja' : 'noch nicht'}
            </dd>
          </div>
        </dl>

        <p className="mt-5 text-base text-ink-700">
          Tipps zu benutzen ist erlaubt. Beim nächsten Mal klappt mehr allein.
        </p>

        <button type="button" onClick={onHome} className="lb-btn-primary mt-6 w-full">
          Für heute fertig
        </button>
      </div>
    </div>
  );
}
