import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { AppStateProvider } from './state';
import { STORAGE_KEY } from './data/storage';

function renderApp() {
  return render(
    <AppStateProvider>
      <App />
    </AppStateProvider>,
  );
}

async function completeSetup(user: ReturnType<typeof userEvent.setup>, turkishHelp = false) {
  await user.type(screen.getByPlaceholderText(/Zeyno/i), 'Zeyno');
  if (turkishHelp) {
    await user.click(screen.getByRole('checkbox', { name: /Türkische Hilfe/i }));
  }
  await user.click(screen.getByRole('button', { name: /Los geht/i }));
}

async function openParentArea(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Eltern/i }));
  const question = screen.getByText(/× .* = \?/).textContent ?? '';
  const [a, b] = question.match(/\d+/g)?.map(Number) ?? [0, 0];
  await user.type(screen.getByRole('textbox'), String(a * b));
  await user.click(screen.getByRole('button', { name: 'Weiter' }));
}

/** Lektion A1: Schritt 1 „Markiere alle Äpfel" (3 Äpfel unter 6 Bildern). */
async function solveA1Step1(user: ReturnType<typeof userEvent.setup>) {
  const apples = screen.getAllByRole('button', { name: 'Apfel' });
  for (const apple of apples) await user.click(apple);
  await user.click(screen.getByRole('button', { name: 'Fertig' }));
}

beforeEach(() => {
  window.localStorage.clear();
  cleanup();
});

