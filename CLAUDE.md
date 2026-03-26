# Project instructions

- Use the existing Supabase schema. Do not invent columns.
- Read the current schema before proposing SQL changes.
- For write paths, check RLS policies before editing API code.
- Run `npm run build` after any code changes.
- Prefer focused diffs over repo-wide refactors.
- The admin client uses the service role key — `auth.uid()` returns null. Always pass `created_by_user_id` and `modified_by_user_id` explicitly from the authenticated user on every insert/update.
