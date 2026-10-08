import { GOOGLE_TAG_ID, META_PIXEL_ID } from "@/config";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: unknown;
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

/** Carrega Meta Pixel e Google Tag somente se os IDs estiverem preenchidos em src/config.ts. */
export function initTracking(): void {
  if (META_PIXEL_ID && !window.fbq) {
    const fbq: any = function (...args: unknown[]) {
      fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    loadScript("https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", META_PIXEL_ID);
    fbq("track", "PageView");
  }

  if (GOOGLE_TAG_ID && !window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`);
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_TAG_ID);
  }
}

function loadScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Evento "Lead": envio do formulário. */
export function trackLead(params: Record<string, string> = {}): void {
  window.fbq?.("track", "Lead", params);
  window.gtag?.("event", "Lead", params);
}

/** Evento "Contact": clique em qualquer link de WhatsApp. */
export function trackContact(origem: string): void {
  window.fbq?.("track", "Contact", { origem });
  window.gtag?.("event", "Contact", { origem });
}
