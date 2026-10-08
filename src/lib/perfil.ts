export const PERFIS = [
  "Arquiteto(a)/Designer",
  "Lighting designer",
  "Cliente residencial",
  "Construtora",
  "Compras corporativas",
  "Outro",
] as const;

export type Perfil = (typeof PERFIS)[number];

const EVENT = "larong:perfil";

/** Pré-seleciona o perfil no formulário a partir de um link da página. */
export function selecionarPerfil(perfil: Perfil): void {
  window.dispatchEvent(new CustomEvent<Perfil>(EVENT, { detail: perfil }));
}

export function onPerfilSelecionado(cb: (p: Perfil) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<Perfil>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
