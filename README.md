# Lernbrücke

Lernübung für Kinder der 2. Klasse (7–8 Jahre) in Deutschland: **verstehen, was eine
deutsche Matheaufgabe eigentlich von mir will** — mit optionaler türkischer Hilfe.

Arbeitstitel. Kein bestehendes Logo, kein fremdes Design übernommen.

- Kinderbereich: durchgehend in der **Zielsprache** des Content-Packs (aktuell Deutsch)
- Hilfssprache (Heimatsprache): **Türkisch, Spanisch oder Englisch** – erscheint nur,
  wenn das Kind sie antippt, und ersetzt nie die Zielsprache
- Elternoberfläche: **Deutsch / English / Español**
- Alle Daten bleiben auf dem Gerät. Kein Konto, keine Cloud, keine Zahlungen, kein Tracking

---

## Starten

```bash
npm install
npm run dev        # Entwicklung, http://localhost:5173
npm run test       # 44 Tests (Logik, Speicher, Inhalt, App-Flows)
npm run typecheck  # TypeScript strict
npm run build      # Produktionsbuild -> dist/ und dist-preview/
npm run preview    # gebauten Stand lokal ausliefern
```

Node 20+ empfohlen (entwickelt und gebaut mit Node 22).

### Zwei Build-Ausgaben

| Ordner | Inhalt | Verwendung |
|---|---|---|
| `dist/` | normaler Vite-Build inkl. `manifest.webmanifest`, `sw.js`, Icons | echtes Hosting, PWA / „Zum Startbildschirm hinzufügen" |
| `dist-preview/lernbruecke.html` | eine einzige HTML-Datei, JS+CSS inline | schnelles Anschauen per Doppelklick, ohne Server |

Die Einzeldatei hat bewusst **kein** PWA-Manifest und keinen Service Worker — beides
braucht http(s). Läuft der Browser über `file://` und blockiert `localStorage`,
fällt die App automatisch auf Speicherung nur für die laufende Sitzung zurück,
statt abzustürzen.

---

## Live und Deployment

| | |
|---|---|
| Live | https://lernbruecke.hasi-elektronic.de |
| Workers-URL | https://lernbruecke.hguencavdi.workers.dev |
| Repo | https://github.com/hasi-elektronic/lernbruecke |

Ausgeliefert als **Cloudflare Worker mit statischen Assets** (`wrangler.toml`),
nicht als Pages-Projekt: Das Pages-Limit von 10 Projekten im Account ist erreicht.
`not_found_handling = "single-page-application"` liefert bei unbekannten Pfaden
`index.html` aus.

Jeder Push auf `main` löst `.github/workflows/deploy.yml` aus:
Typecheck → Tests → Build → Deploy. Schlägt ein Test fehl, wird nicht deployt.
Benötigte Repository-Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

Manueller Deploy:

```bash
npm run build
CLOUDFLARE_API_TOKEN=... npx wrangler deploy
```

---

## Projektstruktur

```
src/
  types/content.ts      Datenmodell für Lektionen und Übungen
  content/              12 Lektionen als reine Daten (moduleA–D) + Register
  data/                 Persistenz: Typen, Migration, Repository (Servicelayer)
  logic/                check.ts (Antwortprüfung), scoring.ts (Bewertung),
                        progress.ts (Statistik, Empfehlung, Elternhinweise)
  components/           common.tsx (Vorlesen, Szene, Feedback), exercises.tsx
  screens/              ParentSetup, ChildHome, LessonScreen, LessonEnd, ParentArea
  audio/speech.ts       Sprachausgabe mit Sprachprüfung
  i18n/strings.ts       Texte der Elternoberfläche (de/tr)
  state.tsx             App-Zustand, hängt am Repository
```

Trennung ist Absicht: **Inhalt** (`content/`), **Ablauf/Bewertung** (`logic/`),
**Darstellung** (`components/`, `screens/`) und **Datenzugriff** (`data/`) sind
getrennt. Ein späterer Serverzugriff ersetzt nur `data/`.

---

## Content-Packs

| Pack | Zielgruppe | Lektionen | Hilfssprachen |
|---|---|---|---|
| `de-DE` | 2. Klasse in Deutschland | 12 | Türkisch, Spanisch, Englisch |
| `en-US` | 2nd grade in den USA | 12 | Spanisch |

