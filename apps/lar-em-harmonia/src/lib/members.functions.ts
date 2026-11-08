import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { phoneToEmail } from "./labels";
import { inviteIdentity, inviteAccessProblem } from "./invite-form";
import { generatePassword, manageProblem, normalizeBRPhone, passwordProblem, type ManageAction } from "./auth-rules";

const kindSchema = z.enum(["pai", "mae", "baba", "limpeza"]);
type MemberKind = z.infer<typeof kindSchema>;
const isAdminKind = (k: string) => k === "pai" || k === "mae";
const roleFor = (k: string) => (isAdminKind(k) ? "admin" : k) as "admin" | "baba" | "limpeza";
const BAN_FOREVER = "876000h";

function randInt(n: number) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0]! % n;
}

async function createAccount(input: { display_name: string; phone: string; password: string; kind: MemberKind; mustChange: boolean }) {
  const { supabaseAdmin } = await import("./auth.server");
  const e164 = normalizeBRPhone(input.phone);
  if (!e164) throw new Error("Celular inválido. Use DDD + número, ex.: (11) 99999-9999.");
  const { data: dup } = await supabaseAdmin.from("profiles").select("id").eq("phone_e164", e164).maybeSingle();
  if (dup) throw new Error("Este celular já está cadastrado.");
  const national = e164.slice(3);
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: phoneToEmail(national),
    password: input.password,
    email_confirm: true,
    user_metadata: { display_name: input.display_name },
  });
  if (error || !created.user) {
    const msg = error?.message ?? "";
    if (msg.includes("already")) throw new Error("Este celular já está cadastrado.");
    if (/weak|pwned|known/i.test(msg)) throw new Error("Senha muito comum ou vazada. Escolha outra.");
    throw new Error("Falha ao criar conta.");
  }
  const uid = created.user.id;
  const p = await supabaseAdmin.from("profiles").insert({
    id: uid, display_name: input.display_name, phone: e164, phone_e164: e164, kind: input.kind, must_change_password: input.mustChange,
  });
  if (p.error) { await supabaseAdmin.auth.admin.deleteUser(uid); throw new Error("Falha ao criar perfil."); }
  const r = await supabaseAdmin.from("user_roles").insert({ user_id: uid, role: roleFor(input.kind) });
  if (r.error) throw new Error("Falha ao definir perfil.");
  return uid;
}

/** Public: tells the login page whether the family has been set up yet. */
export const needsSetup = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("./auth.server");
  const { count } = await supabaseAdmin.from("profiles").select("id", { count: "exact", head: true });
  return { needsSetup: (count ?? 0) === 0 };
});

/** Public, but only works while no account exists: creates the first parent (admin). */
export const setupFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ display_name: z.string().trim().min(1).max(60), phone: z.string().max(30), password: z.string().max(72), kind: z.enum(["pai", "mae"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, audit } = await import("./auth.server");
    const { count } = await supabaseAdmin.from("profiles").select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0) throw new Error("A família já foi configurada. Peça ao pai ou à mãe para cadastrar você.");
    const problem = passwordProblem(data.password);
    if (problem) throw new Error(problem);
    const id = await createAccount({ ...data, mustChange: false });
    await audit(id, id, "primeiro_acesso");
    return { ok: true };
  });

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!data) throw new Error("Apenas pai ou mãe podem fazer isso.");
}

export interface MemberRow {
  id: string; display_name: string; phone: string; kind: MemberKind;
  status: "ativo" | "bloqueado" | "revogado" | "troca_pendente";
  last_sign_in_at: string | null;
}

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MemberRow[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("./auth.server");
    const { data: profs } = await supabaseAdmin.from("profiles").select("*").order("created_at");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    const lastAuth = new Map((users?.users ?? []).map((u) => [u.id, u.last_sign_in_at ?? null]));
    return (profs ?? []).map((p) => ({
      id: p.id, display_name: p.display_name, phone: p.phone_e164 ?? p.phone, kind: p.kind,
      status: p.revoked_at || !p.active ? "revogado" : p.blocked ? "bloqueado" : p.must_change_password ? "troca_pendente" : "ativo",
      last_sign_in_at: p.last_sign_in_at ?? lastAuth.get(p.id) ?? null,
    }));
  });

