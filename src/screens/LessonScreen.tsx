import { useMemo, useState } from 'react';
import { FeedbackBox, ProgressDots, SceneView, SpeakButton } from '../components/common';
import { ExerciseView } from '../components/exercises';
import { checkAnswer, isAnswerComplete } from '../logic/check';
import { applyResult, isUnassisted } from '../logic/scoring';
import type { AnswerValue, Exercise, Lesson } from '../types/content';
import type { AttemptRecord, LessonCompletion } from '../data/types';
import { useAppState } from '../state';

export interface LessonResult {
  lessonId: string;
  exerciseCount: number;
  unassistedCorrect: number;
  hintsUsed: number;
  transferFirstTryCorrect: boolean;
}

/** Erklärt, WARUM etwas nicht stimmt – ohne die Lösung zu verraten. */
function wrongReason(exercise: Exercise, answer: AnswerValue): string {
  switch (exercise.interactionType) {
    case 'select-multiple': {
      const given = Array.isArray(answer) ? answer : [];
      const correct = exercise.correctAnswer;
      const missing = correct.filter((id) => !given.includes(id)).length;
      const extra = given.filter((id) => !correct.includes(id)).length;
      if (extra > 0 && missing > 0) return 'Etwas Falsches ist markiert und etwas Passendes fehlt noch. Schau jedes Bild einzeln an.';
      if (extra > 0) return 'Ein markiertes Bild passt nicht zur Aufgabe. Prüfe jedes markierte Bild noch einmal.';
      return 'Es fehlt noch etwas. Denk daran: Bei „markiere" zeigst du alle passenden Dinge.';
    }
    case 'number-input': {
      if (typeof answer !== 'number') return 'Es fehlt noch eine Zahl.';
      return answer > exercise.correctAnswer
        ? 'Deine Zahl ist zu groß. Zähle noch einmal langsam nach.'
        : 'Deine Zahl ist zu klein. Zähle noch einmal langsam nach.';
    }
    case 'move-objects':
      return 'Die Anzahl passt noch nicht zur Geschichte. Lies noch einmal, wie viele bewegt werden.';
    case 'sort-groups': {
      const given = typeof answer === 'object' && answer !== null && !Array.isArray(answer) ? (answer as Record<string, string>) : {};
      const wrongCount = Object.keys(exercise.correctAnswer).filter((k) => given[k] !== exercise.correctAnswer[k]).length;
      return `${wrongCount === 1 ? 'Ein Ding liegt' : `${wrongCount} Dinge liegen`} noch am falschen Platz. Tippe darauf, um es zurückzulegen.`;
    }
    case 'select-one':
      return 'Diese Antwort passt noch nicht. Lies die Aufgabe noch einmal und vergleiche die Möglichkeiten.';
    default:
      return 'Versuch es noch einmal.';
  }
}

