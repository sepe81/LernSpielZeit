# LernSpielZeit

**Verwandle Lernzeit in Spielzeit – mit System und im Minecraft-Style.**

## Ziel

Eine einfache Web-App, die es Eltern und Kindern ermöglicht, Lernzeit in Spielzeit umzuwandeln.
Die App soll:

- Lernzeit sekundengenau erfassen
- Spielzeit basierend auf der Lernzeit berechnen
- Einfache Benutzeroberfläche für Kinder und Eltern bieten

---

## Funktionen

### 1. Benutzeroberfläche

- **Startseite:**
  - Übersicht über das aktuelle Guthaben (Anzeige in Stunden:Minuten:Sekunden)
  - Buttons: "Lernzeit starten", "Spielzeit starten", "Historie anzeigen"
- **Lernzeit-Timer:**
  - Stoppuhr zur sekundengenauen Erfassung der Lernzeit
  - Button zum Speichern der Lernzeit
- **Spielzeit-Timer:**
  - Stoppuhr zur sekundengenauen Erfassung der Spielzeit
  - Button zum Abziehen der Spielzeit vom Guthaben
- **Guthaben-Anzeige:**
  - Aktuelles Guthaben in Stunden:Minuten:Sekunden
  - Historie aller Einträge (Lernzeit/Spielzeit) mit Zeitstempel

### 2. Logik

- **Zeiterfassung:**
  - Lernzeit wird in Sekunden addiert
  - Spielzeit wird in Sekunden subtrahiert
  - Das Guthaben kann negativ werden — in diesem Fall wird eine sichtbare Warnung angezeigt
  - Verhältnis 1:1 (1 Sekunde Lernen = 1 Sekunde Spielzeit)
- **Maximale Spielzeit pro Tag:**
  - Fest hinterlegt: maximal 3600 Sekunden (= 60 Minuten) pro Tag
- **Timer-Exklusivität:**
  - Lernzeit- und Spielzeit-Timer können nicht gleichzeitig laufen
  - Beim Starten eines Timers wird ein laufender anderer Timer automatisch gestoppt

### 3. Daten

- **Lokale Speicherung:**
  - Nutze `localStorage` im Browser, um Lernzeit und Spielzeit dauerhaft zu speichern
  - Keine Anmeldung oder Server nötig

---

## Technische Umsetzung

### 1. Frontend

- **Technologien:**
  - HTML, CSS, JavaScript
- **Design:**
  - Einfaches, Minecraft-inspiriertes Design (Block-Optik)
  - Klare Buttons und Anzeigen

### 2. Backend

- **Kein Backend nötig**, da alles lokal im Browser läuft

### 3. Datenstruktur

Alle Zeiten werden intern in **Sekunden** gespeichert.
Die Anzeige erfolgt umgerechnet in `hh:mm:ss`.

**Beispiel für `localStorage` (Schlüssel: `learnPlayTime`):**

```json
{
  "balance": 3720,
  "dailyLimit": 3600,
  "history": [
    {
      "type": "study",
      "seconds": 5400,
      "start": "2026-04-01T14:00:00",
      "end": "2026-04-01T15:30:00"
    },
    {
      "type": "play",
      "seconds": 1680,
      "start": "2026-04-01T16:00:00",
      "end": "2026-04-01T16:28:00"
    }
  ]
}
```

**Top-Level-Felder:**

| Feld         | Typ      | Beschreibung                                               |
| ------------ | -------- | ---------------------------------------------------------- |
| `balance`    | `number` | Aktuelles Guthaben in Sekunden (kann negativ sein)         |
| `dailyLimit` | `number` | Maximale Spielzeit pro Tag in Sekunden (fest: 3600)        |
| `history`    | `array`  | Chronologische Liste aller Lern- und Spielzeit-Einträge    |

**Felder eines `history`-Eintrags:**

| Feld      | Typ      | Beschreibung                            |
| --------- | -------- | --------------------------------------- |
| `type`    | `string` | `"study"` oder `"play"`                 |
| `seconds` | `number` | Dauer der Sitzung in Sekunden           |
| `start`   | `string` | Startzeitpunkt als ISO-8601-Timestamp   |
| `end`     | `string` | Endzeitpunkt als ISO-8601-Timestamp     |
