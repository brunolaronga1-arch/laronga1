import { Arrow, WhatsAppLink } from "./WhatsAppLink";

/** Única faixa escura da página. */
export function Fechamento() {
  return (
    <section aria-labelledby="fechamento-titulo" className="bg-ink text-paper">
      <div className="container-page grid gap-12 py-24 lg:grid-cols-12 lg:items-end lg:gap-10 lg:py-[150px]">
        <div className="lg:col-span-8">
          <span aria-hidden="true" className="block h-px w-16 bg-amber" />
          <h2 id="fechamento-titulo" className="display mt-10 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.5rem]">
            Seu projeto merece chegar à obra do jeito que foi pensado.
          </h2>
        </div>
        <div className="lg:col-span-4 lg:justify-self-end">
          <WhatsAppLink origem="faixa-final" className="btn-light w-full sm:w-auto">
            Falar com um consultor <Arrow />
          </WhatsAppLink>
        </div>
      </div>
    </section>
  );
}
