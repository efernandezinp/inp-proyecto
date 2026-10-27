import { useState, type FormEvent } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminParametersTabs } from "@/components/admin/AdminParametersTabs";

type Settings = {
  qrLink: string;
  version: string;
  testMode: boolean;
  maintenance: boolean;
  showNews: boolean;
  showBestSellers: boolean;
  showNewArrivals: boolean;
  chatAudience: "publico" | "registrados";
  homeType: "slide" | "imagen";
  homeImage: string;
  defaultImagesPath: string;
  homeImagesPath: string;
  mainImagesPath: string;
  magazineLink: string;
  uploadPath: string;
  maintenanceMessage: string;
};

const storageKey = "intercap-admin-parametros-general";

const defaults: Settings = {
  qrLink: "https://intercap.com.ar/TiendaVirtual/almacenes",
  version: "4.0",
  testMode: false,
  maintenance: false,
  showNews: true,
  showBestSellers: true,
  showNewArrivals: true,
  chatAudience: "registrados",
  homeType: "slide",
  homeImage: "banner-home-RIK.gif",
  defaultImagesPath: "https://imagenes-inp-aws.s3.amazonaws.com/imagenes",
  homeImagesPath: "https://imagenes-inp-aws.s3.amazonaws.com/imagenes/home",
  mainImagesPath: "https://imagenes-inp-aws.s3.amazonaws.com/imagenes/principal/",
  magazineLink: "http://issuu.com/exclusivomotos/docs/exm174_issuu",
  uploadPath: "",
  maintenanceMessage: "Estamos realizando tareas de mantenimiento, por favor ingresar más tarde.\nDisculpe las molestias.\nGracias",
};

function readSettings(): Settings {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block min-w-0 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
    {label}
    <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold normal-case tracking-normal text-[#001f3f] shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
  </label>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4">
    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</span>
    <div className="flex items-center gap-3"><span className="text-[11px] font-bold text-slate-500">{value ? "Sí" : "No"}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-8 w-14 rounded-full transition ${value ? "bg-teal-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${value ? "left-7" : "left-1"}`} /></button></div>
  </div>;
}

function Choice<T extends string>({ label, hint, value, options, onChange }: { label: string; hint: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{label}<span className="ml-2 font-medium normal-case tracking-normal text-slate-400">{hint}</span></p>
    <div className="mt-2 flex flex-wrap gap-2">{options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`rounded-lg border px-4 py-2 text-[10px] font-black uppercase ${value === option.value ? "border-[#001f3f] bg-[#001f3f] text-white" : "border-slate-200 bg-white text-[#001f3f]"}`}>{option.label}</button>)}</div>
  </div>;
}

export default function AdminParametersGeneral() {
  const [settings, setSettings] = useState<Settings>(readSettings);
  const [saved, setSaved] = useState(false);
  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
    setSaved(true);
  }

  return <div className="min-h-screen bg-[#f1f3f5] pt-24 text-[#001f3f]">
    <Header mode="admin" />
    <main className="flex min-h-[calc(100vh-96px)]">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Administración</p><h1 className="mt-2 text-2xl font-black">Parámetros · General</h1></div>
        <div className="px-4 pb-10 pt-5 sm:px-6">
          <div className="mb-5 text-[11px]"><span className="text-blue-600">Administración</span><span className="mx-1 text-slate-300">/</span><span className="text-blue-600">Parámetros</span><span className="mx-1 text-slate-300">/</span><strong>GENERAL</strong></div>
          <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <AdminParametersTabs />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="Link QR" value={settings.qrLink} onChange={(value) => update("qrLink", value)} />
              <TextField label="Versión" value={settings.version} onChange={(value) => update("version", value)} />
              <Toggle label="Modo prueba" value={settings.testMode} onChange={(value) => update("testMode", value)} />
              <Toggle label="Sistema en mantenimiento" value={settings.maintenance} onChange={(value) => update("maintenance", value)} />
              <Toggle label="Muestra novedades" value={settings.showNews} onChange={(value) => update("showNews", value)} />
              <Toggle label="Muestra más comprados" value={settings.showBestSellers} onChange={(value) => update("showBestSellers", value)} />
              <Toggle label="Muestra últimos ingresos" value={settings.showNewArrivals} onChange={(value) => update("showNewArrivals", value)} />
              <div className="hidden md:block" />
              <Choice label="Chat disponible" hint="T = público · R = registrados" value={settings.chatAudience} options={[{ value: "publico", label: "Público" }, { value: "registrados", label: "Registrados" }]} onChange={(value) => update("chatAudience", value)} />
              <Choice label="Tipo home" hint="A = slide · B = imagen única" value={settings.homeType} options={[{ value: "slide", label: "Slide" }, { value: "imagen", label: "Imagen única" }]} onChange={(value) => update("homeType", value)} />
              <TextField label="Imagen única home (archivo)" value={settings.homeImage} onChange={(value) => update("homeImage", value)} />
              <TextField label="Path imágenes default" value={settings.defaultImagesPath} onChange={(value) => update("defaultImagesPath", value)} />
              <TextField label="Path imágenes home" value={settings.homeImagesPath} onChange={(value) => update("homeImagesPath", value)} />
              <TextField label="Path imágenes principal" value={settings.mainImagesPath} onChange={(value) => update("mainImagesPath", value)} />
              <TextField label="Link revista Exclusivo Motos" value={settings.magazineLink} onChange={(value) => update("magazineLink", value)} />
              <TextField label="Path upload" value={settings.uploadPath} onChange={(value) => update("uploadPath", value)} />
              <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 md:col-span-2">Mensaje de mantenimiento / actualizaciones<textarea value={settings.maintenanceMessage} onChange={(event) => update("maintenanceMessage", event.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold normal-case tracking-normal text-[#001f3f] shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>
            </div>
            <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-100 pt-4"><span role="status" className="text-xs font-semibold text-teal-700">{saved ? "Guardado en este navegador" : ""}</span><button type="submit" className="rounded-xl bg-teal-600 px-6 py-3 text-[11px] font-black uppercase text-white shadow-sm hover:bg-teal-500">Guardar</button></div>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
