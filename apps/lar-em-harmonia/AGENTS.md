<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- All sheets share navigation dismissal and Back interception in the Sheet primitive; bottom sheets keep the title/close control outside the scrolling body so small screens cannot clip them.
- Single household: access = active row in `profiles`; roles live in `user_roles` (admin/baba/limpeza) and every permission is enforced by RLS + triggers, not the UI.
- Auth: login is BR mobile + password via server fn `loginWithPhone` (lookup by `profiles.phone_e164`, sign-in server-side, returns only tokens; synthetic `phoneToEmail` stays the auth e-mail unless a parent sets a recovery e-mail). Accounts are created only server-side (first-admin bootstrap, then `members.functions.ts`). Lockout/recovery limits and admin rules are pure in `src/lib/auth-rules.ts` (tested), counters in `auth_attempts`, management log in `member_audit`.
- Block/revoke = auth ban + `profiles.blocked`/`revoked_at` checked inside `is_member`/`has_role`/`my_kind`, so old sessions fail RLS; sessions are killed via `revoke_user_sessions`. Recovery e-mail: native change-email can't be used (it also mails the unreachable synthetic address), so the server swaps the auth e-mail and proves ownership with the native magic link (`recovery_email_confirmed_at`).
- Recurrence is computed in `src/lib/recurrence.ts` (pure, tested); `task_occurrences` stores per-day status/overrides only, so editing one day = occurrence row, editing the series = `tasks` row.
- Reminders: one managed cron (`/api/public/jobs/reminders`, every 5 min) creates deduplicated `notifications` rows and pushes unsent ones via FCM; `notifications.channel` leaves room for WhatsApp later. Pre/post decision logic is pure in `src/lib/reminders.ts` (tested); per-task `pre_minutes`/`post_minutes` NULL = use `settings` defaults, 0 = off (old `reminder_before`/`pending_after` are deprecated).
- Stock → shopping list sync happens in the `product_status_changed` DB trigger, so it applies regardless of client.
- Staff (babá/limpeza) only record; parents plan. Staff UI branches on `me.isAdmin` inside the same routes (TaskCard `staff`, `StaffToday`, `StaffStock`) rather than separate routes, so permissions stay in RLS.
- Isabela quick diary lives in `diary_entries` (helpers in `src/lib/diary.ts`); note chips and diary options are admin-editable JSON in `settings` (`note_chips`, `diary_options`) with code defaults as fallback.
- Parents get live updates via one Realtime channel in `_authenticated/route.tsx` that only invalidates React Query keys (RLS filters events); never patch cache from payloads.
- Play "origin" (`play_activities.origin` pais|app) is separate from `source` (citation). Daily play = settings `daily_play_*` for today > scheduled play > `pickDailyPlay` (pure, date-stable, in `src/lib/play.ts`); "Fizemos" is a diary `nota` with `data.play_id`.
- Profile accent color comes from `data-profile` (limpeza|baba|pais) on the shell and `<html>`, which overrides `--primary`/`--brand-*` in styles.css; components use `bg-primary`/`bg-brand-soft`, never per-profile classes. Task/stock states use the single `StatusBadge`/`st-*` pastel tokens.
- `notifications.link` is always an in-app relative path (DB CHECK); the app follows it with the router and the messaging service worker resolves it on its own origin. Deleting a profile cascades its notifications/push tokens/favorites via trigger; revoke keeps them.
- PWA: `vite-plugin-pwa` generateSW emits `/sw.js` into `dist/client`, registered only by `src/lib/pwa.ts` (refuses dev/preview/iframe/`?sw=off`); navigations NetworkFirst, no API caching. Offline data = React Query persisted to localStorage (cleared on sign-out); write buttons carry `data-write` and are disabled by `html[data-offline]`. Firebase messaging SW uses its own scope `/firebase-cloud-messaging-push-scope` so the two workers never replace each other.
- Invites: self sign-up only via one-time `invites` (service-role only, SHA-256 token hash; raw token only in the link fragment `#t=` and POST body). Validity rules are pure in `auth-rules.ts` (`inviteProblem`, tested); attempts per invite/IP reuse `auth_attempts`; accept claims the invite atomically before creating the account. Resend rotates the token.
- Invitation acceptance derives identity exclusively from the stored invite; shared pure form rules validate required identity and matching passwords. Invited parents bypass completion screens because their recovery address is already collected, while email confirmation remains required for recovery.

- Completion ink is rendered by PenCheck only on an observed transition to done; existing completed rows remain still, replacing celebratory confetti.
- DiaryTimeline owns the shared single-color event/sleep-duration visualization and display-only emoji labels; stored diary option values remain unchanged.
