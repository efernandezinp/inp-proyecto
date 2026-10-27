import { useState, type FormEvent } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminParametersTabs } from "@/components/admin/AdminParametersTabs";

type BannerRow = {
  id: string;
  order: number;
  active: boolean;
  type: "interno" | "externo";
  description: string;
  imagePath: string;
  link: string;
  expiresAt: string;
};

type BannerSettings = { popups: BannerRow[]; home: BannerRow[] };

const storageKey = "intercap-admin-parametros-banners";
const row = (id: string, order: number, active: boolean, type: BannerRow["type"], description: string, imagePath: string, link: string, expiresAt = ""): BannerRow => ({ id, order, active, type, description, imagePath, link, expiresAt });

const defaults: BannerSettings = {
  popups: [
    row("popup-1", 1, true, "externo", "Carga Excel", "cargaexcel.gif", "https://youtu.be/_TrFT1zsDqc", "2024-11-10T21:00"),
    row("popup-2", 2, false, "interno", "CloverJC", "Clover.webp", "https://youtu.be/eZ3LyDmFZsY", "2026-09-03T20:59"),
  ],
  home: [
    row("home-1", 1, true, "interno", "Cougar", "Cougar.webp", "catalogo?marca=COUGAR"),
    row("home-2", 2, true, "interno", "Geartune", "Geartune.webp", "catalogo?q=gear%20tune&marca=REINF"),
    row("home-3", 3, true, "interno", "Trailhound WILD", "TrailHoundWild.webp", "catalogo?q=TRAILHOUND%20WILD&tipo=CUBIERTAS"),
    row("home-4", 4, true, "interno", "Radikal 2026", "radikal2026.webp", "/catalogo?marca=RADIKAL"),
    row("home-5", 5, true, "interno", "Trailhound", "TrailHound.webp", "catalogo?q=TRAILHOUND&marca=EUROGRIP"),
    row("home-6", 6, true, "interno", "Pureflow", "Pureflow.webp", "catalogo?marca=PUREFLOW"),
    row("home-7", 7, false, "interno", "761 Kenda", "Kendaoctubre.webp", "catalogo?q=k761&marca=KENDA"),
    row("home-8", 8, true, "interno", "Durtec", "durtec.webp", "/catalogo?marca=DURTEC%20TIRES&novedades=true"),
    row("home-9", 9, true, "externo", "pirelli", "SuperCity280.webp", "catalogo?q=super%20city&marca=PIRELLI"),
  ],
};

function readSettings(): BannerSettings {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as BannerSettings;
    return Array.isArray(saved.popups) && Array.isArray(saved.home) ? saved : defaults;
  } catch {
    return defaults;
  }
}

const inputClass = "w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#001f3f] shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100";

