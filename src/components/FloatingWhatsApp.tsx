import { WhatsAppLink } from "./WhatsAppLink";

export function FloatingWhatsApp() {
  return (
    <WhatsAppLink
      origem="botao-flutuante"
      aria-label="Falar com um consultor da Larong pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white transition-transform duration-300 hover:scale-105 md:bottom-8 md:right-8"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" fill="currentColor">
        <path d="M16.01 3C8.83 3 3 8.82 3 15.99c0 2.29.6 4.53 1.74 6.5L3 29l6.69-1.75a12.98 12.98 0 0 0 6.31 1.62h.01C23.18 28.87 29 23.05 29 15.88 29 8.82 23.18 3 16.01 3Zm0 23.7h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.24-3.97 1.04 1.06-3.87-.26-.4a10.74 10.74 0 0 1-1.65-5.74c0-5.96 4.85-10.8 10.82-10.8 5.96 0 10.8 4.84 10.8 10.69 0 5.96-4.86 10.82-10.89 10.82Zm5.93-8.1c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.73.17-.22.32-.84 1.05-1.03 1.27-.19.22-.38.24-.7.08-.33-.16-1.38-.51-2.62-1.62-.97-.86-1.63-1.93-1.82-2.26-.19-.32-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.32.33-.54.11-.22.05-.4-.03-.57-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56h-.62c-.22 0-.57.08-.87.4-.3.33-1.14 1.11-1.14 2.71s1.17 3.15 1.33 3.36c.16.22 2.3 3.51 5.57 4.92.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.41.19-1.55-.08-.13-.3-.22-.62-.38Z" />
      </svg>
    </WhatsAppLink>
  );
}