export const createMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ display_name: z.string().trim().min(1).max(60), phone: z.string().max(30), kind: kindSchema }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { audit } = await import("./auth.server");
    const password = generatePassword(randInt);
    const id = await createAccount({ ...data, password, mustChange: true });
    await audit(context.userId, id, "cadastrou", { nome: data.display_name, perfil: data.kind });
    // Shown once to the admin; never stored or logged.
    return { id, password };
  });

const actionSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["block", "unblock", "revoke", "set_kind", "reset_password"]),
  kind: kindSchema.optional(),
});

export const manageMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => actionSchema.parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true; password?: string }> => {
    await assertAdmin(context);
    const { supabaseAdmin, audit, revokeSessions, activeAdminCount } = await import("./auth.server");
    const { data: target } = await supabaseAdmin.from("profiles").select("*").eq("id", data.id).maybeSingle();
    if (!target) throw new Error("Pessoa não encontrada.");
    if (target.revoked_at && data.action !== "reset_password") throw new Error("Acesso já revogado.");
    if (target.revoked_at) throw new Error("Acesso revogado não pode ser reativado.");
    if (data.action === "set_kind" && !data.kind) throw new Error("Escolha o perfil.");
    const isActiveAdmin = isAdminKind(target.kind) && target.active && !target.blocked && !target.revoked_at;
    const problem = manageProblem(data.action as ManageAction, context.userId, { id: target.id, isActiveAdmin }, await activeAdminCount(), data.kind ? isAdminKind(data.kind) : undefined);
    if (problem) throw new Error(problem);

    switch (data.action) {
      case "block": {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(target.id, { ban_duration: BAN_FOREVER });
        if (error) throw new Error("Falha ao bloquear.");
        await supabaseAdmin.from("profiles").update({ blocked: true }).eq("id", target.id);
        await revokeSessions(target.id);
        await audit(context.userId, target.id, "bloqueou");
        return { ok: true };
      }
      case "unblock": {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(target.id, { ban_duration: "none" });
        if (error) throw new Error("Falha ao desbloquear.");
        await supabaseAdmin.from("profiles").update({ blocked: false }).eq("id", target.id);
        await audit(context.userId, target.id, "desbloqueou");
        return { ok: true };
      }
      case "revoke": {
        await supabaseAdmin.auth.admin.updateUserById(target.id, { ban_duration: BAN_FOREVER });
        await supabaseAdmin.from("profiles").update({ active: false, blocked: true, revoked_at: new Date().toISOString() }).eq("id", target.id);
        await supabaseAdmin.from("user_roles").delete().eq("user_id", target.id);
        await revokeSessions(target.id);
        await audit(context.userId, target.id, "revogou", { nome: target.display_name });
        return { ok: true };
      }
      case "set_kind": {
        const kind = data.kind!;
        await supabaseAdmin.from("profiles").update({ kind }).eq("id", target.id);
        await supabaseAdmin.from("user_roles").delete().eq("user_id", target.id);
        const r = await supabaseAdmin.from("user_roles").insert({ user_id: target.id, role: roleFor(kind) });
        if (r.error) throw new Error("Falha ao alterar perfil.");
        await audit(context.userId, target.id, "alterou_perfil", { de: target.kind, para: kind });
        return { ok: true };
      }
      case "reset_password": {
        const password = generatePassword(randInt);
        const { error } = await supabaseAdmin.auth.admin.updateUserById(target.id, { password });
        if (error) throw new Error("Falha ao redefinir senha.");
        await supabaseAdmin.from("profiles").update({ must_change_password: true }).eq("id", target.id);
        await revokeSessions(target.id);
        await audit(context.userId, target.id, "redefiniu_senha");
        return { ok: true, password };
      }
    }
  });

export const listAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase.from("member_audit").select("*").order("created_at", { ascending: false }).limit(50);
    return (data ?? []) as { id: string; actor_id: string | null; target_id: string | null; action: string; details: Record<string, string>; created_at: string }[];
  });

