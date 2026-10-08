import { useEffect, useState } from "react";
import { Arrow, WhatsAppLink } from "./WhatsAppLink";

const links = [
  { href: "#quem-somos", label: "Quem somos" },
  { href: "#servicos", label: "Produtos e serviços" },
  { href: "#para-quem", label: "Para quem" },
  { href: "#contato", label: "Contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 bg-paper/95 backdrop-blur-sm transition-colors ${
        scrolled || open ? "border-b border-line" : "border-b border-transparent"
      }`}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Pular para o conteúdo
      </a>
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <a href="#topo" className="flex items-baseline gap-3" aria-label="Larong, um Grupo VeLa — início">
          <span className="font-serif text-[1.65rem] font-normal leading-none tracking-[0.18em]">LARONG</span>
          <span className="hidden text-[11px] uppercase tracking-[0.18em] text-stone sm:inline">
            <span aria-hidden="true" className="mr-3 text-amber">·</span>um Grupo VeLa
          </span>
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-9 text-[0.875rem]">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-ink/80 transition-colors hover:text-amber-text">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <WhatsAppLink origem="header" className="btn-primary hidden min-h-[44px] px-5 text-[0.875rem] md:inline-flex">
            Falar com um consultor <Arrow />
          </WhatsAppLink>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 block h-px w-6 bg-ink transition-transform duration-300 ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-6 bg-ink transition-transform duration-300 ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <nav
        id="menu-mobile"
        aria-label="Menu"
        hidden={!open}
        className="border-t border-line bg-paper lg:hidden"
      >
        <ul className="container-page py-4">
          {links.map((l) => (
            <li key={l.href} className="border-b border-line last:border-0">
              <a href={l.href} className="block py-4 font-serif text-2xl font-light" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
          <li className="pt-6 pb-2 md:hidden">
            <WhatsAppLink origem="menu-mobile" className="btn-primary w-full" onClick={() => setOpen(false)}>
              Falar com um consultor <Arrow />
            </WhatsAppLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
