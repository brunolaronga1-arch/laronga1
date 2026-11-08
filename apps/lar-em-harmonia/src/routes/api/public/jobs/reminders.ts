import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { occursOn, todaySP, nowMinutesSP, weekday, type Frequency } from "@/lib/recurrence";
import { decideReminders } from "@/lib/reminders";


export const Route = createFileRoute("/api/public/jobs/reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { sendPush } = await import("@/lib/push.server");

        const today = todaySP();
        const nowMin = nowMinutesSP();
        const [{ data: tasks }, { data: occs }, { data: people }, { data: settings }, { data: roles }] = await Promise.all([
          supabaseAdmin.from("tasks").select("*").eq("active", true).not("hour", "is", null),
          supabaseAdmin.from("task_occurrences").select("*").eq("occ_date", today),
          supabaseAdmin.from("profiles").select("id, kind, display_name").eq("active", true),
          supabaseAdmin.from("settings").select("cleaner_weekdays, default_reminder_before, default_pending_after, notify_admins_pending").eq("id", 1).maybeSingle(),
          supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin"),
        ]);
        const cleanerToday = (settings?.cleaner_weekdays ?? [2, 4]).includes(weekday(today));
        const adminIds = new Set((roles ?? []).map((r) => r.user_id));
        const persons = (people ?? []).map((p) => ({ id: p.id, kind: p.kind, name: p.display_name, isAdmin: adminIds.has(p.id) }));
        const defaults = { pre: settings?.default_reminder_before ?? 10, post: settings?.default_pending_after ?? 30, notifyAdmins: settings?.notify_admins_pending ?? true };
        const occBy = new Map((occs ?? []).map((o) => [o.task_id, o]));
        const rows: { user_id: string; title: string; body: string; link: string; dedup_key: string }[] = [];

        for (const t of tasks ?? []) {
          if (!occursOn({ ...t, frequency: t.frequency as Frequency }, today)) continue;
          const link = `/tarefa/${t.id}?d=${today}`; // always relative: the app resolves it on its own origin
          for (const r of decideReminders({ task: t, occ: occBy.get(t.id) ?? null, today, nowMin, defaults, cleanerToday, people: persons }))
            rows.push({ ...r, link });
        }
        if (rows.length) await supabaseAdmin.from("notifications").upsert(rows, { onConflict: "dedup_key", ignoreDuplicates: true });

        // Deliver every not-yet-pushed notification from the last 2 hours (includes stock alerts).
        const since = new Date(Date.now() - 2 * 3600_000).toISOString();
        const { data: pending } = await supabaseAdmin.from("notifications").select("*").is("pushed_at", null).gte("created_at", since).limit(200);
        let sent = 0;
        for (const n of pending ?? []) {
          const { data: toks } = await supabaseAdmin.from("push_tokens").select("token").eq("user_id", n.user_id);
          const errors: string[] = [];
          for (const { token } of toks ?? []) {
            const link = n.link?.startsWith("/") ? n.link : "/avisos";
            const r = await sendPush(token, n.title, n.body, link);
            if (r.ok) sent++;
            else {
              errors.push(r.error);
              if (r.stale) await supabaseAdmin.from("push_tokens").delete().eq("token", token);
            }
          }
          await supabaseAdmin.from("notifications").update({
            pushed_at: new Date().toISOString(),
            push_error: !toks?.length ? "Nenhum aparelho com avisos ativados" : errors[0] ?? null,
          }).eq("id", n.id);
        }
        return Response.json({ created: rows.length, sent });
      },
    },
  },
});
