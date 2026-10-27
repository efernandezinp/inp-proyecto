import { useState, type FormEvent } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminParametersTabs } from "@/components/admin/AdminParametersTabs";

type CartSettings = {
  maxItems: string;
  sendConfirmationEmail: boolean;
  slotMachineActive: boolean;
  winningGameDiscount: string;
};

const storageKey = "intercap-admin-parametros-carritos";
const defaults: CartSettings = {
  maxItems: "300",
  sendConfirmationEmail: true,
  slotMachineActive: false,
  winningGameDiscount: "0",
};

function readSettings(): CartSettings {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4">
    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</span>
    <div className="flex items-center gap-3"><span className="text-[11px] font-bold text-slate-500">{value ? "Sí" : "No"}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-8 w-14 rounded-full transition ${value ? "bg-teal-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${value ? "left-7" : "left-1"}`} /></button></div>
  </div>;
}

export default function AdminParametersCarts() {
  const [settings, setSettings] = useState<CartSettings>(readSettings);
  const [message, setMessage] = useState("");

  function update<K extends keyof CartSettings>(key: K, value: CartSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(settings));
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
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Administración</p><h1 className="mt-2 text-2xl font-black">Parámetros · Carritos</h1></div>
        <div className="px-4 pb-10 pt-5 sm:px-6">
          <div className="mb-5 text-[11px]"><span className="text-blue-600">Administración</span><span className="mx-1 text-slate-300">/</span><span className="text-blue-600">Parámetros</span><span className="mx-1 text-slate-300">/</span><strong>CARRITOS</strong></div>
          <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <AdminParametersTabs />
            <div className="max-w-[560px] space-y-5 pt-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Cantidad máxima de ítems<input type="number" min="1" step="1" required value={settings.maxItems} onChange={(event) => update("maxItems", event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#001f3f] shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>
              <Toggle label="Envía confirmación carrito por e-mail" value={settings.sendConfirmationEmail} onChange={(value) => update("sendConfirmationEmail", value)} />
              <Toggle label="Tragamonedas activo" value={settings.slotMachineActive} onChange={(value) => update("slotMachineActive", value)} />
              <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Descuento juego ganador <span className="ml-2 font-medium normal-case tracking-normal text-slate-400">Decimal</span><input type="number" min="0" step="any" required value={settings.winningGameDiscount} onChange={(event) => update("winningGameDiscount", event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#001f3f] shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>
            </div>
            <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-100 pt-4"><span role="status" className="text-xs font-semibold text-teal-700">{message}</span><button type="submit" className="rounded-xl bg-teal-600 px-6 py-3 text-[11px] font-black uppercase text-white shadow-sm hover:bg-teal-500">Guardar</button></div>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
