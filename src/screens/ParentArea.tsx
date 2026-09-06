import { useMemo, useRef, useState } from 'react';
import { getSkill, lessons } from '../content';
import { buildParentAdvice, completedLessonIds, hintUsageRate, skillStats } from '../logic/progress';
import { t } from '../i18n/strings';
import { useAppState } from '../state';
import type { UiLanguage } from '../data/types';

/** Einfache Rechenschranke: hält Kinder ab, ist KEINE Anmeldung. */
export function ParentGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const { data } = useAppState();
  const s = t(data.settings.parentLanguage);
  const [a] = useState(() => 7 + Math.floor(Math.random() * 6));
  const [b] = useState(() => 8 + Math.floor(Math.random() * 6));
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const submit = () => {
    if (Number(value) === a * b) onPass();
    else setError(true);
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="lb-card p-6">
        <h1 className="text-2xl font-extrabold text-ink-900">{s.gateTitle}</h1>
        <p className="mt-2 text-base text-ink-800">{s.gateText}</p>
        <p className="mt-4 text-3xl font-extrabold text-brand-700">
          {a} × {b} = ?
        </p>
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, ''));
            setError(false);
          }}
          className="focus-ring mt-3 w-full rounded-2xl border-4 border-brand-200 p-3 text-2xl font-bold"
          aria-label={`${a} mal ${b}`}
        />
        {error ? <p className="mt-2 text-base font-bold text-sun-500">{s.gateWrong}</p> : null}
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={submit} className="lb-btn-primary flex-1">
            {s.gateSubmit}
          </button>
          <button type="button" onClick={onCancel} className="lb-btn-secondary">
            {s.back}
          </button>
        </div>
        <p className="mt-4 text-xs text-ink-700/80">{s.gateHint}</p>
      </div>
    </div>
  );
}

function Bar({ ratio }: { ratio: number }) {
  const pct = Math.round(ratio * 100);
  return (
    <div className="h-3 w-full rounded-full bg-brand-100" role="img" aria-label={`${pct} Prozent`}>
      <div className="h-3 rounded-full bg-brand-400" style={{ width: `${Math.max(4, pct)}%` }} />
    </div>
  );
}

