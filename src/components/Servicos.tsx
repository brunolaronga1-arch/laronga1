import img from "@/assets/images/servicos.svg";
import { Arrow, WhatsAppLink } from "./WhatsAppLink";

const produtos = [
  { nome: "Curadoria técnica", resultado: "A peça certa para o efeito que o projeto pediu." },
  { nome: "Equalização de propostas", resultado: "Propostas comparáveis lado a lado, sem truque de especificação." },
  { nome: "Engenharia de valores", resultado: "Alternativas que cabem no orçamento sem mudar o efeito de luz." },
  { nome: "Gestão de compras multimarcas", resultado: "Vários fabricantes, um único pedido e um único prazo." },
];

const servicos = [
  {
    nome: "Fornecimento Gerenciado",
    descricao:
      "Recebemos as luminárias dos diferentes fabricantes, conferimos, separamos por ambiente, etiquetamos e entregamos organizadas na obra.",
    resultado: "A obra recebe caixa identificada por ambiente, não um monte de volumes soltos.",
  },
  {
    nome: "Guia de Montagem",
    descricao:
      "Um guia por projeto, feito para o eletricista, com a identificação de cada peça e onde ela vai.",
    resultado: "Menos erro de instalação e menos retrabalho.",
  },
];

const processo = ["Contato", "Diagnóstico", "Curadoria e equalização", "Proposta", "Fornecimento", "Pós-venda"];

export function Servicos() {
  return (
    <section id="servicos" aria-labelledby="servicos-titulo" className="section">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <p className="eyebrow reveal">Produtos e serviços</p>
            <h2 id="servicos-titulo" className="h2 reveal reveal-delay-1 mt-7">
              O que muda na obra quando a luz é bem conduzida.
            </h2>
          </div>
        </div>

        {/* Bloco A — Produtos */}
        <div className="mt-20 grid gap-8 lg:mt-28 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h3 className="font-serif text-[2rem] font-light leading-none">Produtos</h3>
            <p className="lead mt-5">
              Luminárias e soluções de diversos fabricantes nacionais e importados, selecionadas a partir da
              especificação do projeto.
            </p>
          </div>
        </div>
        <ul className="mt-12 grid border-t border-line md:grid-cols-2 lg:grid-cols-4">
          {produtos.map((p, i) => (
            <li
              key={p.nome}
              className={`reveal border-b border-line py-8 last:border-b-0 md:px-8 md:py-10 md:[&:nth-child(3)]:border-b-0 lg:border-b-0 ${
                i % 2 === 1 ? "md:border-l" : "md:pl-0"
              } ${i > 0 ? "lg:border-l lg:pl-8" : "lg:pl-0"}`}
            >
              <h4 className="font-serif text-[1.625rem] font-normal leading-tight">{p.nome}</h4>
              <p className="mt-4 flex gap-3 text-stone">
                <span aria-hidden="true" className="text-amber">→</span>
                <span>{p.resultado}</span>
              </p>
            </li>
          ))}
        </ul>

        {/* Bloco B — Serviços */}
        <div className="mt-20 grid gap-14 border-t border-line pt-20 lg:mt-28 lg:grid-cols-12 lg:gap-10 lg:pt-28">
          <figure className="reveal order-2 lg:order-1 lg:col-span-5">
            {/* Substituir por foto real: ambiente executado com luz quente e natural, retrato 4:5 */}
            <img
              src={img}
              alt="Sala de jantar com pendentes acesos sobre a mesa e luz natural entrando pela janela"
              width={800}
              height={1000}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full object-cover"
            />
          </figure>
          <div className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
            <h3 className="font-serif text-[2rem] font-light leading-none">Serviços</h3>
            <div className="mt-10 border-t border-line">
              {servicos.map((s) => (
                <article key={s.nome} className="reveal border-b border-line py-10">
                  <h4 className="font-serif text-[2rem] font-normal leading-tight md:text-[2.25rem]">{s.nome}</h4>
                  <p className="lead mt-4">{s.descricao}</p>
                  <p className="mt-6 text-[11px] font-semibold uppercase tracking-eyebrow text-amber-text">Resultado</p>
                  <p className="mt-2 max-w-[34ch] font-serif text-[1.5rem] font-light italic leading-snug">
                    {s.resultado}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Processo */}
        <div className="mt-20 lg:mt-28">
          <p className="eyebrow">Como funciona</p>
          <ol className="mt-8 grid border-t border-line sm:grid-cols-2 lg:grid-cols-6">
            {processo.map((etapa, i) => (
              <li
                key={etapa}
                className={`reveal flex items-baseline gap-4 border-b border-line py-5 sm:py-7 lg:block lg:border-b-0 lg:px-5 lg:py-8 ${
                  i % 2 === 1 ? "sm:border-l sm:pl-6" : ""
                } ${i > 0 ? "lg:border-l lg:pl-5" : "lg:pl-0"}`}
              >
                <span className="text-[11px] font-semibold tracking-[0.2em] text-amber-text">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-[1.5rem] font-light leading-tight lg:mt-3 lg:block">{etapa}</span>
              </li>
            ))}
          </ol>
          <div className="mt-12">
            <WhatsAppLink context="servicos" origem="servicos" className="text-link">
              Quero entender como funciona no meu projeto <Arrow />
            </WhatsAppLink>
          </div>
        </div>
      </div>
    </section>
  );
}
