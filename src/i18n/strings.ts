import type { UiLanguage } from '../data/types';

/**
 * Nur die ELTERN-Oberfläche ist zweisprachig.
 * Der Kinderbereich bleibt bewusst deutsch – türkische Hilfe erscheint dort
 * nur auf ausdrücklichen Wunsch pro Aufgabe.
 */
const de = {
    setupTitle: 'Willkommen bei Lernbrücke',
    setupIntro:
      'Lernbrücke hilft Kindern der 2. Klasse zu verstehen, was eine deutsche Matheaufgabe von ihnen möchte.',
    languageLabel: 'Sprache der Elternoberfläche',
    nicknameLabel: 'Spitzname des Kindes',
    nicknamePlaceholder: 'z. B. Zeyno',
    avatarLabel: 'Figur auswählen',
    turkishHelpLabel: 'Türkische Hilfe im Kinderbereich anbieten',
    turkishHelpHint: 'Die Hilfe erscheint nur, wenn das Kind sie antippt.',
    turkishHelpIndependent:
      'Diese Einstellung gilt für den Kinderbereich und ist unabhängig von der Sprache dieser Oberfläche.',
    turkishHelpOn: 'Türkische Hilfe ist eingeschaltet.',
    turkishHelpOff: 'Türkische Hilfe ist ausgeschaltet. Das Kind sieht nur deutsche Texte.',
    storageNotice: 'Die Daten werden nur auf diesem Gerät gespeichert. Es gibt kein Konto und keine Cloud.',
    usageNotice:
      'Empfohlen sind kurze Einheiten von 5 bis 10 Minuten. Es gibt keine Tagesserie und keinen Zeitdruck.',
    start: 'Los geht’s',
    parentArea: 'Elternbereich',
    gateTitle: 'Nur für Erwachsene',
    gateText: 'Bitte lösen Sie diese Aufgabe, um in den Elternbereich zu gelangen.',
    gateHint: 'Das ist eine einfache Ablenkung für Kinder – keine Anmeldung und keine rechtsgültige Einwilligung.',
    gateWrong: 'Das stimmt noch nicht. Bitte noch einmal versuchen.',
    gateSubmit: 'Weiter',
    back: 'Zurück',
    dashboardTitle: 'Elternbereich',
    completedLessons: 'Abgeschlossene Lektionen',
    skillProgress: 'Fortschritt nach Fähigkeit',
    hintUsage: 'Hilfe-Nutzung',
    transferSuccess: 'Ohne Hilfe bei neuen Aufgaben',
    advice: 'Empfehlungen',
    dataManagement: 'Daten',
    exportData: 'Fortschritt exportieren (JSON)',
    importData: 'Fortschritt importieren',
    deleteData: 'Alle Daten löschen',
    deleteConfirm: 'Wirklich alle Daten dieses Geräts löschen? Das kann nicht rückgängig gemacht werden.',
    importOk: 'Import erfolgreich.',
    importFail: 'Datei konnte nicht gelesen werden. Bitte eine Lernbrücke-Exportdatei wählen.',
    settingsTitle: 'Einstellungen',
    reducedMotion: 'Animationen reduzieren',
    soundEnabled: 'Vorlesen erlauben',
    noData: 'Noch keine Daten vorhanden.',
    ofLessons: 'von 12 Lektionen',
    exercisesDone: 'bearbeitete Aufgaben',
    editProfile: 'Profil ändern',
    save: 'Speichern',
    pedagogyNote:
      'Die Inhalte wurden fachlich und sprachlich geprüft, aber nicht von einer Lehrkraft oder Fachdidaktik freigegeben.',
};

const tr = {
    setupTitle: 'Lernbrücke’ye hoş geldiniz',
    setupIntro:
      'Lernbrücke, 2. sınıf çocukların Almanca matematik sorusunun kendisinden ne istediğini anlamasına yardımcı olur.',
    languageLabel: 'Veli arayüzü dili',
    nicknameLabel: 'Çocuğun takma adı',
    nicknamePlaceholder: 'örn. Zeyno',
    avatarLabel: 'Avatar seçin',
    turkishHelpLabel: 'Çocuk bölümünde Türkçe yardım sunulsun',
    turkishHelpHint: 'Yardım yalnızca çocuk dokunduğunda görünür.',
    turkishHelpIndependent:
      'Bu ayar çocuk bölümü içindir ve bu arayüzün dilinden bağımsızdır.',
    turkishHelpOn: 'Türkçe yardım açık.',
    turkishHelpOff: 'Türkçe yardım kapalı. Çocuk yalnızca Almanca metin görür.',
    storageNotice: 'Veriler yalnızca bu cihazda saklanır. Hesap veya bulut yoktur.',
    usageNotice: 'Günde 5–10 dakikalık kısa çalışmalar önerilir. Gün serisi veya süre baskısı yoktur.',
    start: 'Başla',
    parentArea: 'Veli alanı',
    gateTitle: 'Sadece yetişkinler için',
    gateText: 'Veli alanına geçmek için lütfen bu soruyu çözün.',
    gateHint: 'Bu yalnızca çocuklar için basit bir engeldir; gerçek kimlik doğrulama veya yasal veli onayı değildir.',
    gateWrong: 'Doğru değil. Lütfen tekrar deneyin.',
    gateSubmit: 'Devam',
    back: 'Geri',
    dashboardTitle: 'Veli alanı',
    completedLessons: 'Tamamlanan dersler',
    skillProgress: 'Beceri bazında ilerleme',
    hintUsage: 'Yardım kullanımı',
    transferSuccess: 'Yeni sorularda yardımsız başarı',
    advice: 'Öneriler',
    dataManagement: 'Veriler',
    exportData: 'İlerlemeyi dışa aktar (JSON)',
    importData: 'İlerlemeyi içe aktar',
    deleteData: 'Tüm verileri sil',
    deleteConfirm: 'Bu cihazdaki tüm veriler silinsin mi? Bu işlem geri alınamaz.',
    importOk: 'İçe aktarma başarılı.',
    importFail: 'Dosya okunamadı. Lütfen bir Lernbrücke dışa aktarma dosyası seçin.',
    settingsTitle: 'Ayarlar',
    reducedMotion: 'Animasyonları azalt',
    soundEnabled: 'Sesli okumaya izin ver',
    noData: 'Henüz veri yok.',
    ofLessons: '/ 12 ders',
    exercisesDone: 'çözülen alıştırma',
    editProfile: 'Profili değiştir',
    save: 'Kaydet',
    pedagogyNote:
      'İçerikler dil ve matematik açısından gözden geçirildi; ancak bir öğretmen veya eğitim uzmanı tarafından onaylanmadı.',
};

export type ParentStrings = { [K in keyof typeof de]: string };

export const parentStrings: Record<UiLanguage, ParentStrings> = { de, tr };

export function t(lang: UiLanguage): ParentStrings {
  return parentStrings[lang];
}
