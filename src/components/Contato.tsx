import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { salvarLead } from "@/lib/leads";
import { onPerfilSelecionado, PERFIS } from "@/lib/perfil";
import { isValidPhoneBR, maskPhoneBR, phoneDigits } from "@/lib/phone";
import { trackLead } from "@/lib/tracking";
import { Arrow, WhatsAppLink } from "./WhatsAppLink";

const OPCOES_PROJETO = ["Sim", "Não", "Em andamento"] as const;
const OPCOES_PREVISAO = ["Até 30 dias", "1 a 3 meses", "3 a 6 meses", "Mais de 6 meses", "Ainda não sei"] as const;

type Campos = {
  nome: string;
  whatsapp: string;
  perfil: string;
  temProjeto: string;
  previsaoObra: string;
  mensagem: string;
  consentimento: boolean;
};

type Erros = Partial<Record<keyof Campos, string>>;

const INICIAL: Campos = {
  nome: "",
  whatsapp: "",
  perfil: "",
  temProjeto: "",
  previsaoObra: "",
  mensagem: "",
  consentimento: false,
};

function validar(c: Campos): Erros {
  const e: Erros = {};
  if (c.nome.trim().length < 2) e.nome = "Informe seu nome.";
  if (!isValidPhoneBR(c.whatsapp)) e.whatsapp = "Informe um WhatsApp válido com DDD.";
  if (!c.perfil) e.perfil = "Selecione o seu perfil.";
  if (!c.temProjeto) e.temProjeto = "Conte se já existe projeto luminotécnico.";
  if (!c.consentimento) e.consentimento = "É preciso concordar para enviarmos o contato.";
  return e;
}

function mensagemResumo(c: Campos): string {
  const linhas = [
    "Olá! Acabei de enviar meus dados pelo site da Larong.",
    `Nome: ${c.nome.trim()}`,
    `Perfil: ${c.perfil}`,
    `Projeto luminotécnico: ${c.temProjeto}`,
    `Previsão da obra: ${c.previsaoObra || "não informada"}`,
  ];
  return linhas.join("\n");
}

