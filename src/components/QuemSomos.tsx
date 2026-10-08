import img from "@/assets/images/quem-somos.svg";

const marcadores = [
  "Revenda consultiva, não loja de catálogo",
  "Multimarcas, do nacional ao importado",
  "Uma empresa do Grupo VeLa",
];

export function QuemSomos() {
  return (
    <section id="quem-somos" aria-labelledby="quem-somos-titulo" className="section bg-sand">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="eyebrow reveal">Quem somos</p>
          <h2 id="quem-somos-titulo" className="h2 reveal reveal-delay-1 mt-7 max-w-[14ch]">
            Mais de quarenta anos entre o projeto e a obra.
          </h2>
          <div className="reveal mt-12 grid gap-6 text-stone md:grid-cols-2 md:gap-10">
            <p>
              A Larong é uma empresa de iluminação com mais de 40 anos de mercado, hoje parte do Grupo VeLa. Atuamos
              como revenda consultiva multimarcas: a decisão técnica vem antes da venda do produto.
            </p>
            <p>
              Essa experiência é o que nos permite ler um projeto luminotécnico, conversar de igual para igual com a
              indústria e acompanhar a especificação até a instalação.
            </p>
          </div>
          <p className="reveal mt-10 max-w-prose border-t border-line pt-6 text-[0.875rem] text-stone">
            Para quem ainda não tem projeto luminotécnico, o grupo conta com a parceria de A Luzia.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-4 lg:col-start-9 lg:grid-cols-1 lg:pt-20">
          <figure className="reveal">
            {/* Substituir por foto real: detalhe de arquitetura com luz quente, retrato 3:4 */}
            <img
              src={img}
              alt="Nicho iluminado e degraus com balizadores de luz quente"
              width={600}
              height={800}
              loading="lazy"
              decoding="async"
              className="aspect-[3/4] w-full object-cover sm:max-w-none lg:max-w-[300px]"
            />
          </figure>
          <ul className="reveal reveal-delay-1 self-end border-t border-line">
            {marcadores.map((m) => (
              <li key={m} className="border-b border-line py-5 font-serif text-[1.375rem] font-light leading-snug">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
