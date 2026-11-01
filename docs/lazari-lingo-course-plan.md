# Lazari Lingo course plan

Content spec for the first Lazari Lingo course. Terms are defined in `CONTEXT.md`; the delivery decision is in `docs/adr/0003-lazari-lingo-course-content-lives-in-the-repo.md`.

## Structure

```
Starter Topic (always unlocked)
  └─ unlocks, once all 8 A1 Exams are fully passed:
     ├─ მცხობელი (Bäcker)
     ├─ მზარეული (Koch)
     ├─ ოფიციანტი (Kellner)
     └─ მასაჟისტი (Masseur/in)
```

- Topic names: Georgian first, German in brackets. Starter is `სტარტერ (Starter)`.
- Every learner who completes Starter gets all four Job Topics.
- Exam Level: A1 only for now. A2 Exams are added later at the end of the same Topics, unlocked by the last A1 Exam. Starter's unlock minimum stays at 8.
- Within a Topic, Exams form a single chain: Exam 1 is always unlocked, each Exam unlocks the next.
- `TopicType` becomes `STARTER`, `BAECKER`, `KOCH`, `KELLNER`, `MASSEUR`. `FREIZEIT_PARK`, `GARTEN_LANDSCHAFTBAU`, `HOTEL` are removed.

## Exam shape (every A1 Exam)

- 10 Exercises, estimated 5–10 minutes.
- Order: recognise (`CHOOSE_FROM_TEXT`, `CHOOSE_FROM_AUDIO`) → match (`CHOOSE_MATCHING_PATTERNS`) → produce (`INPUT_FROM_TEXT`, `INPUT_FROM_AUDIO`, `INPUT_SENTENCE_FROM_TEXT`).
- Prompts in Georgian, answers in German.
- Matching Exercises (`CHOOSE_MATCHING_PATTERNS`) have 2–6 Matching Pairs (`matchingPairs: [{ "term": "Brot", "meaning": "პური" }]`), usually 4–5.
- `minimumCorrectAnswerCount`: 8, `minimumPassedCount`: 2, `waitUntilPassAllowedInSeconds`: 14400.
- Audio: normal speed via Narakeet (voice `monika`). `slowAudioUrl` left empty.

## Starter Topic (8 A1 Exams)

1. Greetings and goodbyes
2. Introducing yourself: name, country, age
3. Numbers 0–100 and prices
4. Time and dates: clock, weekdays, months
5. Polite survival phrases: bitte, danke, „Ich verstehe nicht“, „Können Sie das wiederholen?“
6. At work: Chef/Chefin, Kollege, Schicht, Pause, Feierabend, Urlaub, krank
7. Body and health: body parts, „Es tut weh“, Arzt, Apotheke
8. Everyday life: Wohnung, Bus, Bahnhof, Supermarkt, directions

## Job Topics (6 A1 Exams each)

### Bäcker

1. The bakery: Backstube, Ofen, Blech, Teig, Mehl
2. Ingredients and quantities: Gramm, Kilo, Liter, Hefe, Zucker, Salz
3. Bread and pastries: Brot, Brötchen, Brezel, Kuchen
4. Work steps: kneten, formen, backen, wiegen, schneiden
5. Shift and time: Frühschicht, um 3 Uhr, fertig
6. Hygiene and safety: Hände waschen, heiß, Vorsicht

### Koch

1. The kitchen: Herd, Pfanne, Topf, Messer, Schneidebrett
2. Vegetables, meat, fish
3. Cooking methods: braten, kochen, schneiden, schälen
4. Kitchen orders: „Zwei Schnitzel!“, „Ja, Chef!“, sofort, fertig
5. Quantities and storage: Kühlschrank, frisch, abgelaufen
6. Hygiene, allergens, safety

### Kellner

1. The restaurant: Tisch, Stuhl, Speisekarte, Glas, Besteck
2. Greeting guests: „Haben Sie reserviert?“, „Für wie viele Personen?“
3. Drinks
4. Taking orders: „Was möchten Sie?“, „Sonst noch etwas?“
5. Food and allergens: vegetarisch, ohne Nüsse
6. The bill: zusammen oder getrennt, bar, Karte, Trinkgeld

### Masseur(in)

1. The practice: Liege, Handtuch, Öl, Termin
2. Body parts in detail
3. Greeting clients and booking: „Wann haben Sie Zeit?“
4. Instructions: „Bitte legen Sie sich hin“, „Drehen Sie sich um“
5. Pressure and pain: fester, sanfter, „Tut das weh?“
6. Massage types and duration: 30 Minuten, Rücken, Nacken

## Delivery

Content lives in `apps/learning-app-admin/course/<topic-id>/`: one `topic.json` and one file per Exam in `exams/`, ordered by file name (`01-greetings.json`, …).

- `pnpm --filter @lazariways/learning-app-admin course:check` validates the content without touching the database or audio.
- `pnpm --filter @lazariways/learning-app-admin course:import` imports it:
  - Topics and Exams are upserted by their `id`; never change an `id` once imported, or learner progress on that Exam is lost.
  - Exams in a Topic are chained by file order: the first is always unlocked, each unlocks the next.
  - Exercises of each imported Exam are replaced.
  - Audio is generated from each Exercise's `audioText` and stored under a hash of the text, so unchanged text is never regenerated.
  - Exams removed from a Topic's folder are disabled, not deleted.
- Each Topic stays `"enabled": false` until its content PR is merged.

## Review

- One content PR per Topic (about 60–80 Exercises).
- Each PR needs sign-off from a native or fluent German speaker and a native Georgian speaker before the import runs on production.
- `correctInputs` must list every accepted spelling (e.g. `Brötchen` and `Broetchen`).
