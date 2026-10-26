import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { CircleHelp, X } from "lucide-react";

export function ClaimsModal({ onClose }: { onClose: () => void }) {
  const [incident, setIncident] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="claims-title" className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white text-[#001f3f] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <h2 id="claims-title" className="text-sm font-black uppercase">Sugerencias y reclamos</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4 px-5 pb-7 pt-12 sm:px-12">
          <div>
            <label htmlFor="claims-cuit" className="sr-only">CUIT</label>
            <input id="claims-cuit" type="text" inputMode="numeric" pattern="[0-9]{11}" title="Ingresá los 11 dígitos del CUIT sin guiones" autoComplete="off" required placeholder="CUIT *" className="h-10 w-full rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            <p className="mt-1 text-[11px] text-slate-800">Ingrese el número de cuit sin guiones</p>
          </div>
          <div>
            <label htmlFor="claims-type" className="sr-only">Tipo de incidencia</label>
            <select id="claims-type" required value={incident} onChange={(event) => setIncident(event.target.value)} className="h-10 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
              <option value="" disabled>TIPO DE INCIDENCIA *</option>
              <option value="pedido">Pedido</option>
              <option value="producto">Producto</option>
              <option value="entrega">Entrega</option>
              <option value="facturacion">Facturación</option>
              <option value="sugerencia">Sugerencia</option>
              <option value="abuso">Reportar un abuso</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor="claims-description" className="sr-only">Descripción</label>
            <textarea id="claims-description" ref={descriptionRef} rows={2} placeholder="DESCRIPCION" className="min-h-14 w-full resize-y rounded border border-slate-300 px-2.5 py-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>
          <button type="submit" className="h-13 w-full rounded bg-[#30267e] text-sm font-black text-white transition hover:bg-[#241b68]">Enviar</button>
          {submitted && <p role="status" className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Formulario de demostración: no se envió el reclamo porque todavía no hay un servicio conectado.</p>}
          <button type="button" onClick={() => { setIncident("abuso"); descriptionRef.current?.focus(); }} className="inline-flex items-center gap-2 text-[11px] text-slate-400 underline underline-offset-2 hover:text-slate-600">Reportar un abuso <CircleHelp className="h-3.5 w-3.5" /></button>
        </form>
      </section>
    </div>,
    document.body,
  );
}
