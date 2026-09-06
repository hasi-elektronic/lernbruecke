import { useEffect, useState } from 'react';
import { cancelSpeech, hasVoiceFor, onVoicesReady, speak } from '../audio/speech';
import type { SceneGroup } from '../types/content';

export function SpeakButton({
  text,
  lang = 'de-DE',
  enabled,
  label = 'Vorlesen',
}: {
  text: string;
  lang?: 'de-DE' | 'tr-TR';
  enabled: boolean;
  label?: string;
}) {
  const [voiceReady, setVoiceReady] = useState(false);

  useEffect(() => {
    const off = onVoicesReady(() => setVoiceReady(hasVoiceFor(lang)));
    setVoiceReady(hasVoiceFor(lang));
    return off;
  }, [lang]);

  useEffect(() => () => cancelSpeech(), []);

  if (!enabled || !voiceReady) {
    return (
      <p className="text-sm text-ink-700/70">
        {lang === 'de-DE'
          ? 'Kein Vorlesen möglich – du kannst den Text lesen.'
          : 'Sesli okuma yok – metni okuyabilirsin.'}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="focus-ring rounded-2xl bg-brand-100 px-4 py-3 text-base font-bold text-brand-800 hover:bg-brand-200"
        onClick={() => speak(text, { lang })}
      >
        🔊 {label}
      </button>
      <button
        type="button"
        className="focus-ring rounded-2xl bg-brand-50 px-4 py-3 text-base font-bold text-brand-700 hover:bg-brand-100"
        onClick={() => speak(text, { lang, slow: true })}
      >
        🐢 {lang === 'de-DE' ? 'Langsam' : 'Yavaş'}
      </button>
    </div>
  );
}

export function SceneView({ groups }: { groups: SceneGroup[] }) {
  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <div key={g.label} className="rounded-2xl bg-brand-50/70 p-3">
          <p className="mb-1 text-sm font-bold uppercase tracking-wide text-brand-700">
            {g.label} · {g.count}
          </p>
          <div className="flex flex-wrap gap-1 text-3xl leading-none" aria-label={`${g.count} ${g.label}`}>
            {Array.from({ length: g.count }).map((_, i) => (
              <span key={i} aria-hidden="true">
                {g.emoji}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export type FeedbackKind = 'correct' | 'wrong' | null;

export function FeedbackBox({
  kind,
  title,
  text,
}: {
  kind: Exclude<FeedbackKind, null>;
  title: string;
  text: string;
}) {
  const correct = kind === 'correct';
  return (
    <div
      role="status"
      className={`lb-pop rounded-3xl border-4 p-4 ${
        correct ? 'border-turq-400 bg-turq-200/50' : 'border-sun-400 bg-sun-100'
      }`}
    >
      <p className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
        <span aria-hidden="true">{correct ? '✅' : '🔎'}</span>
        {title}
      </p>
      <p className="mt-1 text-base text-ink-800">{text}</p>
    </div>
  );
}

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Aufgabe ${current + 1} von ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-3 rounded-full transition-all ${
            i < current ? 'w-3 bg-turq-400' : i === current ? 'w-7 bg-brand-400' : 'w-3 bg-brand-100'
          }`}
        />
      ))}
    </div>
  );
}
