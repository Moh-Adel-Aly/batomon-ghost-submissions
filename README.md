# Batomon Ghost Submissions

This public repository stores Batomon team snapshots labeled with the public trainer name chosen in-game. The game sends a snapshot automatically when a player enters a regular match. Each record contains the display name, a salted pseudonymous browser key, the round, trainer, unspent gold, Chews, training stats, six active slots, and four reserve slots. It does not include the raw browser ID, account identity, email, password, or save file. Names are not verified; players can reuse or impersonate names, and the name plus team can be publicly visible. Players should not enter personal information.

The game server validates each upload against its current creature, trainer, and item catalog, caps creature levels by round, and writes it under `incoming/`. A GitHub Actions workflow independently validates incoming files and rebuilds [`pool.json`](pool.json), which is the public opponent feed.

Level 2 is allowed from round 1. Level-3 count caps are 0 before round 3, 1 before round 6, 3 before round 9, then 6. Names are limited to 2–20 Unicode letters or numbers, spaces, underscores, and hyphens. At most 100 submitted teams per round are included in the pool. Complete round 3, 6, and 9 snapshots are grouped into returning rivals; the game prefers player rivals when at least eight are available.

`catalog.json` mirrors the game content IDs. Update it when the game adds or removes creatures, trainers, or items.