// ======================= Invites =======================
// Token lives only in the link fragment (#t=…) and the POST body; only its SHA-256 is stored.

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
function newToken() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function clientIp() {
  const { getRequest } = await import("@tanstack/react-start/server");
  const h = getRequest().headers;
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export interface InviteRow { id: string; kind: MemberKind; expected_name: string | null; expected_phone: string | null; created_by_name: string | null; expires_at: string }

export const createInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ kind: kindSchema, name: z.string().trim().min(1).max(60), phone: z.string().min(1).max(30) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin, audit } = await import("./auth.server");
    const { INVITE_TTL_MS } = await import("./auth-rules");
    const identity = inviteIdentity(data.name, data.phone);
    if (!identity) throw new Error("Informe nome e celular válido com DDD.");
    const phone = identity.phone;
    const { data: dup } = await supabaseAdmin.from("profiles").select("id").eq("phone_e164", phone).maybeSingle();
    if (dup) throw new Error("Este celular já tem conta.");
    const token = newToken();
    const { data: inv, error } = await supabaseAdmin.from("invites").insert({
      token_hash: await sha256(token), kind: data.kind, expected_name: data.name || null, expected_phone_e164: phone,
      created_by: context.userId, expires_at: new Date(Date.now() + INVITE_TTL_MS).toISOString(),
    }).select("id").single();
    if (error || !inv) throw new Error("Não foi possível criar o convite.");
    await audit(context.userId, null, "convidou", { perfil: data.kind, nome: data.name || "", convite: inv.id });
    return { id: inv.id, token }; // shown once to the admin
  });

export const listInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InviteRow[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("./auth.server");
    const { data } = await supabaseAdmin.from("invites").select("id, kind, expected_name, expected_phone_e164, created_by, expires_at")
      .is("used_at", null).is("revoked_at", null).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false });
    const ids = [...new Set((data ?? []).map((i) => i.created_by).filter(Boolean))] as string[];
    const { data: profs } = ids.length ? await supabaseAdmin.from("profiles").select("id, display_name").in("id", ids) : { data: [] };
    const names = new Map((profs ?? []).map((p) => [p.id, p.display_name]));
    return (data ?? []).map((i) => ({ id: i.id, kind: i.kind, expected_name: i.expected_name, expected_phone: i.expected_phone_e164, created_by_name: i.created_by ? names.get(i.created_by) ?? null : null, expires_at: i.expires_at }));
  });

export const manageInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), action: z.enum(["revoke", "resend"]) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true; token?: string }> => {
    await assertAdmin(context);
    const { supabaseAdmin, audit } = await import("./auth.server");
    const { INVITE_TTL_MS } = await import("./auth-rules");
    const { data: inv } = await supabaseAdmin.from("invites").select("id, kind, used_at, revoked_at").eq("id", data.id).maybeSingle();
    if (!inv || inv.used_at || inv.revoked_at) throw new Error("Convite não está mais pendente.");
    if (data.action === "revoke") {
      await supabaseAdmin.from("invites").update({ revoked_at: new Date().toISOString() }).eq("id", inv.id);
      await audit(context.userId, null, "revogou_convite", { perfil: inv.kind, convite: inv.id });
      return { ok: true };
    }
    // Resend = new link (old one stops working) and 7 more days.
    const token = newToken();
    await supabaseAdmin.from("invites").update({ token_hash: await sha256(token), expires_at: new Date(Date.now() + INVITE_TTL_MS).toISOString() }).eq("id", inv.id);
    await audit(context.userId, null, "reenviou_convite", { perfil: inv.kind, convite: inv.id });
    return { ok: true, token };
  });

async function loadInvite(token: string) {
  const { supabaseAdmin } = await import("./auth.server");
  const { data } = await supabaseAdmin.from("invites").select("*").eq("token_hash", await sha256(token)).maybeSingle();
  return data;
}
async function guardAttempts(inviteId: string | null) {
  const { recentAttempts } = await import("./auth.server");
  const { INVITE_ATTEMPT_WINDOW_MS, inviteTooManyAttempts } = await import("./auth-rules");
  const ip = await clientIp();
  const byIp = await recentAttempts(`ip:${ip}`, "invite_ip", INVITE_ATTEMPT_WINDOW_MS);
  const byInv = inviteId ? await recentAttempts(`inv:${inviteId}`, "invite", INVITE_ATTEMPT_WINDOW_MS) : [];
  if (inviteTooManyAttempts(byIp.filter((a) => !a.success).length) || inviteTooManyAttempts(byInv.filter((a) => !a.success).length))
    throw new Error("Muitas tentativas. Tente de novo em 15 minutos.");
  return ip;
}
async function failAttempt(ip: string, inviteId: string | null) {
  const { recordAttempt } = await import("./auth.server");
  await recordAttempt(`ip:${ip}`, "invite_ip", false);
  if (inviteId) await recordAttempt(`inv:${inviteId}`, "invite", false);
}