Beide Packs nutzen denselben Motor und dieselbe Fähigkeitsstruktur, haben aber
eigene Aufgaben, eigene Kontexte und eigene Klassenzimmersprache
(„markiere alle" ↔ „circle all"). Ein neues Pack ist reine Datenarbeit:
`src/content/<locale>/` anlegen, in `contentPacks` eintragen, Hilfssprache
hinterlegen — der Inhaltstest erzwingt Vollständigkeit.

## Inhalt je Pack: 4 Bereiche, 12 Lektionen

| Modul | Thema | Lektionen |
|---|---|---|
| A | Arbeitsanweisungen verstehen | markieren · auswählen · zuordnen |
| B | Dazu und weg | dazulegen · wegnehmen · mehr oder weniger entscheiden |
| C | Vergleichen | mehr/weniger/gleich · Unterschied · gleich viele machen |
| D | Was ist gefragt? | Frage erkennen · nötige Zahlen finden · passendes Bild wählen |

Jede Lektion: Lernziel, deutsche Geschichte, mindestens zwei interaktive Übungen,
gestufte Hilfen, optionale türkische Erklärung und eine **Kontrollaufgabe in neuem
Kontext**, die ohne Hilfe gewertet wird. Zahlenraum bis 20.

Bewusst **nicht** gelehrt: Signalwortregeln wie „mehr heißt plus". Stattdessen zeigt
jede Aufgabe die Handlung („Ben bekommt 3 Murmeln, Minas Menge wird kleiner").

### Mehrsprachigkeit: drei getrennte Ebenen

| Ebene | Wo eingestellt | Aktuell |
|---|---|---|
| **Zielsprache** (Sprache der Aufgaben) | Content-Pack, `targetLocale` | `de-DE` und `en-US` |
| **Hilfssprache** (Heimatsprache) | Elternbereich, pro Kind | de-DE: `tr`/`es`/`en`, en-US: `es`, oder keine |
| **Elternoberfläche** | Elternbereich | `de`, `en`, `es` |

Der Kinderbereich läuft **komplett** in der Zielsprache: Wer das US-Pack wählt,
bekommt englische Aufgaben, englische Knöpfe und eine englische Sprachausgabe.

Diese drei sind bewusst unabhängig: Eine Familie kann die Elternoberfläche auf
Englisch stellen und dem Kind trotzdem spanische Hilfe geben, während die
Aufgaben deutsch bleiben.

### Neue Hilfssprache hinzufügen

1. `src/content/support/<lang>.ts` nach dem Muster von `tr.ts` anlegen
   (Schlüssel = Übungs-ID, Wert = `{ hint, explanation }`).
2. In `src/content/support/index.ts` in `supportPacks` und `supportLanguages` eintragen.
3. `npm run test` — der Inhaltstest prüft, dass **jede** Übung abgedeckt ist und
   keine verwaisten Einträge existieren.

Kein Code im Lektionsmotor ändert sich.

### Neue Lektion hinzufügen

1. Objekt vom Typ `Lesson` in `src/content/moduleX.ts` ergänzen (oder neue Datei).
2. `skillId` verwenden, die in `src/content/index.ts` unter `skills` registriert ist —
   sonst schlägt der Inhaltstest fehl.
3. `steps` mit mindestens zwei Übungen füllen, dazu genau eine `transferTask`
   in einem **anderen** Kontext als die Übungen.
4. `npm run test` — `content.test.ts` prüft automatisch: eindeutige IDs, gültige
   Lösungsverweise, alle drei Hilfestufen vorhanden, Zahlenraum ≤ 20, keine
   wortgleiche Wiederholung von Aufgabenstellungen.

Kein React-Code nötig, solange einer der fünf Interaktionstypen passt:
`select-one`, `select-multiple`, `sort-groups`, `move-objects`, `number-input`.

---

## Bedienung und Barrierefreiheit

- Ziehen ist **optional**: Zuordnen geht über „Ding antippen → Platz antippen",
  Objekte bewegen über große Schaltflächen. Alles mit Tastatur erreichbar.
- Rückmeldung immer über Symbol **und** Text, nicht nur über Farbe.
- Animationen sind kurz; `prefers-reduced-motion` wird respektiert, zusätzlich
  gibt es einen Schalter im Elternbereich.
- Vorlesen startet nie von selbst, nur auf Tastendruck. „Langsam" ist zusätzlich da.
- Kein Mikrofon, keine Aufnahme.
- Kein Tagesserien-Druck, kein Countdown, keine Endlos-Belohnungsschleife.
  Am Ende steht „Für heute fertig".

### Ton

`speechSynthesis` des Browsers, `de-DE` für Deutsch und `tr-TR` für Türkisch.
Gibt es keine passende Stimme, wird **nicht** auf eine andere Sprache ausgewichen —
die Vorlese-Schaltfläche verschwindet und ein Hinweis erscheint, dass der Text
gelesen werden kann. Eine Lektion ist ohne Ton vollständig lösbar.

---

## Lern- und Bewertungslogik

- Falsch heißt nie nur „falsch": es wird erklärt, *was* nicht passt
  (zu große Zahl, etwas Falsches markiert, Ding am falschen Platz …), ohne die
  Lösung zu verraten.
- Beim ersten Fehler erscheint automatisch der erste Hinweis.
- Stufe 2 auf Wunsch, türkische Erklärung nur wenn im Setup erlaubt und angetippt.
- **Mit Hilfe richtig zählt nicht als „allein geschafft"** (`isUnassisted(tries, hints)`).
- Bei der Kontrollaufgabe wird der erste Versuch gesondert gespeichert.
- Nächste Lektion: schwacher Skill (< 60 % ohne Hilfe oder Kontrollaufgabe nicht
  bestanden) wird zur Wiederholung vorgeschlagen, sonst die nächste neue Lektion.
  Feste, nachvollziehbare Regeln — keine laufende KI, kein API-Schlüssel.

---

## Daten

- Schlüssel `lernbruecke.data`, Feld `schemaVersion`.
- Beim Lesen wird jeder Datensatz geprüft; kaputte Einträge werden verworfen,
  statt die App zu blockieren. Daten aus einer neueren Version übernehmen nur
  Profil und Einstellungen.
- Elternbereich: Export als JSON, Import mit Validierung, vollständiges Löschen.
- Der Zugang zum Elternbereich ist eine einfache Rechenaufgabe. Das ist eine
  Hürde für Kinder — **keine Anmeldung und keine rechtsgültige Einwilligung**.
  Das steht auch so in der App.

---

## Geprüft

`npm run test` → 44 Tests, alle grün:

- Antwortprüfung aller fünf Interaktionstypen inkl. Teilantworten
- Bewertung: Hilfe verhindert „allein geschafft", Kontrollaufgabe separat
- Statistik und Empfehlungslogik (Wiederholung vs. neue Lektion)
- Speicher: Migration von Müll- und Altdaten, Neustart, Löschen, Export/Import
- Inhalt: 12 Lektionen, eindeutige IDs, gültige Lösungen, Zahlenraum, keine Dubletten
- App-Flows in jsdom: Ersteinrichtung, komplette Lektion inklusive Kontrollaufgabe,
  Fehler-und-Hinweis-Ablauf, türkische Hilfe, Fortschritt nach Neustart,
  Elternschranke, Datenlöschung, Sprachumschaltung

Zusätzlich: `npm run typecheck` und `npm run build` laufen fehlerfrei durch.

## Ehrliche Grenzen

- Die Inhalte sind sprachlich und mathematisch geprüft, aber **nicht von einer
  Lehrkraft oder Fachdidaktik freigegeben**. Siehe `DEVELOPMENT.md`.
- Getestet wurde in jsdom und per Codeprüfung. Ein Durchlauf auf echten Geräten
  (iPhone, Android-Tablet, Schul-Chromebook) mit echter Sprachausgabe steht aus.
- Die Sprachausgabe hängt vollständig vom Betriebssystem ab. Auf manchen
  Android-Geräten fehlt eine türkische Stimme; dann bleibt der Text sichtbar.
- Kein Mehrbenutzerbetrieb: ein Kinderprofil pro Gerät.
- Offline-Cache ist einfach gehalten (Cache-first). Nach einem neuen Deploy kann
  ein Neuladen nötig sein.
