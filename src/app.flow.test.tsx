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

async function completeSetup(
  user: ReturnType<typeof userEvent.setup>,
  supportLanguage: 'Türkçe' | 'Español' | 'English' | null = null,
) {
  await user.type(screen.getByPlaceholderText(/Zeyno/i), 'Zeyno');
  if (supportLanguage) {
    await user.click(screen.getByRole('button', { name: new RegExp(supportLanguage) }));
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

  it('zeigt ohne gewählte Hilfssprache keine fremdsprachige Hilfe', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user);
    await user.click(screen.getByRole('button', { name: /Weiterlernen/i }));
    expect(screen.queryByRole('button', { name: /Türkçe/ })).toBeNull();
  });

  it('bietet drei Oberflächensprachen und lässt die Hilfssprache standardmäßig aus', async () => {
    const user = userEvent.setup();
    renderApp();
    for (const label of ['Deutsch', 'English', 'Español']) {
      expect(screen.getByRole('button', { name: label })).toBeTruthy();
    }
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByText(/Welcome to Lernbrücke/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Español' }));
    expect(screen.getByText(/Bienvenido a Lernbrücke/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Deutsch' }));
    // Ohne bewusste Wahl bleibt die Hilfssprache aus.
    await completeSetup(user);
    await user.click(screen.getByRole('button', { name: /Weiterlernen/i }));
    for (const name of [/Türkçe/, /Español/, /English/]) {
      expect(screen.queryByRole('button', { name })).toBeNull();
    }
  });

  it('schaltet die Hilfssprache im Elternbereich nachträglich um', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user); // ohne Hilfssprache
    await openParentArea(user);
    const settings = screen.getByRole('group', { name: /Sprache der Hilfe/i });
    await user.click(within(settings).getByRole('button', { name: /Español/ }));
    await user.click(screen.getByRole('button', { name: /Zurück/i }));
    await user.click(screen.getByRole('button', { name: /Weiterlernen/i }));
    const supportButton = screen.getByRole('button', { name: /Español/ });
    await user.click(supportButton);
    expect(screen.getByText(/significa marcar/i)).toBeTruthy();
  });

  it('blendet die türkische Hilfe erst auf Wunsch ein', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user, 'Türkçe');
    await user.click(screen.getByRole('button', { name: /Weiterlernen/i }));

    expect(screen.queryByText(/işaretlemek/i)).toBeNull();
    await user.click(screen.getByRole('button', { name: /Türkçe/ }));
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

  it('spielt das US-Pack komplett in englischer Oberfläche', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /English \(US\)/ }));
    await user.type(screen.getByPlaceholderText(/Zeyno/i), 'Mia');
    await user.click(screen.getByRole('button', { name: /Los geht/i }));

    // Kinderbereich läuft jetzt komplett auf Englisch
    expect(screen.getByText('Hi, Mia!')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Keep learning/i }));
    expect(screen.getByText('Circle all the apples.')).toBeTruthy();

    // falsche Antwort -> englische Begründung
    await user.click(screen.getAllByRole('button', { name: 'pear' })[0]);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByText(/Something wrong is marked/i)).toBeTruthy();
  });

  it('bietet im US-Pack spanische Hilfe an, aber kein Türkisch', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /English \(US\)/ }));
    const supportBox = screen.getByRole('group', { name: /Sprache der Hilfe/i });
    // Türkisch ist für das US-Pack nicht hinterlegt und wird gar nicht angeboten
    expect(within(supportBox).queryByRole('button', { name: /Türkçe/ })).toBeNull();
    await user.click(within(supportBox).getByRole('button', { name: /Español/ }));
    await user.type(screen.getByPlaceholderText(/Zeyno/i), 'Mia');
    await user.click(screen.getByRole('button', { name: /Los geht/i }));
    await user.click(screen.getByRole('button', { name: /Keep learning/i }));
    await user.click(screen.getByRole('button', { name: /Español/ }));
    expect(screen.getByText(/significa marcar todos/i)).toBeTruthy();
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

  it('schaltet die Elternoberfläche auf Englisch um', async () => {
    const user = userEvent.setup();
    renderApp();
    await completeSetup(user);
    await user.click(screen.getByRole('button', { name: /Eltern/i }));
    const question = screen.getByText(/× .* = \?/).textContent ?? '';
    const [a, b] = question.match(/\d+/g)?.map(Number) ?? [0, 0];
    await user.type(screen.getByRole('textbox'), String(a * b));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));

    const settings = screen.getByRole('heading', { name: 'Einstellungen' }).parentElement as HTMLElement;
    await user.click(within(settings).getByRole('button', { name: 'English' }));
    expect(screen.getByRole('heading', { name: 'Parent area' })).toBeTruthy();
  });
});
