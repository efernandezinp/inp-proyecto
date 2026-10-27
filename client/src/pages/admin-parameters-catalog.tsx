import { useState, type FormEvent } from "react";
import { DatabaseZap, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminParametersTabs } from "@/components/admin/AdminParametersTabs";

const storageKey = "intercap-admin-parametros-catalogo";
const defaultImagesPath = "https://imagenes-inp-aws.s3.amazonaws.com/imagenes/productos/";

const updates = [
  "Actualizar precios",
  "Productos en oferta",
  "Visibilidad productos",
  "Aplicaciones productos",
];

const synchronizations = [
  "Productos",
  "Atributos",
  "Aplicaciones",
  "Presentaciones",
  "Imágenes",
  "Videos",
  "Sustitutos y relacionados",
  "Excepciones",
  "Ofertas (ventas especiales)",
  "Coeficientes tarjetas (INPAY)",
  "Cotización USD",
  "Listas home (recomendadas, destacadas, últimos ingresos)",
];

function readImagesPath() {
  try {
    return window.localStorage.getItem(storageKey) ?? defaultImagesPath;
  } catch {
    return defaultImagesPath;
  }
}

export default function AdminParametersCatalog() {
  const [imagesPath, setImagesPath] = useState(readImagesPath);
  const [message, setMessage] = useState("");

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem(storageKey, imagesPath);
      setMessage("Ruta de imágenes guardada en este navegador");
    } catch {
      setMessage("No se pudo guardar en este navegador");
    }
  }

  function explainAction(action: string) {
    setMessage(`“${action}” requiere conexión con el servidor. No se inició ningún proceso.`);
  }

  return <div className="min-h-screen bg-[#f1f3f5] pt-24 text-[#001f3f]">
    <Header mode="admin" />
    <main className="flex min-h-[calc(100vh-96px)]">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Administración</p><h1 className="mt-2 text-2xl font-black">Parámetros · Catálogo</h1></div>
        <div className="px-4 pb-10 pt-5 sm:px-6">
          <div className="mb-5 text-[11px]"><span className="text-blue-600">Administración</span><span className="mx-1 text-slate-300">/</span><span className="text-blue-600">Parámetros</span><span className="mx-1 text-slate-300">/</span><strong>CATÁLOGO</strong></div>
          <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <AdminParametersTabs />
            <label className="block max-w-[800px] pt-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Path imágenes productos<input value={imagesPath} onChange={(event) => { setImagesPath(event.target.value); setMessage(""); }} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold normal-case tracking-normal text-[#001f3f] shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>

            <section className="mt-10"><h2 className="mb-4 text-sm font-black uppercase tracking-[0.1em] text-slate-500">Actualizaciones</h2><div className="flex flex-wrap gap-2">{updates.map((label) => <button key={label} type="button" onClick={() => explainAction(label)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] font-black uppercase text-[#001f3f] hover:bg-slate-100"><RefreshCw className="h-4 w-4 text-teal-600" />{label}</button>)}</div></section>

            <section className="mt-10"><h2 className="mb-2 text-sm font-black uppercase tracking-[0.1em] text-slate-500">Sincronización manual (Elasticsearch)</h2><p className="mb-4 text-xs text-slate-500">Ejecuta la extracción desde SQL y reindexa en Elasticsearch (equivalente a esperar los pipelines programados de Logstash). No arranca contenedores de Logstash ni Kibana: solo la API del backend escribe en el índice.</p><div className="flex flex-wrap gap-2">{synchronizations.map((label) => <button key={label} type="button" onClick={() => explainAction(label)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] font-black uppercase text-[#001f3f] hover:bg-slate-100"><DatabaseZap className="h-4 w-4 text-teal-600" />{label}</button>)}</div></section>

            <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-100 pt-4"><span role="status" className="max-w-xl text-right text-xs font-semibold text-teal-700">{message}</span><button type="submit" className="rounded-xl bg-teal-600 px-6 py-3 text-[11px] font-black uppercase text-white shadow-sm hover:bg-teal-500">Guardar</button></div>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
