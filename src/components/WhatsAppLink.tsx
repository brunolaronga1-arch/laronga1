import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { WhatsappContext } from "@/config";
import { trackContact } from "@/lib/tracking";
import { whatsappUrl, whatsappUrlFor } from "@/lib/whatsapp";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Mensagem pré-definida em src/config.ts */
  context?: WhatsappContext;
  /** Ou uma mensagem livre (ex.: resumo do formulário) */
  message?: string;
  /** Identifica o CTA no evento "Contact" */
  origem: string;
  children: ReactNode;
};

export function WhatsAppLink({ context = "geral", message, origem, children, onClick, ...rest }: Props) {
  return (
    <a
      href={message ? whatsappUrl(message) : whatsappUrlFor(context)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        trackContact(origem);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export function Arrow() {
  return (
    <span aria-hidden="true" className="arrow inline-block">
      →
    </span>
  );
}