export function LessonScreen({
  lesson,
  onExit,
  onFinish,
}: {
  lesson: Lesson;
  onExit: () => void;
  onFinish: (result: LessonResult) => void;
}) {
  const { data, addAttempt, addCompletion } = useAppState();
  const turkishHelpAllowed = data.profile?.turkishHelp ?? false;
  const soundEnabled = data.settings.soundEnabled;

  const allSteps = useMemo<Exercise[]>(() => [...lesson.steps, lesson.transferTask], [lesson]);
  const transferIndex = allSteps.length - 1;

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<AnswerValue>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [showTr, setShowTr] = useState(false);
  const [tries, setTries] = useState(0);
  const [state, setState] = useState<'answering' | 'wrong' | 'correct'>('answering');
  const [totals, setTotals] = useState({ unassisted: 0, hints: 0, transferOk: false });

  const exercise = allSteps[index];
  const isTransfer = index === transferIndex;
  const hintsUsedHere = hintLevel + (showTr ? 1 : 0);

  const readAloudText = [
    index === 0 && lesson.storyDe ? lesson.storyDe : '',
    exercise.contextDe ?? '',
    exercise.instructionDe,
  ]
    .filter(Boolean)
    .join(' ');

  const resetForNext = () => {
    setAnswer(null);
    setHintLevel(0);
    setShowTr(false);
    setTries(0);
    setState('answering');
  };

  const handleCheck = () => {
    if (!isAnswerComplete(exercise, answer)) return;
    const correct = checkAnswer(exercise, answer);
    const nextTries = tries + 1;
    setTries(nextTries);

    if (!correct) {
      setState('wrong');
      // Beim ersten Fehler kommt automatisch der erste (visuelle) Hinweis.
      if (hintLevel === 0) setHintLevel(1);
      return;
    }

    const unassisted = isUnassisted(nextTries, hintsUsedHere);
    const record: AttemptRecord = {
      lessonId: lesson.id,
      exerciseId: exercise.id,
      skillId: lesson.skillId,
      isTransfer,
      correctFirstTry: unassisted,
      hintsUsed: hintsUsedHere,
      usedTurkishHelp: showTr,
      attempts: nextTries,
      timestamp: Date.now(),
    };
    addAttempt(record);
    setTotals((t) => applyResult(t, { unassisted, hintsUsed: hintsUsedHere, isTransfer }));
    setState('correct');
  };

  const handleNext = () => {
    if (index < transferIndex) {
      setIndex(index + 1);
      resetForNext();
      return;
    }
    const completion: LessonCompletion = {
      lessonId: lesson.id,
      skillId: lesson.skillId,
      completedAt: Date.now(),
      exerciseCount: allSteps.length,
      unassistedCorrect: totals.unassisted,
      hintsUsed: totals.hints,
      transferFirstTryCorrect: totals.transferOk,
    };
    addCompletion(completion);
    onFinish({
      lessonId: lesson.id,
      exerciseCount: allSteps.length,
      unassistedCorrect: totals.unassisted,
      hintsUsed: totals.hints,
      transferFirstTryCorrect: totals.transferOk,
    });
  };

  const locked = state === 'correct';

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-4">
      <header className="mb-4 flex items-center justify-between gap-3">
        <button type="button" onClick={onExit} className="focus-ring rounded-2xl bg-white px-4 py-3 text-base font-bold text-brand-700 shadow-sm">
          ✕ Pause
        </button>
        <ProgressDots total={allSteps.length} current={index} />
      </header>

      <div className="lb-card p-5">
        <p className="mb-1 text-sm font-bold uppercase tracking-wide text-brand-600">{lesson.titleDe}</p>

        {isTransfer ? (
          <p className="mb-3 inline-block rounded-full bg-sun-200 px-3 py-1 text-sm font-extrabold text-ink-900">
            ⭐ Jetzt allein: neue Aufgabe
          </p>
        ) : null}

        {index === 0 && lesson.storyDe ? (
          <p className="mb-3 text-lg text-ink-800">{lesson.storyDe}</p>
        ) : null}

        {exercise.contextDe ? (
          <p className="mb-3 rounded-2xl bg-brand-50 p-3 text-lg text-ink-800">{exercise.contextDe}</p>
        ) : null}

        <h1 className="mb-3 text-2xl font-extrabold leading-snug text-ink-900">{exercise.instructionDe}</h1>

        <div className="mb-4">
          <SpeakButton text={readAloudText} enabled={soundEnabled} />
        </div>

        {exercise.sceneGroups ? (
          <div className="mb-4">
            <SceneView groups={exercise.sceneGroups} />
          </div>
        ) : null}

        <ExerciseView exercise={exercise} answer={answer} onChange={setAnswer} locked={locked} />

        {hintLevel >= 1 || showTr ? (
          <div className="mt-4 rounded-3xl border-4 border-brand-200 bg-brand-50 p-4">
            <p className="text-base font-extrabold text-brand-800">💡 Tipp</p>
            {hintLevel >= 1 ? <p className="mt-1 text-lg text-ink-800">{exercise.hintDe}</p> : null}
            {hintLevel >= 2 ? <p className="mt-2 text-lg text-ink-800">{exercise.hintDetailDe}</p> : null}
            {showTr ? (
              <p className="mt-2 rounded-2xl bg-white p-3 text-lg text-ink-800" lang="tr">
                🇹🇷 {exercise.hintTr}
              </p>
            ) : null}
          </div>
        ) : null}

        {state === 'wrong' ? (
          <div className="mt-4">
            <FeedbackBox kind="wrong" title="Noch nicht ganz." text={wrongReason(exercise, answer)} />
          </div>
        ) : null}

        {state === 'correct' ? (
          <div className="mt-4">
            <FeedbackBox kind="correct" title="Richtig!" text={exercise.explanationDe} />
            {showTr ? (
              <p className="mt-2 rounded-2xl bg-white p-3 text-base text-ink-800" lang="tr">
                🇹🇷 {exercise.explanationTr}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          {state !== 'correct' ? (
            <>
              <button
                type="button"
                onClick={handleCheck}
                disabled={!isAnswerComplete(exercise, answer)}
                className="lb-btn-primary flex-1 disabled:opacity-40"
              >
                Fertig
              </button>
              <button
                type="button"
                onClick={() => setHintLevel(Math.min(2, hintLevel + 1))}
                disabled={hintLevel >= 2}
                className="lb-btn-secondary disabled:opacity-40"
              >
                💡 {hintLevel === 0 ? 'Hilfe' : 'Mehr Hilfe'}
              </button>
              {turkishHelpAllowed && !showTr ? (
                <button type="button" onClick={() => setShowTr(true)} className="lb-btn-sun" lang="tr">
                  🇹🇷 Türkçe açıkla
                </button>
              ) : null}
            </>
          ) : (
            <button type="button" onClick={handleNext} className="lb-btn-primary flex-1">
              {index < transferIndex ? 'Weiter' : 'Lektion beenden'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