export function Contato() {
  const [campos, setCampos] = useState<Campos>(INICIAL);
  const [erros, setErros] = useState<Erros>({});
  const [status, setStatus] = useState<"idle" | "enviando" | "ok" | "erro">("idle");
  const confirmacaoRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;

  useEffect(() => onPerfilSelecionado((perfil) => setCampos((c) => ({ ...c, perfil }))), []);

  useEffect(() => {
    if (status === "ok") confirmacaoRef.current?.focus();
  }, [status]);

  function set<K extends keyof Campos>(k: K, v: Campos[K]) {
    setCampos((c) => ({ ...c, [k]: v }));
    if (erros[k]) setErros((e) => ({ ...e, [k]: undefined }));
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validar(campos);
    setErros(e);
    const primeiro = Object.keys(e)[0];
    if (primeiro) {
      formRef.current?.querySelector<HTMLElement>(`[data-campo="${primeiro}"]`)?.focus();
      return;
    }
    setStatus("enviando");
    try {
      await salvarLead({ ...campos, whatsapp: phoneDigits(campos.whatsapp) });
      trackLead({ perfil: campos.perfil, tem_projeto: campos.temProjeto });
      setStatus("ok");
    } catch (err) {
      console.error("[leads] falha ao salvar", err);
      setStatus("erro");
    }
  }

  return (
    <section id="contato" aria-labelledby="contato-titulo" className="section">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="eyebrow reveal">Contato</p>
          <h2 id="contato-titulo" className="h2 reveal reveal-delay-1 mt-7 max-w-[12ch]">
            Conte o momento da sua obra.
          </h2>
          <p className="lead reveal mt-8 text-lg">A conversa já começa com contexto.</p>
          <p className="reveal mt-10 max-w-[40ch] border-t border-line pt-6 text-[0.875rem] text-stone">
            Prefere ir direto?{" "}
            <WhatsAppLink origem="contato-texto" className="text-ink underline decoration-line underline-offset-4 hover:decoration-amber">
              Fale com um consultor pelo WhatsApp
            </WhatsAppLink>
            .
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          {status === "ok" ? (
            <div className="border-t border-line pt-10" role="status">
              <p className="eyebrow">Recebido</p>
              <h3
                ref={confirmacaoRef}
                tabIndex={-1}
                className="mt-5 font-serif text-[2.25rem] font-light leading-tight focus:outline-none"
              >
                Obrigado, {campos.nome.trim().split(" ")[0]}. Seu contato chegou à Larong.
              </h3>
              <p className="lead mt-5">
                Um consultor vai retomar a conversa pelo WhatsApp informado. Se preferir adiantar, continue agora com
                o resumo do que você enviou.
              </p>
              <WhatsAppLink message={mensagemResumo(campos)} origem="formulario-confirmacao" className="btn-primary mt-9">
                Continuar no WhatsApp <Arrow />
              </WhatsAppLink>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={onSubmit} className="grid gap-9 border-t border-line pt-10" aria-describedby={id("obrig")}>
              <p id={id("obrig")} className="-mb-3 text-[0.8125rem] text-stone">
                Campos com * são obrigatórios.
              </p>

              <div className="grid gap-9 sm:grid-cols-2 sm:gap-8">
                <Campo id={id("nome")} label="Nome *" erro={erros.nome}>
                  <input
                    id={id("nome")}
                    data-campo="nome"
                    name="nome"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={120}
                    className="field-input"
                    value={campos.nome}
                    onChange={(e) => set("nome", e.target.value)}
                    aria-invalid={!!erros.nome}
                    aria-describedby={erros.nome ? id("nome-erro") : undefined}
                  />
                </Campo>
                <Campo id={id("whatsapp")} label="WhatsApp *" erro={erros.whatsapp}>
                  <input
                    id={id("whatsapp")}
                    data-campo="whatsapp"
                    name="whatsapp"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="(00) 00000-0000"
                    required
                    className="field-input"
                    value={campos.whatsapp}
                    onChange={(e) => set("whatsapp", maskPhoneBR(e.target.value))}
                    aria-invalid={!!erros.whatsapp}
                    aria-describedby={erros.whatsapp ? id("whatsapp-erro") : undefined}
                  />
                </Campo>
              </div>

              <Campo id={id("perfil")} label="Perfil *" erro={erros.perfil}>
                <Select
                  id={id("perfil")}
                  campo="perfil"
                  value={campos.perfil}
                  onChange={(v) => set("perfil", v)}
                  opcoes={PERFIS}
                  erroId={erros.perfil ? id("perfil-erro") : undefined}
                  required
                />
              </Campo>

              <fieldset
                aria-describedby={erros.temProjeto ? id("temProjeto-erro") : undefined}
                aria-invalid={!!erros.temProjeto}
              >
                <legend className="field-label">Já tem projeto luminotécnico? *</legend>
                <div className="mt-1 flex flex-wrap gap-2">
                  {OPCOES_PROJETO.map((op, i) => (
                    <label key={op} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="temProjeto"
                        value={op}
                        data-campo={i === 0 ? "temProjeto" : undefined}
                        checked={campos.temProjeto === op}
                        onChange={() => set("temProjeto", op)}
                        className="peer sr-only"
                      />
                      <span className="inline-flex min-h-[44px] items-center border border-[#bfb3a2] px-5 text-[0.9375rem] transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-text hover:border-ink">
                        {op}
                      </span>
                    </label>
                  ))}
                </div>
                {erros.temProjeto && (
                  <p id={id("temProjeto-erro")} className="field-error">
                    {erros.temProjeto}
                  </p>
                )}
              </fieldset>

              <Campo id={id("previsao")} label="Previsão da obra" erro={undefined}>
                <Select
                  id={id("previsao")}
                  campo="previsaoObra"
                  value={campos.previsaoObra}
                  onChange={(v) => set("previsaoObra", v)}
                  opcoes={OPCOES_PREVISAO}
                />
              </Campo>

              <Campo id={id("mensagem")} label="Mensagem (opcional)" erro={undefined}>
                <textarea
                  id={id("mensagem")}
                  name="mensagem"
                  rows={3}
                  maxLength={2000}
                  className="field-input resize-y"
                  placeholder="Ambientes, etapa da obra, quem assina o projeto…"
                  value={campos.mensagem}
                  onChange={(e) => set("mensagem", e.target.value)}
                />
              </Campo>

              <div>
                <label className="flex cursor-pointer items-start gap-4 text-[0.875rem] leading-relaxed text-stone">
                  <input
                    type="checkbox"
                    data-campo="consentimento"
                    name="consentimento"
                    checked={campos.consentimento}
                    onChange={(e) => set("consentimento", e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded-none border border-stone accent-ink"
                    aria-invalid={!!erros.consentimento}
                    aria-describedby={erros.consentimento ? id("consentimento-erro") : undefined}
                    required
                  />
                  <span>
                    Concordo que a Larong use estes dados para retornar o meu contato, conforme a Lei Geral de Proteção
                    de Dados (LGPD) e o{" "}
                    <a href="#privacidade" className="text-ink underline decoration-line underline-offset-4 hover:decoration-amber">
                      aviso de privacidade
                    </a>
                    . *
                  </span>
                </label>
                {erros.consentimento && (
                  <p id={id("consentimento-erro")} className="field-error">
                    {erros.consentimento}
                  </p>
                )}
              </div>

              {status === "erro" && (
                <div role="alert" className="border-l-2 border-[#9b2c1f] pl-5 text-[0.9375rem]">
                  <p>Não conseguimos registrar seu contato agora. Tente de novo ou fale direto pelo WhatsApp.</p>
                  <WhatsAppLink message={mensagemResumo(campos)} origem="formulario-erro" className="text-link mt-3">
                    Continuar no WhatsApp <Arrow />
                  </WhatsAppLink>
                </div>
              )}

              <div>
                <button type="submit" className="btn-primary w-full sm:w-auto" disabled={status === "enviando"}>
                  {status === "enviando" ? "Enviando…" : "Enviar"} <Arrow />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Campo({ id, label, erro, children }: { id: string; label: string; erro?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {erro && (
        <p id={`${id}-erro`} className="field-error">
          {erro}
        </p>
      )}
    </div>
  );
}

function Select({
  id,
  campo,
  value,
  onChange,
  opcoes,
  erroId,
  required,
}: {
  id: string;
  campo: string;
  value: string;
  onChange: (v: string) => void;
  opcoes: readonly string[];
  erroId?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        data-campo={campo}
        name={campo}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`field-input cursor-pointer appearance-none pr-8 ${value ? "" : "text-stone"}`}
        aria-invalid={!!erroId}
        aria-describedby={erroId}
      >
        <option value="">Selecione</option>
        {opcoes.map((o) => (
          <option key={o} value={o} className="text-ink">
            {o}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-stone">
        ⌄
      </span>
    </div>
  );
}
