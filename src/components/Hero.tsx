import heroImg from "@/assets/images/hero-interior.svg";
import { Arrow, WhatsAppLink } from "./WhatsAppLink";

const pilares = ["Curadoria", "Equalização", "Fornecimento", "Obra"];

export function Hero() {
  return (
    <section id="topo" aria-labelledby="hero-titulo" className="pt-[72px]">
      <div className="container-page grid gap-14 pb-24 pt-14 md:pt-20 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pb-[140px] lg:pt-24">
        <div className="lg:col-span-7 lg:pb-6">
          <p className="eyebrow reveal">Projeto · Indústria · Obra</p>
          <h1
            id="hero-titulo"
            className="display reveal reveal-delay-1 mt-7 text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.98]"
          >
            Da especificação à obra, a luz certa chega do <em className="italic">jeito certo.</em>
          </h1>
          <p className="lead reveal reveal-delay-2 mt-8 text-[1.0625rem] md:text-lg">
            A Larong é uma multimarcas de iluminação que conecta projeto, indústria e obra — com curadoria técnica,
            gestão de compras e acompanhamento até a instalação.
          </p>
          <div className="reveal reveal-delay-2 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <WhatsAppLink origem="hero" className="btn-primary">
              Falar com um consultor <Arrow />
            </WhatsAppLink>
            <a href="#quem-somos" className="btn-secondary">
              Conhecer a Larong
            </a>
          </div>
          <div className="reveal mt-14 flex items-center gap-5">
            <span aria-hidden="true" className="h-px w-10 shrink-0 bg-amber sm:w-16" />
            <p className="text-[0.8125rem] uppercase tracking-[0.16em] text-stone">
              <span className="font-serif text-2xl normal-case tracking-normal text-ink">40+ anos</span>
              <span className="ml-3">iluminando projetos</span>
            </p>
          </div>
        </div>

        <figure className="reveal reveal-delay-1 lg:col-span-5">
          {/* Substituir por foto real: arquitetura com luz quente e natural, retrato 4:5 */}
          <img
            src={heroImg}
            alt="Ambiente residencial com luz quente lavando as paredes e um pendente sobre o aparador"
            width={800}
            height={1000}
            {...{ fetchpriority: "high" }}
            className="aspect-[4/5] w-full object-cover"
          />
        </figure>
      </div>

      {/* Faixa fina com os quatro pilares */}
      <div className="border-y border-line">
        <ul className="container-page grid grid-cols-2 md:grid-cols-4" aria-label="O que a Larong faz">
          {pilares.map((p, i) => (
            <li
              key={p}
              className={`py-5 text-center font-serif text-xl font-light tracking-[0.04em] md:py-7 md:text-2xl ${
                i % 2 === 1 ? "border-l border-line" : ""
              } ${i >= 2 ? "border-t border-line md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
