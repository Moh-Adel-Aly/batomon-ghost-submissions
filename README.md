# Batomon Ghost Submissions

This public repository stores anonymous Batomon team snapshots. The game sends a snapshot when a player enters a regular match. It contains the round, trainer, items, and six team slots; it excludes the player's name, save file, and account identity.

The game server validates each upload against its current creature, trainer, and item catalog, caps creature levels by round, and writes it under `incoming/`. A GitHub Actions workflow independently validates incoming files and rebuilds [`pool.json`](pool.json), which is the public opponent feed.

Round caps: rounds 1–3 allow level 1, rounds 4–6 allow level 2, and rounds 7–9 allow level 3. At most 100 submitted teams per round are included in the pool.

`catalog.json` mirrors the game content IDs. Update it when the game adds or removes creatures, trainers, or items.
