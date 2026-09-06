/**
 * Vorlesen über die Browser-Sprachausgabe.
 *
 * Regeln:
 * - Nie automatisch starten, immer nur nach einer Nutzeraktion.
 * - Gibt es keine Stimme in der geforderten Sprache, wird NICHT auf eine
 *   andere Sprache ausgewichen. Stattdessen bleibt der Text sichtbar.
 * - Kein Mikrofon, keine Aufnahme.
 */

export type SpeechLang = 'de-DE' | 'en-US' | 'tr-TR' | 'es-ES';

function synth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  if (!('speechSynthesis' in window)) return null;
  return window.speechSynthesis;
}

function voicesFor(lang: SpeechLang): SpeechSynthesisVoice[] {
  const s = synth();
  if (!s) return [];
  const prefix = lang.slice(0, 2).toLowerCase();
  return s.getVoices().filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix));
}

export function isSpeechSupported(): boolean {
  return synth() !== null;
}

export function hasVoiceFor(lang: SpeechLang): boolean {
  return voicesFor(lang).length > 0;
}

export function cancelSpeech(): void {
  synth()?.cancel();
}

export interface SpeakOptions {
  lang: SpeechLang;
  slow?: boolean;
  onEnd?: () => void;
}

/** Liest den Text vor. Rückgabe false = keine passende Stimme, Text bleibt sichtbar. */
export function speak(text: string, options: SpeakOptions): boolean {
  const s = synth();
  if (!s) return false;
  const voices = voicesFor(options.lang);
  if (voices.length === 0) return false;

  s.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voices[0];
  utterance.lang = options.lang;
  utterance.rate = options.slow ? 0.65 : 0.92;
  utterance.pitch = 1;
  if (options.onEnd) utterance.onend = () => options.onEnd?.();
  s.speak(utterance);
  return true;
}

/**
 * Stimmenliste wird in manchen Browsern asynchron geladen.
 * Callback wird einmal aufgerufen, sobald Stimmen verfügbar sind (oder sofort).
 */
export function onVoicesReady(callback: () => void): () => void {
  const s = synth();
  if (!s) {
    callback();
    return () => undefined;
  }
  if (s.getVoices().length > 0) {
    callback();
    return () => undefined;
  }
  const handler = () => callback();
  s.addEventListener('voiceschanged', handler);
  return () => s.removeEventListener('voiceschanged', handler);
}
