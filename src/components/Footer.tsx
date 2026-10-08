export function Footer() {
  return (
    <footer className="bg-paper pb-28 pt-16 text-[0.875rem] text-stone lg:pb-16">
      <div className="container-page">
        <div className="grid gap-10 border-b border-line pb-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-serif text-[1.75rem] leading-none tracking-[0.18em] text-ink">LARONG</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.18em]">Uma empresa do Grupo VeLa</p>
          </div>
          <dl className="grid gap-6 sm:grid-cols-3 md:col-span-8">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-eyebrow text-amber-text">Showroom</dt>
              {/* Preencher com o endereço real */}
              <dd className="mt-2 text-ink">[preencher endereço / showroom]</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-eyebrow text-amber-text">Instagram</dt>
              {/* Preencher com o @ oficial e o link */}
              <dd className="mt-2 text-ink">[preencher @instagram]</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-eyebrow text-amber-text">CNPJ</dt>
              {/* Preencher com o CNPJ */}
              <dd className="mt-2 text-ink">[preencher CNPJ]</dd>
            </div>
          </dl>
        </div>
        <div className="grid gap-6 pt-8 md:grid-cols-12">
          {/* Revisar o texto do aviso de privacidade com o jurídico antes de publicar */}
          <p id="privacidade" className="max-w-prose md:col-span-8">
            <strong className="font-medium text-ink">Aviso de privacidade.</strong> Os dados enviados pelo formulário
            são usados apenas para que a Larong retorne o seu contato e não são compartilhados para outros fins. Você
            pode pedir a consulta, correção ou exclusão dos seus dados a qualquer momento pelos nossos canais de
            atendimento, conforme a Lei Geral de Proteção de Dados (LGPD).
          </p>
          <p className="md:col-span-4 md:text-right">© Larong · Grupo VeLa</p>
        </div>
      </div>
    </footer>
  );
}