export function ParentDashboard({ onBack, onEditProfile }: { onBack: () => void; onEditProfile: () => void }) {
  const { data, setSettings, setProfile, exportJson, importJson, clearAll } = useAppState();
  const lang = data.settings.parentLanguage;
  const s = t(lang);
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const stats = useMemo(() => skillStats(data.attempts), [data.attempts]);
  const done = completedLessonIds(data.completions);
  const hints = hintUsageRate(data.attempts);
  const transferAttempts = data.attempts.filter((a) => a.isTransfer);
  const transferRate =
    transferAttempts.length > 0
      ? transferAttempts.filter((a) => a.correctFirstTry).length / transferAttempts.length
      : null;

  const advice = useMemo(
    () =>
      buildParentAdvice(data.attempts, data.completions, (id) => {
        const skill = getSkill(id);
        return { de: skill?.labelDe ?? id, tr: skill?.labelTr ?? id };
      }),
    [data.attempts, data.completions],
  );

  const doExport = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lernbruecke-fortschritt-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    setNotice(importJson(text) ? s.importOk : s.importFail);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink-900">{s.dashboardTitle}</h1>
        <button type="button" onClick={onBack} className="focus-ring rounded-2xl bg-white px-4 py-3 text-base font-bold text-brand-700 shadow-sm">
          ← {s.back}
        </button>
      </header>

      <section className="lb-card mb-4 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-brand-50 p-4">
            <p className="text-3xl font-extrabold text-ink-900">
              {done.length}
              <span className="text-base font-bold text-ink-700"> {s.ofLessons}</span>
            </p>
            <p className="text-sm font-bold text-ink-700">{s.completedLessons}</p>
          </div>
          <div className="rounded-2xl bg-turq-200/40 p-4">
            <p className="text-3xl font-extrabold text-ink-900">
              {transferRate === null ? '–' : `${Math.round(transferRate * 100)} %`}
            </p>
            <p className="text-sm font-bold text-ink-700">{s.transferSuccess}</p>
          </div>
          <div className="rounded-2xl bg-sun-100 p-4">
            <p className="text-3xl font-extrabold text-ink-900">{hints === null ? '–' : `${Math.round(hints * 100)} %`}</p>
            <p className="text-sm font-bold text-ink-700">{s.hintUsage}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-700">
          {data.attempts.length} {s.exercisesDone}
        </p>
      </section>

      <section className="lb-card mb-4 p-5">
        <h2 className="mb-3 text-xl font-extrabold text-ink-900">{s.skillProgress}</h2>
        {stats.length === 0 ? (
          <p className="text-base text-ink-700">{s.noData}</p>
        ) : (
          <ul className="space-y-3">
            {stats.map((stat) => {
              const skill = getSkill(stat.skillId);
              return (
                <li key={stat.skillId}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-base font-bold text-ink-800">
                      {lang === 'tr' ? (skill?.labelTr ?? stat.skillId) : (skill?.labelDe ?? stat.skillId)}
                    </span>
                    <span className="text-sm font-bold text-ink-700">
                      {stat.unassisted}/{stat.total}
                    </span>
                  </div>
                  <Bar ratio={stat.ratio ?? 0} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="lb-card mb-4 p-5">
        <h2 className="mb-3 text-xl font-extrabold text-ink-900">{s.advice}</h2>
        <ul className="space-y-2">
          {advice.map((a) => (
            <li key={a.key} className="rounded-2xl bg-brand-50 p-3 text-base text-ink-800">
              {lang === 'tr' ? a.tr : a.de}
            </li>
          ))}
        </ul>
      </section>

      <section className="lb-card mb-4 p-5">
        <h2 className="mb-3 text-xl font-extrabold text-ink-900">{s.settingsTitle}</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            {(['de', 'tr'] as UiLanguage[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setSettings({ ...data.settings, parentLanguage: l })}
                aria-pressed={lang === l}
                className={`lb-tile flex-1 py-3 ${lang === l ? 'border-brand-400 bg-brand-50' : 'border-brand-100'}`}
              >
                {l === 'de' ? 'Deutsch' : 'Türkçe'}
              </button>
            ))}
          </div>
          {data.profile ? (
            <label className="flex items-start gap-3 rounded-2xl bg-sun-100 p-3">
              <input
                type="checkbox"
                checked={data.profile.turkishHelp}
                onChange={(e) =>
                  data.profile && setProfile({ ...data.profile, turkishHelp: e.target.checked })
                }
                className="mt-1 h-6 w-6 accent-[#33afe2]"
              />
              <span>
                <span className="block text-base font-bold text-ink-900">{s.turkishHelpLabel}</span>
                <span className="block text-sm text-ink-700">
                  {data.profile.turkishHelp ? s.turkishHelpOn : s.turkishHelpOff}
                </span>
                <span className="mt-1 block text-sm text-ink-700">{s.turkishHelpIndependent}</span>
              </span>
            </label>
          ) : null}
          <label className="flex items-center gap-3 rounded-2xl bg-white p-3">
            <input
              type="checkbox"
              checked={data.settings.reducedMotion}
              onChange={(e) => setSettings({ ...data.settings, reducedMotion: e.target.checked })}
              className="h-6 w-6 accent-[#33afe2]"
            />
            <span className="text-base font-bold text-ink-800">{s.reducedMotion}</span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-white p-3">
            <input
              type="checkbox"
              checked={data.settings.soundEnabled}
              onChange={(e) => setSettings({ ...data.settings, soundEnabled: e.target.checked })}
              className="h-6 w-6 accent-[#33afe2]"
            />
            <span className="text-base font-bold text-ink-800">{s.soundEnabled}</span>
          </label>
          <button type="button" onClick={onEditProfile} className="lb-btn-secondary w-full">
            {s.editProfile}
          </button>
        </div>
      </section>

      <section className="lb-card p-5">
        <h2 className="mb-2 text-xl font-extrabold text-ink-900">{s.dataManagement}</h2>
        <p className="mb-3 text-sm text-ink-700">🔒 {s.storageNotice}</p>
        {notice ? <p className="mb-3 rounded-2xl bg-brand-50 p-3 text-base font-bold text-brand-800">{notice}</p> : null}
        <div className="space-y-3">
          <button type="button" onClick={doExport} className="lb-btn-secondary w-full">
            ⬇︎ {s.exportData}
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="lb-btn-secondary w-full">
            ⬆︎ {s.importData}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void doImport(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (window.confirm(s.deleteConfirm)) {
                clearAll();
                setNotice(null);
              }
            }}
            className="lb-btn w-full border-2 border-red-200 bg-red-50 text-red-700"
          >
            🗑 {s.deleteData}
          </button>
        </div>
        <p className="mt-4 text-xs text-ink-700/80">{s.pedagogyNote}</p>
        <p className="mt-2 text-xs text-ink-700/70">
          {lessons.length} Lektionen · Datenformat v{data.schemaVersion}
        </p>
      </section>
    </div>
  );
}
