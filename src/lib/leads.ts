import { EMPRESA_ORIGEM } from "@/config";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
type UtmKey = (typeof UTM_KEYS)[number];
type Utms = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = "larong_utms";

/** Guarda as UTMs da primeira página vista na sessão (a URL pode perdê-las depois). */
export function captureUtms(): void {
  const fromUrl = readUtmsFromUrl();
  if (Object.keys(fromUrl).length === 0) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
  } catch {
    /* armazenamento indisponível: seguimos só com a URL */
  }
}

function readUtmsFromUrl(): Utms {
  const params = new URLSearchParams(window.location.search);
  const utms: Utms = {};
  UTM_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) utms[k] = v.slice(0, 200);
  });
  return utms;
}

function currentUtms(): Utms {
  const fromUrl = readUtmsFromUrl();
  if (Object.keys(fromUrl).length > 0) return fromUrl;
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") as Utms;
  } catch {
    return {};
  }
}

export type LeadInput = {
  nome: string;
  whatsapp: string; // apenas dígitos, com DDD
  perfil: string;
  temProjeto: string;
  previsaoObra: string;
  mensagem: string;
  consentimento: boolean;
};

export async function salvarLead(lead: LeadInput): Promise<void> {
  const utms = currentUtms();
  const row = {
    empresa_origem: EMPRESA_ORIGEM,
    nome: lead.nome.trim(),
    whatsapp: `55${lead.whatsapp}`,
    perfil: lead.perfil,
    tem_projeto_luminotecnico: lead.temProjeto,
    previsao_obra: lead.previsaoObra || null,
    mensagem: lead.mensagem.trim() || null,
    consentimento_lgpd: lead.consentimento,
    utm_source: utms.utm_source ?? null,
    utm_medium: utms.utm_medium ?? null,
    utm_campaign: utms.utm_campaign ?? null,
    utm_term: utms.utm_term ?? null,
    utm_content: utms.utm_content ?? null,
    pagina_origem: window.location.origin + window.location.pathname + window.location.search,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent.slice(0, 400),
    // created_at (data/hora) é preenchido pelo banco.
  };

  // Carregado sob demanda para manter o carregamento inicial da página leve.
  const { supabase } = await import("@/integrations/supabase/client");
  if (!supabase) {
    if (import.meta.env.DEV) {
      console.warn("[leads] Lovable Cloud não configurado — lead não salvo (modo desenvolvimento).", row);
      return;
    }
    throw new Error("Lovable Cloud não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).");
  }

  const { error } = await supabase.from("leads").insert(row);
  if (error) throw error;
}
