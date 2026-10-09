# Hasura metadata (Nhost)

`metadata.json` is a snapshot of this project's live Hasura metadata —
table tracking, relationships, and permissions. It's tracked here so
schema/permission changes go through a PR and deploy automatically,
instead of being made by hand in the Nhost dashboard and forgotten.

## Local workflow

1. Make your change in the Nhost dashboard (Hasura console) against the
   dev/staging project, or directly if you don't have a staging env.
2. Export the result over this file:

   ```bash
   npm run hasura:export
   ```

3. Commit the diff and open a PR. Review the metadata diff like any
   other code change — it's a readable JSON diff of what permission or
   relationship changed.
4. On merge to `main`, [.github/workflows/hasura-metadata.yml](../.github/workflows/hasura-metadata.yml)
   applies `hasura/metadata.json` to the live project automatically via
   Hasura's `replace_metadata` API, using the `NHOST_ADMIN_SECRET`
   repo secret.

## What this does *not* automate

This only syncs **metadata** (permissions, relationships, tracked
tables) — it does not run schema migrations (`CREATE TABLE`,
`ALTER TABLE`, etc.). Those still require either running SQL by hand
against the project, or adopting the full Hasura/Nhost CLI migration
workflow. Schema changes are left as a manual, reviewed step on
purpose — `replace_metadata` is safe to automate because it's
idempotent and non-destructive; raw SQL migrations are not, and
shouldn't run unattended.
