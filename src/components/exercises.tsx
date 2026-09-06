import { useEffect, useState } from 'react';
import type {
  AnswerValue,
  Exercise,
  MoveObjectsExercise,
  NumberInputExercise,
  SelectMultipleExercise,
  SelectOneExercise,
  SortGroupsExercise,
} from '../types/content';

interface Props<T extends Exercise> {
  exercise: T;
  answer: AnswerValue;
  onChange: (value: AnswerValue) => void;
  locked: boolean;
}

/* ---------------------------------------------------------------- select-one */

function SelectOne({ exercise, answer, onChange, locked }: Props<SelectOneExercise>) {
  return (
    <div className="grid gap-3" role="radiogroup" aria-label={exercise.instructionDe}>
      {exercise.items.map((item) => {
        const selected = answer === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={locked}
            onClick={() => onChange(item.id)}
            className={`lb-tile flex items-center gap-3 text-left ${
              selected ? 'border-brand-400 bg-brand-50' : 'border-brand-100'
            } ${locked ? 'opacity-70' : 'hover:border-brand-300'}`}
          >
            <span
              aria-hidden="true"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 ${
                selected ? 'border-brand-400 bg-brand-400 text-white' : 'border-brand-200 bg-white'
              }`}
            >
              {selected ? '✓' : ''}
            </span>
            <span className="flex-1">
              {item.emoji ? (
                <span aria-hidden="true" className="mr-2 text-2xl leading-none">
                  {item.emoji}
                </span>
              ) : null}
              <span className="text-lg font-semibold text-ink-800">{item.labelDe}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------- select-multiple */

function SelectMultiple({ exercise, answer, onChange, locked }: Props<SelectMultipleExercise>) {
  const selected: string[] = Array.isArray(answer) ? answer : [];
  const toggle = (id: string) => {
    if (locked) return;
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };
  return (
    <div className="flex flex-wrap gap-3">
      {exercise.items.map((item) => {
        const isOn = selected.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isOn}
            aria-label={item.labelDe}
            disabled={locked}
            onClick={() => toggle(item.id)}
            className={`lb-tile min-w-[6.5rem] flex-1 ${
              isOn ? 'border-brand-400 bg-brand-50' : 'border-brand-100'
            } ${locked ? 'opacity-70' : 'hover:border-brand-300'}`}
          >
            {item.emoji ? (
              <span className="block text-4xl leading-tight" aria-hidden="true">
                {item.emoji}
              </span>
            ) : null}
            <span aria-hidden="true" className="mt-1 block text-lg font-bold text-ink-800">
              {item.labelDe}
            </span>
            <span
              aria-hidden="true"
              className={`mt-1 block text-sm font-bold ${isOn ? 'text-brand-600' : 'text-ink-700/50'}`}
            >
              {isOn ? '✓ markiert' : 'tippen'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------- sort-groups */

function SortGroups({ exercise, answer, onChange, locked }: Props<SortGroupsExercise>) {
  const mapping: Record<string, string> =
    typeof answer === 'object' && answer !== null && !Array.isArray(answer)
      ? (answer as Record<string, string>)
      : {};
  const [active, setActive] = useState<string | null>(null);

  const assign = (itemId: string, targetId: string) => {
    if (locked) return;
    onChange({ ...mapping, [itemId]: targetId });
    setActive(null);
  };
  const unassign = (itemId: string) => {
    if (locked) return;
    const next = { ...mapping };
    delete next[itemId];
    onChange(next);
  };

  const open = exercise.items.filter((i) => !mapping[i.id]);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-700/70">
          1. Ding antippen 2. Platz antippen
        </p>
        <div className="flex flex-wrap gap-2">
          {open.length === 0 ? (
            <p className="text-base text-ink-700">Alles zugeordnet 👍</p>
          ) : (
            open.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={locked}
                aria-pressed={active === item.id}
                onClick={() => setActive(active === item.id ? null : item.id)}
                draggable={!locked}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.id);
                  setActive(item.id);
                }}
                className={`lb-tile px-4 py-3 ${
                  active === item.id ? 'border-brand-400 bg-brand-50' : 'border-brand-100'
                }`}
              >
                {item.emoji ? (
                  <span className="mr-1 text-2xl" aria-hidden="true">
                    {item.emoji}
                  </span>
                ) : null}
                <span className="text-lg font-bold text-ink-800">{item.labelDe}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {exercise.targets.map((target) => {
          const assigned = exercise.items.filter((i) => mapping[i.id] === target.id);
          return (
            <div
              key={target.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain');
                if (id) assign(id, target.id);
              }}
              className="rounded-3xl border-4 border-dashed border-turq-300 bg-white/70 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-lg font-extrabold text-ink-800">{target.labelDe}</p>
                <button
                  type="button"
                  disabled={locked || !active}
                  onClick={() => active && assign(active, target.id)}
                  className="focus-ring rounded-xl bg-turq-300 px-3 py-2 text-sm font-bold text-ink-900 disabled:opacity-40"
                >
                  hierher
                </button>
              </div>
              <div className="flex min-h-[3.5rem] flex-wrap gap-2">
                {assigned.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={locked}
                    onClick={() => unassign(item.id)}
                    className="focus-ring rounded-xl bg-brand-50 px-3 py-2 text-base font-bold text-ink-800"
                    title="Zurücklegen"
                  >
                    {item.emoji ? (
                      <span className="mr-1" aria-hidden="true">
                        {item.emoji}
                      </span>
                    ) : null}
                    {item.labelDe} ✕
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- move-objects */

function MoveObjects({ exercise, answer, onChange, locked }: Props<MoveObjectsExercise>) {
  const moved = typeof answer === 'number' ? answer : 0;
  const isAdd = exercise.mode === 'add';
  const pool = isAdd ? exercise.moveCount - moved : exercise.startCount - moved;
  const target = isAdd ? exercise.startCount + moved : moved;

  useEffect(() => {
    if (answer === null) onChange(0);
  }, [answer, onChange]);

  const move = (delta: number) => {
    if (locked) return;
    const max = isAdd ? exercise.moveCount : exercise.startCount;
    const next = Math.min(max, Math.max(0, moved + delta));
    onChange(next);
  };

  const poolLabel = isAdd ? exercise.sourceLabelDe : exercise.sourceLabelDe;
  const targetLabel = exercise.targetLabelDe;

  const Row = ({ count, label, tone }: { count: number; label: string; tone: string }) => (
    <div className={`rounded-3xl border-4 p-3 ${tone}`}>
      <p className="mb-1 text-base font-extrabold text-ink-800">
        {label}: {count}
      </p>
      <div className="flex min-h-[3rem] flex-wrap gap-1 text-3xl leading-none">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} aria-hidden="true">
            {exercise.emoji}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <Row count={pool} label={poolLabel} tone="border-brand-100 bg-white" />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={locked || pool === 0}
          onClick={() => move(1)}
          className="lb-btn-primary disabled:opacity-40"
        >
          ⬇︎ 1 {exercise.objectLabelDe} zu {targetLabel}
        </button>
        <button
          type="button"
          disabled={locked || moved === 0}
          onClick={() => move(-1)}
          className="lb-btn-secondary disabled:opacity-40"
        >
          ↩︎ zurück
        </button>
      </div>
      <Row count={target} label={targetLabel} tone="border-turq-300 bg-turq-200/30" />
      <p className="text-center text-base font-bold text-brand-700">
        Bewegt: {moved} {exercise.objectLabelDe}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- number-input */

function NumberInput({ exercise, answer, onChange, locked }: Props<NumberInputExercise>) {
  const value = typeof answer === 'number' ? String(answer) : '';
  const press = (digit: string) => {
    if (locked) return;
    const next = (value + digit).replace(/^0+(?=\d)/, '').slice(0, 2);
    onChange(Number(next));
  };
  return (
    <div className="space-y-3">
      <label className="block text-center">
        <span className="block text-base font-bold text-ink-700">Deine Antwort ({exercise.unitDe})</span>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={locked}
          value={value}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
            onChange(digits === '' ? null : Number(digits));
          }}
          className="focus-ring mx-auto mt-2 block w-32 rounded-2xl border-4 border-brand-200 bg-white p-3 text-center text-4xl font-extrabold text-ink-900"
          aria-label={`Antwort in ${exercise.unitDe}`}
        />
      </label>
      <div className="mx-auto grid max-w-xs grid-cols-5 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
          <button
            key={d}
            type="button"
            disabled={locked}
            onClick={() => press(d)}
            className="focus-ring rounded-2xl bg-white py-3 text-2xl font-extrabold text-ink-800 shadow-sm hover:bg-brand-50"
          >
            {d}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={locked}
        onClick={() => onChange(null)}
        className="mx-auto block rounded-xl px-3 py-2 text-base font-bold text-brand-700 underline"
      >
        Löschen
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ Router */

export function ExerciseView(props: {
  exercise: Exercise;
  answer: AnswerValue;
  onChange: (value: AnswerValue) => void;
  locked: boolean;
}) {
  const { exercise } = props;
  switch (exercise.interactionType) {
    case 'select-one':
      return <SelectOne {...props} exercise={exercise} />;
    case 'select-multiple':
      return <SelectMultiple {...props} exercise={exercise} />;
    case 'sort-groups':
      return <SortGroups {...props} exercise={exercise} />;
    case 'move-objects':
      return <MoveObjects {...props} exercise={exercise} />;
    case 'number-input':
      return <NumberInput {...props} exercise={exercise} />;
    default:
      return null;
  }
}
