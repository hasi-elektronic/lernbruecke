import { useState } from 'react';
import { useAppState } from '../state';
import { t, uiLanguages } from '../i18n/strings';
import type { UiLanguage } from '../data/types';
import type { SupportLanguage } from '../types/content';
import { supportLanguages } from '../content/support';

const AVATARS = ['🦊', '🐼', '🐢', '🦉', '🐙', '🦁', '🐝', '🐬'];

export function ParentSetup({ onDone }: { onDone: () => void }) {
  const { data, setProfile, setSettings } = useAppState();
  const [lang, setLang] = useState<UiLanguage>(data.settings.parentLanguage);
  const [nickname, setNickname] = useState(data.profile?.nickname ?? '');
  const [avatar, setAvatar] = useState(data.profile?.avatar ?? AVATARS[0]);
  const [supportLanguage, setSupportLanguage] = useState<SupportLanguage | null>(
    data.profile?.supportLanguage ?? null,
  );
  const s = t(lang);

  const save = () => {
    const name = nickname.trim();
    if (!name) return;
    setSettings({ ...data.settings, parentLanguage: lang });
    setProfile({
      nickname: name.slice(0, 20),
      avatar,
      supportLanguage,
      createdAt: data.profile?.createdAt ?? Date.now(),
    });
    onDone();
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="lb-card p-6">
        <p className="text-4xl" aria-hidden="true">
          🌉
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink-900">{s.setupTitle}</h1>
        <p className="mt-2 text-lg text-ink-800">{s.setupIntro}</p>

        <fieldset className="mt-6">
          <legend className="text-base font-bold text-ink-700">{s.languageLabel}</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {uiLanguages.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLang(l.id)}
                aria-pressed={lang === l.id}
                className={`lb-tile flex-1 py-3 ${lang === l.id ? 'border-brand-400 bg-brand-50' : 'border-brand-100'}`}
              >
                <span className="text-lg font-bold">{l.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mt-6 block">
          <span className="text-base font-bold text-ink-700">{s.nicknameLabel}</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={s.nicknamePlaceholder}
            maxLength={20}
            className="focus-ring mt-2 w-full rounded-2xl border-4 border-brand-200 bg-white p-3 text-xl font-bold text-ink-900"
          />
        </label>

        <fieldset className="mt-6">
          <legend className="text-base font-bold text-ink-700">{s.avatarLabel}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                aria-pressed={avatar === a}
                aria-label={`Avatar ${a}`}
                className={`lb-tile h-16 w-16 text-3xl ${avatar === a ? 'border-brand-400 bg-brand-50' : 'border-brand-100'}`}
              >
                <span aria-hidden="true">{a}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6 rounded-2xl bg-sun-100 p-4">
          <legend className="text-base font-bold text-ink-900">{s.supportLabel}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSupportLanguage(null)}
              aria-pressed={supportLanguage === null}
              className={`lb-tile px-4 py-3 ${supportLanguage === null ? 'border-brand-400 bg-white' : 'border-white bg-white/60'}`}
            >
              <span className="text-base font-bold">🚫 {s.supportNone}</span>
            </button>
            {supportLanguages.map((sl) => (
              <button
                key={sl.id}
                type="button"
                onClick={() => setSupportLanguage(sl.id)}
                aria-pressed={supportLanguage === sl.id}
                className={`lb-tile px-4 py-3 ${supportLanguage === sl.id ? 'border-brand-400 bg-white' : 'border-white bg-white/60'}`}
              >
                <span className="text-base font-bold">
                  {sl.flag} {sl.nativeLabel}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-ink-700">{s.supportHint}</p>
          <p className="mt-1 text-sm text-ink-700">{s.supportIndependent}</p>
        </fieldset>

        <div className="mt-6 space-y-2 rounded-2xl bg-brand-50 p-4 text-sm text-ink-800">
          <p>🔒 {s.storageNotice}</p>
          <p>⏱️ {s.usageNotice}</p>
        </div>

        <button type="button" onClick={save} disabled={!nickname.trim()} className="lb-btn-primary mt-6 w-full disabled:opacity-40">
          {s.start}
        </button>
      </div>
    </div>
  );
}
