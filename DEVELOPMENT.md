# Entwicklerdokumentation

## Pädagogischer Prüfstatus

**Stand: erste lauffähige Version. Nicht fachdidaktisch freigegeben.**

Was gemacht wurde:

- Alle deutschen Aufgabentexte wurden auf einfache Satzstruktur, bekannten
  Wortschatz der 2. Klasse und eindeutige Fragestellung durchgesehen.
- Der Zahlenraum ist automatisiert auf ≤ 20 geprüft (`content.test.ts`).
- Alle Erklärungen beschreiben die **Handlung** in der Geschichte
  (zusammenlegen, wegnehmen, vergleichen) statt einer Signalwortregel.
- Türkische Hilfetexte sind Erklärungen, keine wörtlichen Übersetzungen der
  deutschen Sätze; sie sollen den deutschen Text erschließen, nicht ersetzen.

Was noch fehlt:

- Durchsicht durch eine Grundschullehrkraft oder Fachdidaktik Mathematik.
- Abgleich mit dem konkreten Bildungsplan des jeweiligen Bundeslandes
  (die Inhalte orientieren sich allgemein am Stoff der 2. Klasse).
- Erprobung mit echten Kindern; insbesondere ob die Hinweistexte der Stufe 2
  nicht zu lang sind.

Bis dahin darf die App **nicht** als geprüftes oder empfohlenes Lernmaterial
beworben werden.

## Architekturentscheidungen

**Inhalt als Daten, nicht als Komponenten.** Eine Lektion ist ein `Lesson`-Objekt.
Die Screens kennen nur die fünf Interaktionstypen. Dadurch kostet eine neue
Lektion keinen React-Code und der Inhalt lässt sich später ohne Umbau aus einer
API laden.

**Bewertung als reine Funktionen.** `logic/scoring.ts` und `logic/check.ts` sind
frei von React. Das ist der Teil, in dem Fehler teuer sind (ein Kind bekäme
falsche Rückmeldung oder falsche Fortschrittswerte), deshalb liegt dort der
Testschwerpunkt.

**Datenzugriff hinter `ProgressRepository`.** Die UI ruft nie direkt
`localStorage`. Ein Serverbackend würde nur eine zweite Implementierung des
gleichen schmalen Interfaces bedeuten.

**Defensives Lesen.** Jeder gespeicherte Datensatz wird beim Laden geprüft und
notfalls verworfen. Ein kaputter Eintrag darf ein Kind nicht aus der App werfen.

**Kein Live-KI-Aufruf.** Hinweise, Fehlerbegründungen und Empfehlungen sind
Regeln und Daten. Das hält die App offline-fähig, kostenlos, vorhersehbar und
frei von Schlüsseln im Client.

## Schema-Migration

`data/storage.ts` → `migrate(raw)`. Aktuelle Version: `SCHEMA_VERSION = 1`.

Bei einer Änderung des Formats:

1. `SCHEMA_VERSION` erhöhen.
2. In `migrate` die Umwandlung von der alten auf die neue Form ergänzen
   (die Sanitizer-Funktionen bleiben die letzte Verteidigungslinie).
3. Einen Testfall in `storage.test.ts` mit echten Altdaten ergänzen.

Daten aus einer **neueren** Version als der laufenden App werden nicht geraten:
Es werden nur Profil und Einstellungen übernommen, der Fortschritt bleibt leer.
Das verhindert falsche Statistiken.

## Interaktionstyp ergänzen

1. Variante in `types/content.ts` zur Union `Exercise` hinzufügen.
2. Prüfregel in `logic/check.ts` (`checkAnswer` **und** `isAnswerComplete`) ergänzen.
3. Fehlerbegründung in `screens/LessonScreen.tsx` → `wrongReason` ergänzen.
4. Komponente in `components/exercises.tsx` schreiben und im Router eintragen.
5. Tests in `logic/check.test.ts` ergänzen.

Wichtig: Bedienung ohne Ziehen und ohne Maus muss möglich bleiben.

## Bekannte technische Schulden

- Der Service Worker ist bewusst simpel (Cache-first ohne Versionsprüfung zur
  Laufzeit). Für regelmäßige Updates wäre ein Stale-while-revalidate mit
  Update-Hinweis besser.
- `dist-preview` ersetzt Script- und Style-Tags per Regex. Das reicht für den
  aktuellen Single-Chunk-Build, wäre bei Code-Splitting aber zu ersetzen.
- Ein Profil pro Gerät. Für Geschwister bräuchte es eine Profilliste im
  Repository (Datenmodell ist dafür vorbereitet, UI nicht).
