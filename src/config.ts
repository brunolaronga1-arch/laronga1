/**
 * Configurações centrais da landing page da Larong.
 * Tudo o que precisa ser preenchido antes de publicar está aqui.
 */

// SUBSTITUIR pelo número oficial de WhatsApp da Larong: 55 + DDD + número, só dígitos.
// Ex.: "5511999999999"
export const WHATSAPP_NUMBER = "55XXXXXXXXXXX";

// Mensagens pré-preenchidas, uma por tipo de CTA.
export const WHATSAPP_MESSAGES = {
  geral:
    "Olá! Vim pelo site da Larong e gostaria de falar com um consultor sobre a iluminação do meu projeto.",
  arquiteto:
    "Olá! Sou arquiteto(a)/designer e gostaria de conhecer o programa de parceria da Larong para especificadores.",
  servicos:
    "Olá! Quero entender como a curadoria técnica e o fornecimento gerenciado da Larong funcionam no meu projeto.",
} as const;

export type WhatsappContext = keyof typeof WHATSAPP_MESSAGES;

// Meta Pixel: preencher com o ID do pixel (ex.: "123456789012345"). Vazio = desativado.
export const META_PIXEL_ID = "";

// Google Tag (GA4 "G-XXXX" ou Google Ads "AW-XXXX"). Vazio = desativado.
export const GOOGLE_TAG_ID = "";

export const EMPRESA_ORIGEM = "Larong";
