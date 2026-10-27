import { useState, type FormEvent } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminParametersTabs } from "@/components/admin/AdminParametersTabs";
import defaultTemplate from "@/data/solicitud-cliente-template.html?raw";

const storageKey = "intercap-admin-parametros-solicitud-cliente";

function readTemplate() {
  try {
    return window.localStorage.getItem(storageKey) ?? defaultTemplate;
  } catch {
    return defaultTemplate;
  }
}

export default function AdminParametersClientRequest() {
  const [template, setTemplate] = useState(readTemplate);
  const [message, setMessage] = useState("");

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem(storageKey, template);
      setMessage("Guardado en este navegador");
    } catch {
      setMessage("No se pudo guardar en este navegador");
    }
  }

  return <div className="min-h-screen bg-[#f1f3f5] pt-24 text-[#001f3f]">
    <Header mode="admin" />
    <main className="flex min-h-[calc(100vh-96px)]">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Administración</p>
          <h1 className="mt-2 text-2xl font-black">Parámetros · Solicitud de cliente</h1>
        </div>
        <div className="px-4 pb-10 pt-5 sm:px-6">
          <div className="mb-5 text-[11px]"><span className="text-blue-600">Administración</span><span className="mx-1 text-slate-300">/</span><span className="text-blue-600">Parámetros</span><span className="mx-1 text-slate-300">/</span><strong>SOLICITUD DE CLIENTE</strong></div>
          <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <AdminParametersTabs />
            <p className="mb-5 text-xs font-semibold text-slate-600">Plantilla HTML del envío de solicitud de clientes (columna <span className="font-mono text-[11px]">USR_TVCONF_PSOLCL</span> si existe en la base).</p>
            <label htmlFor="client-request-template" className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Plantilla <span className="ml-1 font-medium text-slate-400">HTML</span></label>
            <textarea id="client-request-template" value={template} onChange={(event) => { setTemplate(event.target.value); setMessage(""); }} spellCheck={false} className="h-[340px] w-full resize-y rounded-xl border border-slate-200 bg-white p-3 font-mono text-[12px] leading-[1.55] text-[#001f3f] shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-100 pt-4"><span role="status" className="text-xs font-semibold text-teal-700">{message}</span><button type="submit" className="rounded-xl bg-teal-600 px-6 py-3 text-[11px] font-black uppercase text-white shadow-sm hover:bg-teal-500">Guardar</button></div>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
