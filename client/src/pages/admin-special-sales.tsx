import { useMemo, useState, type FormEvent } from "react";
import { BriefcaseBusiness, ChevronDown, CirclePlus, Clock3, Grid2X2, LayoutGrid, List, RotateCcw, Search, TrendingUp, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type Status = "ACTIVO" | "CONFIRMADO" | "CERRADO";
type Campaign = { id: string; name: string; status: Status; progress: number; days: number; units: number; created: string };

const names = [
  "OFERTA BOSCH 01", "OFERTA DELTA 01",
  "VF 7334 1235 REG. C/C 12V TRIF. 20A C/TECN. MOSFET EJ:SUZUKI DR 650 R-DR 800 BIG",
  "VF 7333 1235 REG. C/C 12V TRIF. 20A C/TECN. MOSFET EJ:SUZUKI DR 650 R-DR 800 BIG",
  "VF 7332 1235 REG. C/C 12V TRIF. 20A C/TECN. MOSFET EJ:SUZUKI DR 650 R-DR 800 BIG",
  "VF 7331 1235 REG. C/C 12V TRIF. 20A C/TECN. MOSFET EJ:SUZUKI DR 650 R-DR 800 BIG",
  "VF 7330 TUBO EXTRACTOR SONDA LAMBDA 17mm (11/16) BIKE SERVICE ENCASTRE 3/8",
  "VF 7329 PISTOLA PARA INFLAR Y CALIBRAR NEUMATICOS BIKE SERVICE",
  "VF 7328 JUEGO VALVULAS COMPETICION BBB MPI 1X ADM 60492-A/1X ESC 60493-E YAMAHA YBR 125/XTZ 125",
  "VF 7327 KIT SUPERSPROX CORONA/PIÑON/CADENA REFORZADA 49/17 428H-132 HONDA XR150L",
  "VF 7326 2.75-17 47P TT UB-2305 SPIDER DURTEC TIRES",
  "VF 7325 9331 DESTELLADOR DE GIRO 12V RECTANGULO 2 TERMINALES UNIVERSAL S/SONIDO",
  "VF 7324 9331 DESTELLADOR DE GIRO 12V RECTANGULO 2 TERMINALES UNIVERSAL S/SONIDO",
  "VF 7323 9331 DESTELLADOR DE GIRO 12V RECTANGULO 2 TERMINALES UNIVERSAL S/SONIDO",
  "VF 7322 9331 DESTELLADOR DE GIRO 12V RECTANGULO 2 TERMINALES UNIVERSAL S/SONIDO",
  "VF 7321 MULETA HP KAZE-R/MODENAS/GILERA/GUERRERO/WAVE/BETA TUNING CROMADA",
  "VF 7320 MULETA HP KAZE-R/MODENAS/GILERA/GUERRERO/WAVE/BETA TUNING CROMADA",
  "VF 7319 EXTRACTOR DE PERNO DE CADENA 415/420/428 BIKE SERVICE",
  "VF 7318 CADENA DISTRIBUCION REINF 404H 96L YAMAHA FZ 16/SZ 15",
  "VF 7317 CADENA EK CHAIN 428 DEH-134L W/SPJ (4900 LBS)",
  "VF 7316 3.00-18 52L REINF TT HDMA005",
  "VF 7315 2093 CDI MONDIAL AH 110", "VF 7314 2093 CDI MONDIAL AH 110",
  "VF 7313 2093 CDI MONDIAL AH 110",
  "VF 7312 MANUBRIO HP DEPORTIVO S/ESTEN DA-DALT/JUKI DRIBLING CROMADO",
];

const initialCampaigns: Campaign[] = names.map((name, index) => ({
  id: `OMS-AC-${7336 - index}`,
  name,
  status: index === 0 || index >= 21 ? "CERRADO" : index === 1 ? "CONFIRMADO" : "ACTIVO",
  progress: index === 1 ? 4 : 0,
  days: index === 1 ? 4 : 0,
  units: 0,
  created: index === 0 ? "2026-10-16T09:40" : index === 1 ? "2026-10-08T12:03" : `2026-10-04T19:${String(34 - index).padStart(2, "0")}`,
}));

function Metric({ label, value, note, icon: Icon, green = false }: { label: string; value: string; note: string; icon: typeof TrendingUp; green?: boolean }) {
  return <div className={`flex min-h-32 justify-between gap-3 rounded-[20px] p-5 text-white shadow-sm ${green ? "bg-gradient-to-br from-[#092d42] to-[#0d3b2c]" : "bg-gradient-to-br from-[#102b4c] to-[#173b67]"}`}>
    <div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-sky-200">{label}</p><strong className="mt-3 block text-2xl font-black">{value}</strong><p className="mt-2 text-[11px] font-semibold text-sky-200/80">{note}</p></div>
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10"><Icon className="h-5 w-5 text-sky-300" /></span>
  </div>;
}

export default function AdminSpecialSales() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [tab, setTab] = useState<"summary" | "management">("summary");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applied, setApplied] = useState({ from: "", to: "", query: "" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [days, setDays] = useState("");
  const [status, setStatus] = useState<Status>("ACTIVO");
  const filtered = useMemo(() => campaigns.filter((campaign) =>
    (!applied.from || campaign.created.slice(0, 10) >= applied.from) &&
    (!applied.to || campaign.created.slice(0, 10) <= applied.to) &&
    (!applied.query || campaign.status.toLowerCase().includes(applied.query.toLowerCase().trim()))), [campaigns, applied]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const openEditor = (campaign?: Campaign) => {
    setEditingId(campaign?.id ?? null);
    setName(campaign?.name ?? "");
    setGoal(String(campaign?.units ?? ""));
    setDays(String(campaign?.days ?? ""));
    setStatus(campaign?.status ?? "ACTIVO");
    setNewOpen(true);
  };

  const addCampaign = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    if (editingId) {
      setCampaigns((current) => current.map((item) => item.id === editingId ? { ...item, name: name.trim().toUpperCase(), status, days: Number(days) || 0, units: Number(goal) || 0 } : item));
    } else {
      const campaign: Campaign = { id: `LOCAL-${Date.now()}`, name: name.trim().toUpperCase(), status, progress: 0, days: Number(days) || 0, units: Number(goal) || 0, created: new Date().toISOString().slice(0, 16) };
      setCampaigns((current) => [campaign, ...current]);
    }
    setName(""); setGoal(""); setDays(""); setStatus("ACTIVO"); setNewOpen(false); setPage(1); setTab("management");
  };

  return <div className="min-h-screen bg-[#f1f3f5] pt-24 text-[#001f3f]">
    <Header mode="admin" />
    <main className="flex min-h-[calc(100vh-96px)]">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Administración</p>
          <h1 className="mt-2 text-2xl font-black">Ventas especiales</h1>
        </div>
        <div className="px-4 pb-10 pt-5 sm:px-6">
          <div className="mb-5 text-[11px]"><span className="text-blue-600">Administración</span><span className="mx-2 text-slate-300">/</span><strong className="uppercase">Ventas especiales</strong></div>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex gap-2 border-b border-slate-200" role="tablist" aria-label="Ventas especiales">
              <button type="button" role="tab" aria-selected={tab === "summary"} onClick={() => setTab("summary")} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-[11px] font-black uppercase ${tab === "summary" ? "border-teal-500 text-[#001f3f]" : "border-transparent text-slate-500"}`}><Grid2X2 className="h-3.5 w-3.5" /> Resumen</button>
              <button type="button" role="tab" aria-selected={tab === "management"} onClick={() => setTab("management")} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-[11px] font-black uppercase ${tab === "management" ? "border-teal-500 text-[#001f3f]" : "border-transparent text-slate-500"}`}><List className="h-3.5 w-3.5" /> Gestión</button>
            </div>
            {tab === "summary" && <><div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Unidades" value="11" note="Vendidas (meta - disponible)" icon={TrendingUp} />
              <Metric label="Pools" value={String(campaigns.length)} note="En esta página" icon={LayoutGrid} />
              <Metric label="Confirmados" value={String(campaigns.filter((item) => item.status === "CONFIRMADO").length)} note="Estado CONFIRMADO" icon={BriefcaseBusiness} />
              <Metric label="Activas" value={`${campaigns.filter((item) => item.status !== "CERRADO").length} /${campaigns.length} visibles`} note="Por texto de estado" icon={Grid2X2} green />
            </div>
            <div className="overflow-hidden rounded-[22px] border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6">
                <div><h2 className="text-sm font-black uppercase tracking-wide">Ventas especiales</h2><p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Rendimiento de campañas</p><p className="mt-3 max-w-2xl text-[10px] leading-4 text-slate-400">Avance, mix por sucursal, ingresos, GM%, penetración y top comerciales desde Softland (carritos confirmados). Expandí un pool para ver el detalle por producto.</p></div>
                <div className="flex flex-wrap gap-2"><button type="button" onClick={() => openEditor()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-[11px] font-black uppercase text-[#001f3f] shadow-sm hover:bg-emerald-300"><CirclePlus className="h-4 w-4" /> Nueva oferta</button><button type="button" onClick={() => setTab("management")} className="rounded-xl border-2 border-[#001f3f] px-4 py-2 text-[11px] font-black uppercase hover:bg-slate-50">Gestión completa</button></div>
              </div>
              <div className="divide-y divide-slate-200">{campaigns.map((campaign) => <div key={campaign.id} className="bg-slate-50/60">
                <button type="button" aria-expanded={expanded === campaign.id} onClick={() => setExpanded(expanded === campaign.id ? null : campaign.id)} className="grid w-full gap-4 px-5 py-5 text-left sm:px-6 lg:grid-cols-[minmax(250px,1.5fr)_minmax(180px,1fr)_80px_65px_95px_20px] lg:items-center">
                  <div className="flex items-start gap-3"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${campaign.status === "CERRADO" ? "bg-slate-400" : "bg-emerald-500"}`} /><div className="min-w-0"><h3 className="text-xs font-black uppercase leading-5">{campaign.name}</h3><p className="mt-1 text-[11px] text-slate-400">{campaign.id}</p><span className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-black ${campaign.status === "CERRADO" ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-600"}`}>{campaign.status}</span></div></div>
                  <div><div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-500">Meta de ventas</span><span>{campaign.progress ? `${campaign.progress}%` : "—"}</span></div><div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.min(100, campaign.progress)}%` }} /></div></div>
                  <div className="text-[10px] font-black uppercase text-slate-500">Ingresos<strong className="mt-1 block text-sm text-[#001f3f]">—</strong></div><div className="text-[10px] font-black uppercase text-slate-500">GM%<strong className="mt-1 block text-sm text-[#001f3f]">—</strong></div><div className="text-[10px] font-black uppercase text-slate-500">Cierre en<strong className="mt-1 flex items-center gap-1 text-sm text-[#001f3f]"><Clock3 className="h-3.5 w-3.5 text-slate-400" /> {campaign.days} d</strong></div><ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expanded === campaign.id ? "rotate-180" : ""}`} />
                </button>
                {expanded === campaign.id && <div className="border-t border-slate-200 bg-white px-8 py-4 text-xs text-slate-600"><div className="grid gap-3 sm:grid-cols-3"><p><strong className="text-[#001f3f]">Código:</strong> {campaign.id}</p><p><strong className="text-[#001f3f]">Estado:</strong> {campaign.status}</p><p><strong className="text-[#001f3f]">Meta:</strong> {campaign.units ? `${campaign.units} unidades` : "Sin datos"}</p></div><p className="mt-3 text-slate-400">No hay detalle de productos conectado para esta oferta.</p></div>}
              </div>)}</div>
            </div>
            </>}
            {tab === "management" && <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <button type="button" onClick={() => { setApplied({ from, to, query }); setPage(1); }} className="rounded-xl border border-slate-600 bg-slate-600 px-3 py-2 text-[11px] font-black uppercase text-white">Actualizar</button>
                <button type="button" onClick={() => openEditor()} className="rounded-xl bg-[#001f3f] px-4 py-2 text-[11px] font-black uppercase text-white">Nueva estrategia</button>
              </div>
              <form onSubmit={(event) => { event.preventDefault(); setApplied({ from, to, query }); setPage(1); }} className="mb-3 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label className="min-w-32 flex-1 text-[10px] font-black uppercase tracking-wide text-slate-500">Fecha desde<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs text-[#001f3f]" /></label>
                <label className="min-w-32 flex-1 text-[10px] font-black uppercase tracking-wide text-slate-500">Fecha hasta<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs text-[#001f3f]" /></label>
                <label className="min-w-48 flex-[4] text-[10px] font-black uppercase tracking-wide text-slate-500">Estado contiene<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Activo, confirmado..." className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-[#001f3f]" /></label>
                <button type="submit" aria-label="Buscar" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 bg-white"><Search className="h-4 w-4" /></button>
                <button type="button" onClick={() => { setFrom(""); setTo(""); setQuery(""); setApplied({ from: "", to: "", query: "" }); setPage(1); }} aria-label="Limpiar filtros" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white"><RotateCcw className="h-4 w-4" /></button>
                <label className="text-[10px] font-black uppercase tracking-wide text-slate-500">Por página<select value={perPage} onChange={(event) => { setPerPage(Number(event.target.value)); setPage(1); }} className="ml-2 h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs text-[#001f3f]"><option>10</option><option>25</option><option>50</option></select></label>
              </form>
              <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold">
                <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 uppercase disabled:opacity-40">Anterior</button>
                <span>Página {page} / {totalPages} · {filtered.length} registros de muestra</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 uppercase disabled:opacity-40">Siguiente</button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[760px] text-left text-[11px]"><thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500"><tr><th className="p-4">Nrpool</th><th className="p-4">Descripción</th><th className="p-4">Estado</th><th className="p-4">Fecha alta</th><th className="p-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((item) => <tr key={item.id} className="font-bold"><td className="p-4 font-black">{item.id.replace("OMS-AC-", "")}</td><td className="max-w-[380px] truncate p-4" title={item.name}>{item.name}</td><td className="p-4">{item.status}</td><td className="p-4 text-slate-500">{new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.created))}</td><td className="space-x-2 whitespace-nowrap p-4 text-right"><button type="button" onClick={() => openEditor(item)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase">Editar</button><button type="button" disabled={item.status === "CONFIRMADO"} onClick={() => setCampaigns((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, status: "CONFIRMADO" } : candidate))} className="rounded-lg bg-teal-600 px-3 py-2 text-[10px] font-black uppercase text-white disabled:opacity-45">Confirmar</button></td></tr>)}{visible.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-slate-500">No se encontraron estrategias.</td></tr>}</tbody></table></div>
            </>}
          </section>
        </div>
      </div>
    </main>
    <Footer />
    {newOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setNewOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="new-offer-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 id="new-offer-title" className="text-lg font-black">{editingId ? "Editar estrategia" : "Nueva estrategia"}</h2><p className="mt-1 text-xs text-slate-500">Demostración local. Los cambios no se publican ni se envían a Softland.</p></div><button type="button" onClick={() => setNewOpen(false)} aria-label="Cerrar" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><form onSubmit={addCampaign} className="mt-5 space-y-4"><label className="block text-xs font-bold">Nombre<input required maxLength={150} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-teal-500" /></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold">Meta en unidades<input type="number" min="0" value={goal} onChange={(event) => setGoal(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-teal-500" /></label><label className="block text-xs font-bold">Cierre en días<input type="number" min="0" value={days} onChange={(event) => setDays(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-teal-500" /></label></div><label className="block text-xs font-bold">Estado<select value={status} onChange={(event) => setStatus(event.target.value as Status)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"><option value="ACTIVO">Activo</option><option value="CONFIRMADO">Confirmado</option><option value="CERRADO">Cerrado</option></select></label><button type="submit" className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-xs font-black uppercase text-[#001f3f] hover:bg-emerald-400">{editingId ? "Guardar cambios" : "Crear oferta de muestra"}</button></form></section></div>}
  </div>;
}
