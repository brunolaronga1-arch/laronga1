import { useEffect } from "react";
import { Contato } from "./components/Contato";
import { Fechamento } from "./components/Fechamento";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ParaQuem } from "./components/ParaQuem";
import { QuemSomos } from "./components/QuemSomos";
import { Servicos } from "./components/Servicos";
import { captureUtms } from "./lib/leads";
import { useReveal } from "./lib/useReveal";

export default function App() {
  useReveal();
  useEffect(() => captureUtms(), []);

  return (
    <>
      <Header />
      <main id="conteudo">
        <Hero />
        <QuemSomos />
        <Servicos />
        <ParaQuem />
        <Contato />
        <Fechamento />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
