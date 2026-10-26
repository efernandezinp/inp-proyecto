import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Inpay() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(600);
  const [loaded, setLoaded] = useState(false);
  const simulatorUrl = `${import.meta.env.BASE_URL}inpay-simulator.html`;

  const resizeFrame = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;
    setFrameHeight(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 600));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const frame = frameRef.current;
    const document = frame?.contentDocument;
    if (!frame || !document) return;
    const observer = new ResizeObserver(resizeFrame);
    observer.observe(document.documentElement);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [loaded, resizeFrame]);

  return (
    <div className="min-h-screen bg-slate-100 pt-24">
      <Header />
      <main aria-label="Cobrá con INPAY">
        <iframe
          ref={frameRef}
          src={simulatorUrl}
          title="Simulador de cobros y coeficientes INPAY"
          onLoad={() => { setLoaded(true); resizeFrame(); }}
          className="block w-full border-0"
          style={{ height: frameHeight }}
        />
      </main>
      <Footer />
    </div>
  );
}