const tokenSchema = z.string().min(20).max(100);

/** Public: what the invite page needs (profile, expected name, whether phone is fixed). */
export const checkInvite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token: tokenSchema }).parse(d))
  .handler(async ({ data }) => {
    const { inviteProblem } = await import("./auth-rules");
    const ip = await guardAttempts(null);
    const inv = await loadInvite(data.token);
    const problem = inviteProblem(inv, Date.now());
    if (problem || !inv) { if (!inv) await failAttempt(ip, null); return { ok: false as const, error: problem ?? "Convite inválido." }; }
    const identity = inviteIdentity(inv.expected_name, inv.expected_phone_e164);
    if (!identity) return { ok: false as const, error: "Peça ao pai ou à mãe um novo convite com seu nome e celular preenchidos." };
    return { ok: true as const, kind: inv.kind as MemberKind, name: identity.display_name, phone: identity.phone };
  });

/** Public: creates the account from a valid invite, marks it used and returns a session. */
export const acceptInvite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    token: tokenSchema,
    password: z.string().max(72), confirmation: z.string().max(72), email: z.string().trim().toLowerCase().email().max(120).optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin, anonClient, audit } = await import("./auth.server");
    const { inviteProblem, isSyntheticEmail } = await import("./auth-rules");
    const inv0 = await loadInvite(data.token);
    const ip = await guardAttempts(inv0?.id ?? null);
    const fail = async (msg: string) => { await failAttempt(ip, inv0?.id ?? null); return { ok: false as const, error: msg }; };
    const problem = inviteProblem(inv0, Date.now());
    if (problem || !inv0) return fail(problem ?? "Convite inválido.");
    const identity = inviteIdentity(inv0.expected_name, inv0.expected_phone_e164);
    if (!identity) return fail("Peça ao pai ou à mãe um novo convite com seu nome e celular preenchidos.");
    const phone = identity.phone;
    const pw = inviteAccessProblem(data.password, data.confirmation);
    if (pw) return { ok: false as const, error: pw };
    if (isAdminKind(inv0.kind) && (!data.email || isSyntheticEmail(data.email))) return { ok: false as const, error: "Informe seu e-mail de recuperação." };
    const { data: dup } = await supabaseAdmin.from("profiles").select("id").eq("phone_e164", phone).maybeSingle();
    if (dup) return fail("Este celular já tem conta. Use Esqueci minha senha.");

    // Claim atomically so two submits can't both use it.
    const { data: claimed } = await supabaseAdmin.from("invites").update({ used_at: new Date().toISOString() })
      .eq("id", inv0.id).is("used_at", null).is("revoked_at", null).select("id").maybeSingle();
    if (!claimed) return fail("Este convite já foi usado. Se a conta é sua, entre com celular e senha.");
    let uid: string;
    try {
      uid = await createAccount({ ...identity, password: data.password, kind: inv0.kind as MemberKind, mustChange: false });
      if (isAdminKind(inv0.kind) && data.email) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(uid, { email: data.email, email_confirm: true });
        if (error) {
          await supabaseAdmin.from("profiles").delete().eq("id", uid);
          await supabaseAdmin.auth.admin.deleteUser(uid);
          throw new Error(/already|registered|exists/i.test(error.message) ? "Este e-mail já está em uso." : "Não foi possível usar este e-mail.");
        }
      }
    } catch (e) {
      await supabaseAdmin.from("invites").update({ used_at: null }).eq("id", inv0.id);
      return { ok: false as const, error: (e as Error).message.replace("Este celular já está cadastrado.", "Este celular já tem conta. Use Esqueci minha senha.") };
    }
    await supabaseAdmin.from("invites").update({ used_by: uid }).eq("id", inv0.id);
    await audit(uid, uid, "aceitou_convite", { perfil: inv0.kind, convite: inv0.id, convidado_por: inv0.created_by ?? "" });
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(uid);
    const authEmail = u.user?.email;
    if (!authEmail) throw new Error("Conta criada. Entre com seu celular e senha.");
    const { data: s } = await anonClient().auth.signInWithPassword({ email: authEmail, password: data.password });
    if (!s.session) return { ok: true as const, access_token: null, refresh_token: null };
    await supabaseAdmin.from("profiles").update({ last_sign_in_at: new Date().toISOString() }).eq("id", uid);
    return { ok: true as const, access_token: s.session.access_token, refresh_token: s.session.refresh_token };
  });
