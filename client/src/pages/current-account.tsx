import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, Clock3, FileSpreadsheet, RotateCcw, TriangleAlert, Upload, Wallet, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLocation } from "wouter";

type AccountTab = "pending" | "history" | "reports" | "receipts";
type PaymentReport = { id: number; date: string; amount: number; reference: string };

const money = (value: number) => `$ ${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const REPORTS_STORAGE_KEY = "intercap-payment-reports-demo";
function loadReports(): PaymentReport[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(REPORTS_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((report): report is PaymentReport =>
      typeof report?.id === "number" && typeof report?.date === "string" &&
      typeof report?.amount === "number" && Number.isFinite(report.amount) && report.amount > 0 &&
      typeof report?.reference === "string") : [];
  } catch { return []; }
}
const tabs: { id: AccountTab; label: string }[] = [
  { id: "pending", label: "Importes pendientes" },
  { id: "history", label: "Historial completo" },
  { id: "reports", label: "Historial informes pago" },
  { id: "receipts", label: "Descarga comprobantes" },
];

function EmptyTable({ title, columns, message, reports = [], onExport }: {
  title: string; columns: string[]; message: string; reports?: PaymentReport[]; onExport?: () => void;
}) {
  return <section className="min-w-0 flex-1">
    <div className="mb-3 flex min-h-10 items-center justify-between gap-3">
      <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#001f3f]">{title}</h3>
      {onExport && <button type="button" onClick={onExport} disabled={reports.length === 0} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Excel</button>}
    </div>
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[420px] text-left">
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500"><tr>{columns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}</tr></thead>
        <tbody className="text-xs text-slate-600">
          {reports.length ? reports.map((report) => <tr key={report.id} className="border-t border-slate-100"><td className="px-4 py-3 font-semibold">{report.reference}</td><td className="px-4 py-3">{new Date(`${report.date}T12:00:00`).toLocaleDateString("es-AR")}</td><td className="px-4 py-3 text-right font-bold text-[#001f3f]">{money(report.amount)}</td></tr>) : <tr><td colSpan={columns.length} className="h-20 px-4 text-center text-slate-500">{message}</td></tr>}
        </tbody>
      </table>
    </div>
  </section>;
}

export default function CurrentAccount({ initialReportOpen = false }: { initialReportOpen?: boolean }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<AccountTab>("pending");
  const [creditOpen, setCreditOpen] = useState(true);
  const [reportOpen, setReportOpen] = useState(initialReportOpen);
  const [reports, setReports] = useState<PaymentReport[]>(loadReports);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [reference, setReference] = useState("");
  const pendingToApply = reports.reduce((total, report) => total + report.amount, 0);

  const closeReport = () => {
    setReportOpen(false);
    if (initialReportOpen) navigate("/cuenta-corriente", { replace: true });
  };

  useEffect(() => {
    if (!reportOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeReport(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reportOpen, initialReportOpen, navigate]);

  const exportReports = () => {
    if (!reports.length) return;
    const csvField = (value: string) => `"${(/^[=+\-@\t]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
    const rows = ["Referencia;Fecha;Monto", ...reports.map((report) => `${csvField(report.reference)};${report.date};${report.amount.toFixed(2).replace(".", ",")}`)];
    const blob = new Blob(["\ufeff", rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "informes-de-pago.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || !date || !reference.trim()) return;
    const nextReports = [...reports, { id: Date.now(), date, amount: parsedAmount, reference: reference.trim() }];
    setReports(nextReports);
    try { window.sessionStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(nextReports)); } catch { /* session only */ }
    setAmount(""); setDate(""); setReference(""); closeReport(); setTab("pending");
  };

  return <div className="min-h-screen bg-[#f2f3f5] pt-24 text-[#001f3f]">
    <Header />
    <main className="mx-auto w-full max-w-[1900px] px-3 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Administración / Finanzas</p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">Estado de cuenta</h1>
          <p className="mt-2 text-xs sm:text-sm">Cliente Para Operaciones de Contado <span className="text-slate-400">· Cuenta 000000</span></p>
          <p className="mt-5 text-sm text-slate-600 sm:text-base">Saldo actual: <strong className="text-lg font-black text-[#001f3f]">{money(0)}</strong></p>
        </div>
        <button type="button" onClick={() => setReportOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-3 text-xs font-black uppercase text-white shadow-lg transition hover:bg-[#073b70]"><Upload className="h-4 w-4" /> Informar pago</button>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Saldo a vencer</p><strong className="mt-3 block text-2xl font-black text-teal-700">{money(0)}</strong><p className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500"><Clock3 className="h-3.5 w-3.5" /> Sin vencimientos próximos</p></div>
        <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Saldo vencido</p><strong className="mt-3 block text-2xl font-black text-red-600">{money(0)}</strong><p className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500"><TriangleAlert className="h-3.5 w-3.5" /> Al día</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Saldo pendiente de aplicar</p><strong className="mt-3 block text-2xl font-black text-emerald-600">{money(pendingToApply)}</strong><p className="mt-3 text-slate-500"><RotateCcw className="h-3.5 w-3.5" /></p></div>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button type="button" aria-expanded={creditOpen} onClick={() => setCreditOpen(!creditOpen)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
          <span className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.12em]"><Wallet className="h-4 w-4 text-teal-600" /> Crédito documentado</span>
          <span className="flex items-center gap-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase">Total {money(0)}</span><ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${creditOpen ? "rotate-180" : ""}`} /></span>
        </button>
        {creditOpen && <div className="flex min-h-20 items-center justify-center border-t border-slate-100 px-4 text-xs text-slate-500">No hay valores</div>}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50 p-2" role="tablist" aria-label="Movimientos de cuenta corriente">
          {tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={`shrink-0 rounded-lg px-4 py-3 text-[10px] font-black uppercase transition ${tab === item.id ? "bg-white text-[#001f3f] shadow-sm" : "text-slate-500 hover:bg-white/70"}`}>{item.label}</button>)}
        </div>
        <div role="tabpanel" className="p-4 sm:p-6">
          {tab === "pending" && <div className="flex flex-col gap-4 lg:flex-row">
            <EmptyTable title="Sus compras pendientes de pago" columns={["Documento", "Vencimiento", "Estado", "Monto"]} message="No se han encontrado débitos pendientes" onExport={() => {}} />
            <EmptyTable title="Sus pagos pendientes de aplicar" columns={["Documento", "Vencimiento", "Pendiente"]} message="No se han encontrado créditos pendientes" reports={reports} onExport={exportReports} />
          </div>}
          {tab === "history" && <EmptyTable title="Historial completo" columns={["Documento", "Fecha", "Estado", "Monto"]} message="No hay movimientos para mostrar" />}
          {tab === "reports" && <EmptyTable title="Historial de informes de pago" columns={["Referencia", "Fecha", "Monto"]} message="No hay informes de pago" reports={reports} onExport={exportReports} />}
          {tab === "receipts" && <EmptyTable title="Descarga de comprobantes" columns={["Documento", "Fecha", "Comprobante"]} message="No hay comprobantes disponibles" />}
        </div>
      </section>
    </main>
    <Footer />

    {reportOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeReport(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="report-payment-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3"><div><h2 id="report-payment-title" className="text-lg font-black">Informar pago</h2><p className="mt-1 text-xs leading-5 text-slate-500">Demostración local: el informe no se envía ni modifica una cuenta real.</p></div><button type="button" onClick={closeReport} aria-label="Cerrar" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
        <form onSubmit={saveReport} className="mt-5 space-y-4">
          <label className="block text-xs font-bold">Monto abonado<input type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-500" /></label>
          <label className="block text-xs font-bold">Fecha de pago<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-500" /></label>
          <label className="block text-xs font-bold">Referencia o número de operación<input type="text" required maxLength={80} value={reference} onChange={(event) => setReference(event.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-500" /></label>
          <button type="submit" className="w-full rounded-lg bg-[#001f3f] px-4 py-3 text-xs font-black uppercase text-white hover:bg-[#073b70]">Guardar en esta sesión</button>
        </form>
      </section>
    </div>}
  </div>;
}