describe('App-Flows', () => {
  it('führt durch Ersteinrichtung und begrüßt das Kind namentlich', async () => {
    const user = userEvent.setup();
    renderApp();
    expect(screen.getByText(/Willkommen bei Lernbrücke/i)).toBeTruthy();
    await completeSetup(user);
    expect(screen.getByText('Hallo, Zeyno!')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Weiterlernen/i })).toBeTruthy();
  });

  it('zeigt bei einer falschen Antwort eine Begründung und einen Tipp', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user);
    await user.click(screen.getByRole('button', { name: /Weiterlernen/i }));

    // Nur eine Birne markieren -> falsch
    await user.click(screen.getAllByRole('button', { name: 'Birne' })[0]);
    await user.click(screen.getByRole('button', { name: 'Fertig' }));

    expect(screen.getByText(/Noch nicht ganz/i)).toBeTruthy();
    expect(screen.getByText(/Etwas Falsches ist markiert/i)).toBeTruthy();
    // Erster Hinweis erscheint automatisch
    expect(screen.getByText('💡 Tipp')).toBeTruthy();
  });

  it('zeigt bei deutscher Auswahl keine türkische Hilfe im Kinderbereich', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user); // Deutsch, Haken nicht gesetzt
    await user.click(screen.getByRole('button', { name: /Weiterlernen/i }));
    expect(screen.queryByRole('button', { name: /Türkçe açıkla/i })).toBeNull();
  });

  it('setzt den Haken automatisch, wenn die Elternsprache Türkisch ist', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'Türkçe' }));
    const box = screen.getByRole('checkbox', { name: /Türkçe yardım/i }) as HTMLInputElement;
    expect(box.checked).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Deutsch' }));
    expect((screen.getByRole('checkbox', { name: /Türkische Hilfe/i }) as HTMLInputElement).checked).toBe(false);
  });

  it('schaltet die türkische Hilfe im Elternbereich nachträglich um', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user); // ohne türkische Hilfe
    await openParentArea(user);
    await user.click(screen.getByRole('checkbox', { name: /Türkische Hilfe/i }));
    await user.click(screen.getByRole('button', { name: /Zurück/i }));
    await user.click(screen.getByRole('button', { name: /Weiterlernen/i }));
    expect(screen.getByRole('button', { name: /Türkçe açıkla/i })).toBeTruthy();
  });

  it('blendet die türkische Hilfe erst auf Wunsch ein', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user, true);
    await user.click(screen.getByRole('button', { name: /Weiterlernen/i }));

    expect(screen.queryByText(/işaretlemek/i)).toBeNull();
    await user.click(screen.getByRole('button', { name: /Türkçe açıkla/i }));
    expect(screen.getByText(/işaretlemek/i)).toBeTruthy();
  });

  it('spielt eine ganze Lektion durch und speichert den Fortschritt', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user);
    await user.click(screen.getByRole('button', { name: /Weiterlernen/i }));

    await solveA1Step1(user);
    expect(screen.getByText('Richtig!')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Weiter' }));

    // Schritt 2: Tiere mit vier Beinen
    for (const name of ['Hund', 'Katze', 'Pferd']) {
      await user.click(screen.getByRole('button', { name }));
    }
    await user.click(screen.getByRole('button', { name: 'Fertig' }));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));

    // Schritt 3: Bedeutung von „Markiere alle Kreise"
    await user.click(screen.getByRole('radio', { name: /Ich zeige jeden Kreis/i }));
    await user.click(screen.getByRole('button', { name: 'Fertig' }));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));

    // Kontrollaufgabe: Zahlen kleiner als 10
    expect(screen.getByText(/Jetzt allein/i)).toBeTruthy();
    for (const name of ['4', '9', '7']) {
      await user.click(screen.getByRole('button', { name }));
    }
    await user.click(screen.getByRole('button', { name: 'Fertig' }));
    await user.click(screen.getByRole('button', { name: /Lektion beenden/i }));

    expect(screen.getByText('Fertig!')).toBeTruthy();
    expect(screen.getByText('4 / 4')).toBeTruthy();

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.completions).toHaveLength(1);
    expect(stored.completions[0].lessonId).toBe('a1');
    expect(stored.completions[0].transferFirstTryCorrect).toBe(true);
    expect(stored.attempts).toHaveLength(4);

    await user.click(screen.getByRole('button', { name: /Für heute fertig/i }));
    expect(screen.getByText('Geschafft: 1 von 12 Lektionen')).toBeTruthy();
  });

  it('stellt den Fortschritt nach einem Neustart wieder her', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user);
    cleanup();

    renderApp();
    expect(screen.getByText('Hallo, Zeyno!')).toBeTruthy();
  });

  it('schützt den Elternbereich mit einer Rechenaufgabe und zeigt echte Zahlen', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user);
    await user.click(screen.getByRole('button', { name: /Eltern/i }));

    expect(screen.getByText(/Nur für Erwachsene/i)).toBeTruthy();
    const question = screen.getByText(/× .* = \?/).textContent ?? '';
    const [a, b] = question.match(/\d+/g)?.map(Number) ?? [0, 0];

    await user.type(screen.getByRole('textbox'), '1');
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    expect(screen.getByText(/stimmt noch nicht/i)).toBeTruthy();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), String(a * b));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));

    const dashboard = screen.getByRole('heading', { name: 'Elternbereich' });
    expect(dashboard).toBeTruthy();
    expect(screen.getByText(/Noch keine abgeschlossene Lektion/i)).toBeTruthy();
    expect(screen.getByText(/0 bearbeitete Aufgaben/i)).toBeTruthy();
  });

  it('löscht auf Wunsch alle Daten', async () => {
    const user = userEvent.setup();
    window.confirm = () => true;
    renderApp();
    await completeSetup(user);
    await user.click(screen.getByRole('button', { name: /Eltern/i }));
    const question = screen.getByText(/× .* = \?/).textContent ?? '';
    const [a, b] = question.match(/\d+/g)?.map(Number) ?? [0, 0];
    await user.type(screen.getByRole('textbox'), String(a * b));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));

    await user.click(screen.getByRole('button', { name: /Alle Daten löschen/i }));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('schaltet die Elternoberfläche auf Türkisch um', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user);
    await user.click(screen.getByRole('button', { name: /Eltern/i }));
    const question = screen.getByText(/× .* = \?/).textContent ?? '';
    const [a, b] = question.match(/\d+/g)?.map(Number) ?? [0, 0];
    await user.type(screen.getByRole('textbox'), String(a * b));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));

    const settings = screen.getByRole('heading', { name: 'Einstellungen' }).parentElement as HTMLElement;
    await user.click(within(settings).getByRole('button', { name: 'Türkçe' }));
    expect(screen.getByRole('heading', { name: 'Veli alanı' })).toBeTruthy();
  });
});
