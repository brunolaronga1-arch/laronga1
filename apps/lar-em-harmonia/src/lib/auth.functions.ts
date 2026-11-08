import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isSyntheticEmail, loginLockedUntil, LOGIN_WINDOW_MS, normalizeBRPhone, passwordProblem, recoveryAllowed } from "./auth-rules";

const GENERIC = "Celular ou senha incorretos.";
const DISABLED = "Acesso desativado. Fale com o pai ou a mãe.";

type LoginResult =
  | { ok: true; access_token: string; refresh_token: string; mustChange: boolean }
  | { ok: false; error: string };

/** Phone + password login. Never returns the account e-mail; errors are generic. */
export const loginWithPhone = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ phone: z.string().max(30), password: z.string().min(1).max(72) }).parse(d))
  .handler(async ({ data }): Promise<LoginResult> => {
    const { supabaseAdmin, anonClient, recentAttempts, recordAttempt } = await import("./auth.server");
    const phone = normalizeBRPhone(data.phone);
    if (!phone) return { ok: false, error: GENERIC };
    const attempts = await recentAttempts(phone, "login", LOGIN_WINDOW_MS * 2);
    if (loginLockedUntil(attempts, Date.now()))
      return { ok: false, error: "Muitas tentativas com este celular. Tente de novo em 15 minutos." };

    const { data: prof } = await supabaseAdmin.from("profiles").select("id, active, blocked, revoked_at, must_change_password").eq("phone_e164", phone).maybeSingle();
    if (!prof) { await recordAttempt(phone, "login", false); return { ok: false, error: GENERIC }; }
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(prof.id);
    const email = u.user?.email;
    if (!email) { await recordAttempt(phone, "login", false); return { ok: false, error: GENERIC }; }

    const { data: s, error } = await anonClient().auth.signInWithPassword({ email, password: data.password });
    if (error || !s.session) {
      const banned = /banned/i.test(error?.message ?? "") || error?.code === "user_banned";
      if (banned) { await recordAttempt(phone, "login", false); return { ok: false, error: DISABLED }; }
      await recordAttempt(phone, "login", false);
      return { ok: false, error: GENERIC };
    }
    await recordAttempt(phone, "login", true);
    if (!prof.active || prof.blocked || prof.revoked_at) {
      const { revokeSessions } = await import("./auth.server");
      await revokeSessions(prof.id);
      return { ok: false, error: DISABLED };
    }
    await supabaseAdmin.from("profiles").update({ last_sign_in_at: new Date().toISOString() }).eq("id", prof.id);
    return { ok: true, access_token: s.session.access_token, refresh_token: s.session.refresh_token, mustChange: prof.must_change_password };
  });

const RECOVERY_MSG = "Se este celular for de pai ou mãe com e-mail cadastrado, enviamos um link. Babá e limpeza: peça ao pai ou à mãe para redefinir sua senha.";

/** Sends the native reset e-mail only to parents with a confirmed recovery e-mail. Same answer in every case. */
export const requestRecovery = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ phone: z.string().max(30) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin, anonClient, recentAttempts, recordAttempt } = await import("./auth.server");
    const phone = normalizeBRPhone(data.phone);
    if (!phone) return { message: RECOVERY_MSG };
    const reqs = (await recentAttempts(phone, "recovery", 60 * 60_000)).map((a) => a.at);
    const allowed = recoveryAllowed(reqs, Date.now());
    if (!allowed.ok)
      return { message: allowed.reason === "cooldown" ? "Aguarde 1 minuto antes de pedir de novo." : "Limite de pedidos atingido. Tente de novo em 1 hora." };
    await recordAttempt(phone, "recovery", true);

    const { data: prof } = await supabaseAdmin.from("profiles").select("id, kind, active, blocked, revoked_at, recovery_email_confirmed_at").eq("phone_e164", phone).maybeSingle();
    if (!prof || !(prof.kind === "pai" || prof.kind === "mae") || !prof.active || prof.blocked || prof.revoked_at || !prof.recovery_email_confirmed_at) return { message: RECOVERY_MSG };
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(prof.id);
    const email = u.user?.email;
    if (!email || isSyntheticEmail(email)) return { message: RECOVERY_MSG };

    const req = getRequest();
    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    const { error } = await anonClient().auth.resetPasswordForEmail(email, { redirectTo: `${origin}/redefinir-senha` });
    if (error) console.error("[auth] reset e-mail failed:", error.message);
    return { message: RECOVERY_MSG };
  });

