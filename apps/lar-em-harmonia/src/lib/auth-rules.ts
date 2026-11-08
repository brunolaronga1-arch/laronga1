/** Pure rules for login, recovery and people management (tested in auth-rules.test.ts). */

/** Brazilian mobile → E.164 (+55DDD9XXXXXXXX). Accepts masks, +55, 55, leading 0. Returns null if invalid. */
export function normalizeBRPhone(input: string): string | null {
  let d = (input ?? "").replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length === 12 && d.startsWith("0")) d = d.slice(1);
  if (d.length !== 11) return null;
  if (d[2] !== "9") return null;
  if (d[0] === "0" || d[1] === "0") return null;
  return `+55${d}`;
}

/** "(11) 99999-9999" from any partial input (used while typing). */
export function maskBRPhone(input: string): string {
  let d = (input ?? "").replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const formatPhone = (p: string) => maskBRPhone(p);

export const LOGIN_MAX_FAILS = 5;
export const LOGIN_WINDOW_MS = 15 * 60_000;

/** Lockout: 5 failures (since the last success) within 15 min block the phone for 15 min after the 5th. */
export function loginLockedUntil(attempts: { success: boolean; at: number }[], now: number): number | null {
  const recent = attempts.filter((a) => now - a.at < LOGIN_WINDOW_MS * 2).sort((a, b) => a.at - b.at);
  const lastOk = Math.max(-Infinity, ...recent.filter((a) => a.success).map((a) => a.at));
  const fails = recent.filter((a) => !a.success && a.at > lastOk).map((a) => a.at);
  for (let i = fails.length - 1; i >= LOGIN_MAX_FAILS - 1; i--) {
    const fifth = fails[i]!;
    const first = fails[i - (LOGIN_MAX_FAILS - 1)]!;
    if (fifth - first < LOGIN_WINDOW_MS && now - fifth < LOGIN_WINDOW_MS) return fifth + LOGIN_WINDOW_MS;
  }
  return null;
}

/** Recovery: at most 3 per hour and 1 per 60 s for the same phone. */
export function recoveryAllowed(requests: number[], now: number): { ok: true } | { ok: false; reason: "cooldown" | "hourly" } {
  const lastHour = requests.filter((t) => now - t < 60 * 60_000);
  if (lastHour.some((t) => now - t < 60_000)) return { ok: false, reason: "cooldown" };
  if (lastHour.length >= 3) return { ok: false, reason: "hourly" };
  return { ok: true };
}

/** At least 8 chars with letters and numbers. Returns an error message or null. */
export function passwordProblem(pw: string): string | null {
  if (!pw || pw.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (pw.length > 72) return "Senha longa demais.";
  if (!/[A-Za-zÀ-ÿ]/.test(pw) || !/\d/.test(pw)) return "Use letras e números na senha.";
  if (/^(.)\1+$/.test(pw.replace(/\d/g, "")) && /^(\d)\1+$/.test(pw.replace(/\D/g, ""))) return "Senha muito fraca.";
  return null;
}

export type ManageAction = "block" | "unblock" | "revoke" | "set_kind" | "reset_password";
export interface ManageTarget { id: string; isActiveAdmin: boolean }

/** Server-side rule set for people management. Returns an error message or null. */
export function manageProblem(
  action: ManageAction,
  actorId: string,
  target: ManageTarget,
  activeAdminCount: number,
  newKindIsAdmin?: boolean,
): string | null {
  const self = actorId === target.id;
  const removesAdmin = action === "block" || action === "revoke" || (action === "set_kind" && newKindIsAdmin === false);
  if (self && removesAdmin) {
    if (action === "block") return "Você não pode bloquear a si mesmo.";
    if (action === "revoke") return "Você não pode revogar o próprio acesso.";
    return "Você não pode tirar a si mesmo de pai/mãe.";
  }
  if (removesAdmin && target.isActiveAdmin && activeAdminCount <= 1) return "É preciso manter pelo menos um pai ou mãe ativo.";
  if (self && action === "reset_password") return "Para trocar a sua senha, use Meu perfil.";
  return null;
}

/** Generates a readable provisional password (letters + digits, no ambiguous chars). */
export function generatePassword(rand: (n: number) => number): string {
  const L = "abcdefghjkmnpqrstuvwxyz", D = "23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += L[rand(L.length)];
  s = s[0]!.toUpperCase() + s.slice(1);
  for (let i = 0; i < 4; i++) s += D[rand(D.length)];
  return s;
}

export const SYNTHETIC_DOMAIN = "@planner-isabela.app";
export const isSyntheticEmail = (e: string | null | undefined) => !e || e.endsWith(SYNTHETIC_DOMAIN);

/** "Fazer depois" on the parents' complete-profile screen snoozes it for 3 days. */
export const COMPLETE_PROFILE_SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
export function completeProfileDue(confirmed: boolean, snoozedAt: number | null, now: number, invited = false): boolean {
  if (confirmed || invited) return false;
  return snoozedAt === null || now - snoozedAt >= COMPLETE_PROFILE_SNOOZE_MS;
}

// ---------- invites ----------
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const INVITE_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
export const INVITE_MAX_ATTEMPTS = 10; // per invite and per IP in the window

export interface InviteState { expires_at: string; used_at: string | null; revoked_at: string | null; expected_phone_e164: string | null }

/** Why an invite can't be used (null = usable). `phone` is the normalized E.164 typed by the person, if any. */
export function inviteProblem(inv: InviteState | null, now: number, phone?: string | null): string | null {
  if (!inv) return "Convite inválido. Peça um novo ao pai ou à mãe.";
  if (inv.revoked_at) return "Este convite foi cancelado. Peça um novo ao pai ou à mãe.";
  if (inv.used_at) return "Este convite já foi usado. Se a conta é sua, entre com celular e senha.";
  if (new Date(inv.expires_at).getTime() <= now) return "Este convite expirou. Peça um novo ao pai ou à mãe.";
  if (phone !== undefined && inv.expected_phone_e164 && phone !== inv.expected_phone_e164)
    return "Este celular não é o do convite. Use o número informado pelo pai ou pela mãe.";
  return null;
}

export const inviteTooManyAttempts = (attempts: number) => attempts >= INVITE_MAX_ATTEMPTS;