function BannerTable({ title, kind, rows, onAdd, onUpdate, onRemove }: {
  title: string;
  kind: keyof BannerSettings;
  rows: BannerRow[];
  onAdd: (kind: keyof BannerSettings) => void;
  onUpdate: (kind: keyof BannerSettings, id: string, patch: Partial<BannerRow>) => void;
  onRemove: (kind: keyof BannerSettings, id: string) => void;
}) {
  const popup = kind === "popups";
  return <section className="mt-8">
    <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-black">{title}</h2><button type="button" onClick={() => onAdd(kind)} className="inline-flex items-center gap-1 rounded-xl bg-[#001f3f] px-4 py-2 text-[11px] font-black uppercase text-white"><Plus className="h-4 w-4" /> Fila</button></div>
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[1150px] table-fixed text-left">
        <colgroup><col className="w-[7%]" /><col className="w-[7%]" /><col className="w-[11%]" /><col className={popup ? "w-[17%]" : "w-[20%]"} /><col className={popup ? "w-[23%]" : "w-[26%]"} /><col className={popup ? "w-[20%]" : "w-[25%]"} />{popup && <col className="w-[12%]" />}<col className="w-[3%]" /></colgroup>
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-3 py-2">Orden</th><th className="px-3 py-2">Activo</th><th className="px-3 py-2">Tipo</th><th className="px-3 py-2">Descripción</th><th className="px-3 py-2">Path imagen</th><th className="px-3 py-2">Link</th>{popup && <th className="px-3 py-2">Vigencia hasta</th>}<th className="px-2 py-2"><span className="sr-only">Acciones</span></th></tr></thead>
        <tbody className="divide-y divide-slate-100">{rows.map((item) => <tr key={item.id}>
          <td className="px-3 py-2"><input aria-label={`Orden de ${item.description || "nueva fila"}`} type="number" min="1" value={item.order} onChange={(event) => onUpdate(kind, item.id, { order: Number(event.target.value) })} className={`${inputClass} max-w-20 px-2`} /></td>
          <td className="px-3 py-2"><button type="button" role="switch" aria-label={`Activar ${item.description || "nueva fila"}`} aria-checked={item.active} onClick={() => onUpdate(kind, item.id, { active: !item.active })} className={`relative h-8 w-14 rounded-full ${item.active ? "bg-teal-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${item.active ? "left-7" : "left-1"}`} /></button></td>
          <td className="px-3 py-2"><select aria-label={`Tipo de ${item.description || "nueva fila"}`} value={item.type} onChange={(event) => onUpdate(kind, item.id, { type: event.target.value as BannerRow["type"] })} className={`${inputClass} px-2`}><option value="interno">Link interno</option><option value="externo">Link externo</option></select></td>
          <td className="px-3 py-2"><input aria-label="Descripción" value={item.description} onChange={(event) => onUpdate(kind, item.id, { description: event.target.value })} className={inputClass} /></td>
          <td className="px-3 py-2"><div className="flex min-w-0 items-center gap-2"><span aria-hidden="true" className="h-10 w-9 shrink-0 rounded-lg border border-slate-200 bg-white" /><input aria-label={`Path imagen de ${item.description || "nueva fila"}`} value={item.imagePath} onChange={(event) => onUpdate(kind, item.id, { imagePath: event.target.value })} className={inputClass} /><label title="Elegir archivo local" aria-label={`Elegir imagen para ${item.description || "nueva fila"}`} className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-[#001f3f] hover:bg-slate-50"><Upload className="h-4 w-4" /><input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpdate(kind, item.id, { imagePath: file.name }); }} /></label></div></td>
          <td className="px-3 py-2"><textarea aria-label={`Link de ${item.description || "nueva fila"}`} value={item.link} onChange={(event) => onUpdate(kind, item.id, { link: event.target.value })} rows={2} className={`${inputClass} min-h-10 resize-y py-1.5`} /></td>
          {popup && <td className="px-3 py-2"><input aria-label={`Vigencia de ${item.description || "nueva fila"}`} type="datetime-local" value={item.expiresAt} onChange={(event) => onUpdate(kind, item.id, { expiresAt: event.target.value })} className={`${inputClass} px-2`} /></td>}
          <td className="px-2 py-2 text-center"><button type="button" onClick={() => onRemove(kind, item.id)} aria-label={`Eliminar ${item.description || "nueva fila"}`} className="rounded-lg p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></td>
        </tr>)}{rows.length === 0 && <tr><td colSpan={popup ? 8 : 7} className="p-8 text-center text-xs text-slate-500">Sin filas. Usá + Fila para agregar una.</td></tr>}</tbody>
      </table>
    </div>
  </section>;
}

export default function AdminParametersBanners() {
  const [settings, setSettings] = useState<BannerSettings>(readSettings);
  const [message, setMessage] = useState("");

  function update(kind: keyof BannerSettings, id: string, patch: Partial<BannerRow>) {
    setSettings((current) => ({ ...current, [kind]: current[kind].map((item) => item.id === id ? { ...item, ...patch } : item) }));
    setMessage("");
  }
  function add(kind: keyof BannerSettings) {
    setSettings((current) => ({ ...current, [kind]: [...current[kind], row(`${kind}-${Date.now()}`, Math.max(0, ...current[kind].map((item) => item.order)) + 1, false, "interno", "", "", "")] }));
    setMessage("");
  }
  function remove(kind: keyof BannerSettings, id: string) {
    setSettings((current) => ({ ...current, [kind]: current[kind].filter((item) => item.id !== id) }));
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
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Administración</p><h1 className="mt-2 text-2xl font-black">Parámetros · Banners</h1></div>
        <div className="px-4 pb-10 pt-5 sm:px-6">
          <div className="mb-5 text-[11px]"><span className="text-blue-600">Administración</span><span className="mx-1 text-slate-300">/</span><span className="text-blue-600">Parámetros</span><span className="mx-1 text-slate-300">/</span><strong>BANNERS</strong></div>
          <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <AdminParametersTabs />
            <BannerTable title="Popups" kind="popups" rows={settings.popups} onAdd={add} onUpdate={update} onRemove={remove} />
            <BannerTable title="Banners home" kind="home" rows={settings.home} onAdd={add} onUpdate={update} onRemove={remove} />
            <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-100 pt-4"><span role="status" className="text-xs font-semibold text-teal-700">{message}</span><button type="submit" className="rounded-xl bg-teal-600 px-6 py-3 text-[11px] font-black uppercase text-white shadow-sm hover:bg-teal-500">Guardar</button></div>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