/** Signed-in password change (mandatory change, or from Meu perfil). Ends other sessions. */
export const changeMyPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ password: z.string().max(72) }).parse(d))
  .handler(async ({ data, context }) => {
    const problem = passwordProblem(data.password);
    if (problem) throw new Error(problem);
    const { supabaseAdmin, audit } = await import("./auth.server");
    // Admin update ends every session (incl. this one); sign in again with the new password and hand back a fresh session.
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, { password: data.password });
    if (error) throw new Error(/weak|pwned|known/i.test(error.message) ? "Senha muito comum ou vazada. Escolha outra." : "Não foi possível trocar a senha.");
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const { anonClient } = await import("./auth.server");
    const { data: s } = await anonClient().auth.signInWithPassword({ email: u.user!.email!, password: data.password });
    await supabaseAdmin.from("profiles").update({ must_change_password: false }).eq("id", context.userId);
    await audit(context.userId, context.userId, "trocou_senha");
    return { ok: true, access_token: s.session?.access_token ?? null, refresh_token: s.session?.refresh_token ?? null };
  });
/** After a recovery link: clear the mandatory-change flag and end other sessions. */
export const finishRecovery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin, audit } = await import("./auth.server");
    await supabaseAdmin.from("profiles").update({ must_change_password: false }).eq("id", context.userId);
    await endOtherSessions(context.userId, context.claims);
    await audit(context.userId, context.userId, "redefiniu_senha_por_email");
    return { ok: true };
  });

/** Own recovery e-mail status (parents). */
export const myRecoveryEmail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("./auth.server");
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const { data: p } = await supabaseAdmin.from("profiles").select("recovery_email_confirmed_at").eq("id", context.userId).single();
    const { data: invitation } = await supabaseAdmin.from("invites").select("id").eq("used_by", context.userId).limit(1).maybeSingle();
    const email = u.user?.email && !isSyntheticEmail(u.user.email) ? u.user.email : null;
    return { email, confirmed: !!(email && p?.recovery_email_confirmed_at), invited: !!invitation };
  });

/**
 * Parents set a recovery e-mail. The native "change e-mail" flow would also mail the old technical
 * address (which cannot receive mail), so the account e-mail is switched server-side and ownership is
 * proven with the native magic link; recovery only uses it after that link is opened.
 */
export const setRecoveryEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ email: z.string().trim().toLowerCase().email().max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Apenas pai ou mãe têm e-mail de recuperação.");
    if (isSyntheticEmail(data.email)) throw new Error("E-mail inválido.");
    const { supabaseAdmin, anonClient, audit } = await import("./auth.server");
    const { data: last } = await supabaseAdmin.from("member_audit").select("created_at").eq("actor_id", context.userId).eq("action", "pediu_confirmacao_email").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (last && Date.now() - new Date(last.created_at).getTime() < 60_000) throw new Error("Aguarde 1 minuto antes de pedir de novo.");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, { email: data.email, email_confirm: true });
    if (error) throw new Error(/already|registered|exists/i.test(error.message) ? "Este e-mail já está em uso." : "Não foi possível usar este e-mail.");
    await supabaseAdmin.from("profiles").update({ recovery_email_confirmed_at: null }).eq("id", context.userId);
    const req = getRequest();
    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    const { error: e2 } = await anonClient().auth.signInWithOtp({ email: data.email, options: { shouldCreateUser: false, emailRedirectTo: `${origin}/confirmar-email` } });
    await audit(context.userId, context.userId, "pediu_confirmacao_email");
    if (e2) {
      console.error("[auth] confirmation e-mail failed:", e2.message);
      throw new Error(/mail server|receive/i.test(e2.message) ? "Este e-mail não pode receber mensagens. Confira o endereço." : /rate|seconds/i.test(e2.message) ? "Aguarde um pouco antes de pedir de novo." : "Não foi possível enviar a confirmação.");
    }
    return { ok: true };
  });

/** Called on /confirmar-email after the magic link signs the parent in. */
export const confirmRecoveryEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const amr = ((context.claims as { amr?: { method: string; timestamp: number }[] }).amr ?? []);
    const viaLink = amr.some((a) => (a.method === "otp" || a.method === "magiclink") && Date.now() / 1000 - a.timestamp < 15 * 60);
    if (!viaLink) throw new Error("Abra o link enviado ao seu e-mail para confirmar.");
    const { supabaseAdmin, audit } = await import("./auth.server");
    await supabaseAdmin.from("profiles").update({ recovery_email_confirmed_at: new Date().toISOString() }).eq("id", context.userId);
    await audit(context.userId, context.userId, "confirmou_email");
    return { ok: true };
  });

async function endOtherSessions(userId: string, claims: unknown) {
  const { supabaseAdmin } = await import("./auth.server");
  const keep = (claims as { session_id?: string })?.session_id ?? null;
  const { error } = await supabaseAdmin.rpc("revoke_other_sessions", { _user_id: userId, _keep: keep as string });
  if (error) console.error("[auth] revoke other sessions failed", error.message);
}
