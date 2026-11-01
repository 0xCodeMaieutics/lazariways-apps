# Lazari Lingo course content lives in the repo

The Starter Topic and Job Topic content (Topics, Exams, Exercises) is authored as JSON files in the repo, reviewed through PRs, and written to production by an idempotent import script that upserts by stable ID and generates missing audio with Narakeet. The repo JSON is the source of truth for these Topics: edits made in the admin app are overwritten on the next import.

## Considered Options

- **Entering content through the admin app forms**: rejected. About 320 Exercises, each needing a separate audio generation, with no review step and no way to rebuild a database from scratch.
- **A bulk-import screen in the admin app**: rejected for now. It adds UI to build while still leaving the content unreviewed and outside version control.
- **Running the existing dev seed in production**: rejected. It also creates fake users and applications.

## Consequences

Content fixes go through a PR and a re-run of the import, not the admin app. The admin app remains usable for Topics outside the course.
