# Larong — landing page

Página única da Larong (Grupo VeLa). Vite + React + TypeScript + Tailwind, pronta para importar no Lovable.

```bash
npm install
npm run dev     # http://localhost:8080
npm run build
```

## Antes de publicar

| O quê | Onde |
| --- | --- |
| Número do WhatsApp (`WHATSAPP_NUMBER`) e mensagens por CTA | `src/config.ts` |
| Meta Pixel (`META_PIXEL_ID`) e Google Tag (`GOOGLE_TAG_ID`) — vazios = desativados | `src/config.ts` |
| Domínio final (canonical, `og:url`, `og:image`) | `index.html` (`SEU-DOMINIO.com.br`) |
| Endereço/showroom, Instagram e CNPJ (`[preencher]`) e revisão do aviso de privacidade | `src/components/Footer.tsx` |
| Fotos reais (procure por "substituir por foto real") | `src/assets/images/*.svg` e os componentes que as usam |
| Imagem de compartilhamento (1200×630) | `public/og-image.png` |

## Leads (Lovable Cloud)

- Rode a migração `supabase/migrations/20261008000000_create_leads.sql` para criar a tabela `leads`
  (RLS ativo: o site só pode **inserir**; leitura pelo painel).
- O cliente usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (ver `.env.example`).
- Cada envio grava: nome, WhatsApp, perfil, projeto luminotécnico, previsão da obra, mensagem, consentimento LGPD,
  `created_at`, `empresa_origem = "Larong"`, UTMs, página de origem, referrer e user agent.
- Em desenvolvimento, sem as variáveis, o envio é simulado (aviso no console). Em produção, sem elas, o formulário
  mostra erro e oferece o WhatsApp.

## Eventos

- `Lead` — envio do formulário com sucesso.
- `Contact` — qualquer clique em link de WhatsApp (com a origem do CTA).

Âncoras disponíveis para campanhas: `#quem-somos`, `#servicos`, `#para-quem`, `#parceiros`, `#arquitetos`, `#contato`.
