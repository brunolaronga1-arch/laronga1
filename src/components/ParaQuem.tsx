import { selecionarPerfil, type Perfil } from "@/lib/perfil";
import { Arrow, WhatsAppLink } from "./WhatsAppLink";

const especificadores = [
  {
    titulo: "Escritórios de arquitetura",
    texto: "Atendimento dedicado e um único interlocutor para todas as obras em andamento.",
  },
  {
    titulo: "Arquitetos e designers de interiores",
    texto: "Apoio na especificação, equalização técnica para apresentar ao cliente e fornecimento organizado.",
  },
  {
    titulo: "Lighting designers",
    texto: "Leitura técnica do projeto luminotécnico e busca das soluções que entregam o efeito especificado.",
  },
];

const compromissos = [
  "Preservação da especificação",
  "Equalização técnica",
  "Fornecimento organizado na obra",
  "Programa de parceria",
];

const quemConstroi: { titulo: string; texto: string; perfil: Perfil }[] = [
  {
    titulo: "Clientes residenciais",
    texto: "Em reforma ou construção: seu projeto executado como foi pensado, sem administrar fornecedor por fornecedor.",
    perfil: "Cliente residencial",
  },
  {
    titulo: "Construtoras",
    texto: "Iluminação organizada por unidade e por etapa de obra.",
    perfil: "Construtora",
  },
  {
    titulo: "Compras corporativas",
    texto: "Equalização técnica, um interlocutor e processo documentado.",
    perfil: "Compras corporativas",
  },
];

export function ParaQuem() {
  return (
    <section id="para-quem" aria-labelledby="para-quem-titulo" className="section bg-sand">
      {/* Âncoras de campanha que apontam para esta seção */}
      <span id="parceiros" aria-hidden="true" />
      <span id="arquitetos" aria-hidden="true" />

      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow reveal">Para quem é o serviço</p>
            <h2 id="para-quem-titulo" className="h2 reveal reveal-delay-1 mt-7">
              Para quem especifica, constrói e mora.
            </h2>
          </div>
        </div>

        {/* Parte 1 — Quem especifica */}
        <div className="mt-20 lg:mt-28">
          <h3 className="font-serif text-[2rem] font-light leading-none">Quem especifica</h3>
          <ul className="mt-10 grid border-t border-line md:grid-cols-3">
            {especificadores.map((e, i) => (
              <li
                key={e.titulo}
                className={`reveal border-b border-line py-8 last:border-b-0 md:border-b-0 md:py-10 md:pr-8 ${
                  i > 0 ? "md:border-l md:pl-8" : ""
                }`}
              >
                <h4 className="font-serif text-[1.625rem] font-normal leading-tight">{e.titulo}</h4>
                <p className="mt-4 text-stone">{e.texto}</p>
              </li>
            ))}
          </ul>

          <div className="mt-14 grid gap-10 border-t border-line pt-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <p className="eyebrow">Nossos compromissos com o especificador</p>
              <ul className="mt-6 grid sm:grid-cols-2 sm:gap-x-10">
                {compromissos.map((c) => (
                  <li key={c} className="border-t border-line py-4 font-serif text-[1.5rem] font-light leading-snug">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
              <WhatsAppLink context="arquiteto" origem="parceria-arquitetos" className="btn-primary w-full sm:w-auto">
                Quero conhecer o programa de parceria <Arrow />
              </WhatsAppLink>
            </div>
          </div>
        </div>

        {/* Parte 2 — Quem constrói e quem mora */}
        <div className="mt-24 lg:mt-32">
          <h3 className="font-serif text-[2rem] font-light leading-none">Quem constrói e quem mora</h3>
          <ul className="mt-10 border-t border-line">
            {quemConstroi.map((q) => (
              <li
                key={q.titulo}
                className="reveal grid gap-3 border-b border-line py-7 md:grid-cols-12 md:items-baseline md:gap-10"
              >
                <h4 className="font-serif text-[1.625rem] font-normal leading-tight md:col-span-4">{q.titulo}</h4>
                <p className="text-stone md:col-span-5">{q.texto}</p>
                <a
                  href="#contato"
                  onClick={() => selecionarPerfil(q.perfil)}
                  className="text-link mt-2 justify-self-start md:col-span-3 md:mt-0 md:justify-self-end"
                >
                  Contar sobre a obra <Arrow />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
