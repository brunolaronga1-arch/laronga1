import { WHATSAPP_MESSAGES, WHATSAPP_NUMBER, type WhatsappContext } from "@/config";

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function whatsappUrlFor(context: WhatsappContext): string {
  return whatsappUrl(WHATSAPP_MESSAGES[context]);
}
