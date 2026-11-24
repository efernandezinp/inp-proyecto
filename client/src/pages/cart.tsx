import { useRef, useState } from "react";
import { Link } from "wouter";
import { CalendarDays, Check, ClipboardList, CreditCard, FileSpreadsheet, FileText, Link2, MapPin, Minus, Package, Plus, ShoppingCart, Tag, Trash2, Truck, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { addPendingToCart, addToCart, clearCart, createCart, deleteCart, removeFromCart, selectCart, setCartQuantity, updateCart, updateCheckout, useCarts, WHOLESALE_ADDRESSES } from "@/lib/cart";
import { calculateCheckout, checkoutErrors, shippingEstimate } from "@/lib/checkout";
import { CheckoutModeSelector, DropshipCheckoutForm } from "@/components/cart/CheckoutOptions";
import { PRODUCTS } from "@/lib/products";
import { updateOrders, useOrders } from "@/lib/orders-store";
import type { OrderItem } from "@/lib/orders-data";

const money = (value: number) => new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(value);
const productByCode = new Map(PRODUCTS.map((product) => [product.code, product]));
const weightByCode = new Map(PRODUCTS.map((product) => [product.code, product.weightKg]));
const formatWeight = (kg: number) => `${new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(kg)} kg`;

function parseExcelCsv(contents: string): Array<{ code: string; quantity: number }> {
  const firstLine = contents.split(/\r?\n/, 1)[0] ?? "";
  const separator = [";", "\t", ","].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < contents.length; index++) {
    const character = contents[index];
    if (character === '"') {
      if (quoted && contents[index + 1] === '"') { field += '"'; index++; }
      else quoted = !quoted;
    } else if (character === separator && !quoted) {
      row.push(field.trim()); field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && contents[index + 1] === "\n") index++;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; field = "";
    } else field += character;
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  const headers = rows[0]?.map((value) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\ufeff]/g, "")) ?? [];
  const codeIndex = headers.findIndex((value) => /^(codigo|cod|sku|producto)$/.test(value));
  const quantityIndex = headers.findIndex((value) => /^(cantidad|cant|unidades)$/.test(value));
  const data = codeIndex >= 0 ? rows.slice(1) : rows;
  return data.map((cells) => ({
    code: String(cells[codeIndex >= 0 ? codeIndex : 0] ?? "").trim(),
    quantity: Number(cells[quantityIndex >= 0 ? quantityIndex : 1] ?? 1),
  })).filter(({ code, quantity }) => /^\d{12}$/.test(code) && Number.isSafeInteger(quantity) && quantity > 0);
}

export default function Cart() {
  const { carts, activeId } = useCarts();
  const orders = useOrders();
  const pendingWithStock = orders.flatMap(order => order.timelineStep >= 4
    ? order.items.filter(item => item.requestedQty > item.allocatedQty && !item.pendingAction &&
      Object.values(item.stockRegional ?? {}).some(level => level === "low" || level === "medium" || level === "high")
    ).map(item => ({ order, item }))
    : []);
  const active = carts.find((cart) => cart.id === activeId);
  const items = active?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = active?.checkout.mode === "dropship" && items.length > 0 ? shippingEstimate(active) : 0;
  const totalWithShipping = total + shippingCost;
  const cartLineCount = items.length + (shippingCost > 0 ? 1 : 0);
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedWeightKg = items.reduce((sum, item) => sum + (weightByCode.get(item.code) ?? 0) * item.quantity, 0);
  const weightLabel = items.some((item) => weightByCode.get(item.code) == null)
    ? "Sin datos"
    : `≈ ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(estimatedWeightKg)} kg`;
  const financials = active ? calculateCheckout(active) : null;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [checkoutAttempted, setCheckoutAttempted] = useState(false);
  const [paymentPreviewOpen, setPaymentPreviewOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState("");
  const checkoutIssues = checkoutAttempted && active ? checkoutErrors(active) : [];

  const addPendingItem = (orderId: string, item: OrderItem) => {
    if (!active) return;
    const available = item.requestedQty - item.allocatedQty;
    if (!Number.isSafeInteger(available) || available < 1) return;
    const catalogProduct = productByCode.get(item.sku);
    addPendingToCart({
      code: item.sku,
      title: item.name,
      brand: catalogProduct?.brand ?? "INTERCAP",
      image: catalogProduct?.image ?? "/images/product-placeholder.svg",
      price: item.unitPriceARS,
    }, { orderId, sku: item.sku, quantity: available, pendingUnitsDeducted: true });
    updateOrders(current => current.map(order => order.id === orderId
      ? { ...order, items: order.items.map(pending => pending.sku === item.sku ? { ...pending, requestedQty: pending.allocatedQty } : pending) }
      : order));
  };

  const importCsv = async (file?: File) => {
    if (!file) return;
    try {
      const rows = parseExcelCsv(await file.text());
      const known = rows.filter(({ code }) => productByCode.has(code));
      known.forEach(({ code, quantity }) => addToCart(productByCode.get(code)!, quantity));
      setImportMessage(known.length
        ? `${known.length} artículos importados${rows.length > known.length ? `; ${rows.length - known.length} códigos no encontrados` : ""}.`
        : "No se encontraron códigos válidos. Usá un CSV de Excel con columnas Código y Cantidad.");
    } catch {
      setImportMessage("No se pudo leer el archivo. Exportá la hoja como CSV e intentá nuevamente.");
    }
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const switchCart = (id: string) => {
    selectCart(id);
    setConfirmDelete(false);
    setConfirmClear(false);
    setCheckoutAttempted(false);
    setPaymentPreviewOpen(false);
  };

  const completeCheckout = () => {
    if (!active) return;
    const issues = checkoutErrors(active);
    setCheckoutAttempted(true);
    if (issues.length > 0) return;
    setCheckoutAttempted(false);
    if (active.checkout.mode === "b2b") {
      updateCheckout(active.id, { status: "b2b-confirmed" });
    } else {
      updateCheckout(active.id, { status: "awaiting-payment" });
      setPaymentPreviewOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f9] pt-24 text-[#001f3f]">
      <Header />
      <main className="mx-auto w-full max-w-[1480px] px-4 pb-12 pt-3 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#001f3f] text-white"><ShoppingCart className="h-5 w-5" /></div>
          <div className="min-w-0">
            <h1 className="text-xl font-black uppercase italic tracking-tight sm:text-2xl">{active ? `Carrito #${String(active.number).padStart(6, "0")}` : "Mis carritos"}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 sm:text-[11px]">
              <span>Detalle y edición de carritos múltiples</span>
              {active && <span className="inline-flex items-center gap-1 border-l border-slate-200 pl-4"><CalendarDays className="h-3 w-3" /> {new Date(active.createdAt).toLocaleDateString("es-AR")}</span>}
            </div>
          </div>
        </div>

        <div className="flex min-h-10 min-w-0 items-end gap-2 overflow-x-auto border-b border-slate-200 pb-px" role="tablist" aria-label="Carritos">
          {carts.map((cart) => {
            const isActive = cart.id === activeId;
            return (
              <button key={cart.id} type="button" role="tab" aria-selected={isActive} onClick={() => switchCart(cart.id)}
                className={`group flex min-w-[170px] max-w-[250px] shrink-0 items-center gap-2 rounded-t-lg border px-3 py-2 text-[11px] font-black uppercase shadow-sm transition ${isActive ? "border-slate-200 border-b-white bg-white text-[#001f3f]" : "border-transparent bg-slate-100 text-slate-400 hover:bg-white hover:text-[#001f3f]"}`}>
                <span className={`h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-[#08a64f]" : "bg-slate-300"}`} />
                <span className="truncate">{cart.name.trim() || "Sin nombre"}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => { createCart(); setConfirmDelete(false); setConfirmClear(false); }} aria-label="Crear nuevo carrito" title="Nuevo carrito"
            className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#001f3f] text-white shadow-sm transition hover:bg-[#006ad8]">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {!active ? (
          <section className="rounded-b-2xl border border-t-0 border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h2 className="text-xl font-black">No hay carritos abiertos</h2>
            <p className="mt-2 text-sm text-slate-500">Creá uno para organizar tus productos.</p>
            <button type="button" onClick={createCart} className="mt-6 rounded-lg bg-[#001f3f] px-5 py-3 text-xs font-black uppercase text-white hover:bg-[#006ad8]">Crear carrito</button>
          </section>
        ) : (
          <div className="grid items-start gap-4 pt-3 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-3">
              <CheckoutModeSelector cart={active} />
              <section aria-label="Datos del carrito" className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${active.checkout.mode === "dropship" ? "p-2.5 sm:p-3" : "p-3 sm:p-4"}`}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block min-w-0">
                    <span className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide"><Tag className="h-3.5 w-3.5 text-[#001f3f]" /> Referencia / identificador</span>
                    <input value={active.name} onChange={(event) => updateCart(active.id, { name: event.target.value })} maxLength={80} placeholder="Ej: Stock Local - Marzo"
                      className="h-9 w-full rounded-lg border border-slate-100 bg-[#f7f8fa] px-3 text-xs font-semibold outline-none transition focus:border-[#006ad8] focus:bg-white focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <label className="block min-w-0">
                    <span className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide"><FileText className="h-3.5 w-3.5 text-[#001f3f]" /> Notas de logística</span>
                    <input value={active.notes} onChange={(event) => updateCart(active.id, { notes: event.target.value })} maxLength={500} placeholder="Aclaraciones importantes..."
                      className="h-9 w-full rounded-lg border border-slate-100 bg-[#f7f8fa] px-3 text-xs font-semibold outline-none transition focus:border-[#006ad8] focus:bg-white focus:ring-2 focus:ring-blue-100" />
                  </label>
                </div>
              </section>

              {active.checkout.mode === "b2b" && <section aria-label="Dirección de entrega" className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <label className="block">
                  <span className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide"><MapPin className="h-3.5 w-3.5 text-[#001f3f]" /> Dirección de entrega</span>
                  <select value={active.address} onChange={(event) => updateCart(active.id, { address: event.target.value })}
                    className="h-9 w-full rounded-lg border border-slate-100 bg-[#f7f8fa] px-3 text-xs font-bold outline-none transition focus:border-[#006ad8] focus:bg-white focus:ring-2 focus:ring-blue-100">
                    {!WHOLESALE_ADDRESSES.some((address) => address === active.address) && <option value={active.address}>{active.address}</option>}
                    {WHOLESALE_ADDRESSES.map((address) => <option key={address} value={address}>{address}</option>)}
                  </select>
                </label>
              </section>}

              {active.checkout.mode === "dropship" && <DropshipCheckoutForm cart={active} />}

              <section aria-label="Artículos del carrito" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                  <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide"><Package className="h-4 w-4" /> Artículos ({cartLineCount})</h2>
                  <div className="flex items-center gap-3">
                    <input ref={importInputRef} type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" onChange={(event) => void importCsv(event.target.files?.[0])} className="hidden" aria-label="Seleccionar CSV exportado desde Excel" />
                    <button type="button" onClick={() => importInputRef.current?.click()} title="Importar CSV exportado desde Excel con columnas Código y Cantidad" className="inline-flex items-center gap-2 rounded-lg bg-[#001f3f] px-3 py-2 text-[10px] font-black uppercase text-white shadow-sm transition hover:bg-[#006ad8]"><FileSpreadsheet className="h-3.5 w-3.5" /> Importar Excel</button>
                  </div>
                </div>
                {importMessage && <p role="status" className="border-b border-slate-100 px-5 py-2 text-xs text-slate-600 sm:px-6">{importMessage}</p>}
                {items.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-4 text-sm font-bold">Este carrito está vacío</p>
                    <p className="mt-1 text-xs text-slate-500">Elegí productos del catálogo para el carrito activo.</p>
                    <Link href="/catalogo" className="mt-4 inline-block rounded-lg bg-[#001f3f] px-4 py-2 text-[10px] font-black uppercase text-white hover:bg-[#006ad8]">Agregar artículos</Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] table-fixed text-left">
                      <thead className="border-b border-slate-200 bg-white text-[10px] font-bold uppercase text-slate-500">
                        <tr><th className="w-[43%] px-5 py-3 sm:px-6">Producto</th><th className="w-[8%] border-l border-slate-100 px-2 py-3 text-center">Peso T.</th><th className="w-[9%] border-l border-slate-100 px-2 py-3 text-center">Cant.</th><th className="w-[18%] border-l border-slate-100 px-2 py-3 text-center">Unit. c/IVA</th><th className="w-[17%] border-l border-slate-100 px-2 py-3 text-center">Total c/IVA</th><th className="w-[5%] px-2 py-3" /></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                          <tr key={item.code} className={`h-[100px] align-middle ${item.pendingOrigins?.length && active.checkout.status !== "b2b-confirmed" ? "bg-amber-50 [&>td]:border-y-2 [&>td]:border-amber-300 [&>td:first-child]:border-l-2 [&>td:last-child]:border-r-2" : ""}`}>
                            <td className="px-5 py-1 sm:px-6">
                              <div className="flex w-full min-w-0 items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white p-1.5 shadow-sm"><img src={item.image} alt="" className="max-h-full max-w-full object-contain" /></div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-bold uppercase text-slate-400">{item.code.slice(3, 6)}</p>
                                  <p title={item.title} className="mt-0.5 line-clamp-2 whitespace-normal break-words text-xs font-black leading-4 text-[#001f3f] [overflow-wrap:anywhere]">{item.title}</p>
                                  <p className="mt-0.5 text-[10px] text-slate-400">{item.code}</p>
                                  {!!item.pendingOrigins?.length && active.checkout.status !== "b2b-confirmed" && <span className="mt-0.5 inline-flex rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-900">Pendiente de procesar incluido</span>}
                                </div>
                              </div>
                            </td>
                            <td className="border-l border-slate-100 px-1 py-2 text-center">
                              <span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">Peso T.</span>
                              <span className="whitespace-nowrap text-xs font-black text-[#001f3f]" title={productByCode.get(item.code)?.weightEstimated ? "Peso estimado" : "Peso del producto"}>{weightByCode.get(item.code) == null ? "—" : formatWeight(weightByCode.get(item.code)! * item.quantity)}</span>
                            </td>
                            <td className="border-l border-slate-100 px-1 py-2 text-center">
                              <span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">Cant.</span>
                              <div className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-[#f7f8fa]">
                                <button type="button" onClick={() => setCartQuantity(item.code, item.quantity - 1)} aria-label={`Restar ${item.title}`} className="flex h-full w-6 items-center justify-center rounded-md bg-white shadow-sm hover:bg-slate-100"><Minus className="h-3 w-3" /></button>
                                <span className="min-w-6 text-xs font-black">{item.quantity}</span>
                                <button type="button" onClick={() => setCartQuantity(item.code, item.quantity + 1)} aria-label={`Sumar ${item.title}`} className="flex h-full w-6 items-center justify-center rounded-md bg-white shadow-sm hover:bg-slate-100"><Plus className="h-3 w-3" /></button>
                              </div>
                            </td>
                            <td className="border-l border-slate-100 px-2 py-2 text-center"><span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">Unit. c/IVA</span><span className="whitespace-nowrap text-xs font-black">{money(item.price)}</span></td>
                            <td className="border-l border-slate-100 px-2 py-2 text-center"><span className="mb-1 block text-[10px] font-black uppercase text-slate-400">Total c/IVA</span><span className="whitespace-nowrap text-base font-black">{money(item.price * item.quantity)}</span></td>
                            <td className="px-1 py-2 text-center"><button type="button" onClick={() => removeFromCart(item.code)} aria-label={`Quitar ${item.title}`} className="rounded p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                          </tr>
                        ))}
                        {shippingCost > 0 && (
                          <tr className="h-[100px] bg-emerald-50/50 align-middle">
                            <td className="px-5 py-2 sm:px-6">
                              <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-600 shadow-sm"><Truck className="h-7 w-7" /></div>
                                <div className="min-w-0"><p className="text-[10px] font-bold uppercase text-emerald-700">Servicio de envío</p><p className="mt-1 text-xs font-black leading-4 text-[#001f3f]">Envío dropshipping</p><p className="mt-1 text-[10px] text-slate-500">{[active.checkout.recipient.city, active.checkout.recipient.province, active.checkout.recipient.postalCode && `CP ${active.checkout.recipient.postalCode}`].filter(Boolean).join(", ") || "Destino por definir"} · costo estimado</p></div>
                              </div>
                            </td>
                            <td className="border-l border-slate-100 px-2 py-2 text-center text-xs text-slate-400">—</td>
                            <td className="border-l border-slate-100 px-2 py-2 text-center text-xs font-black">1</td>
                            <td className="border-l border-slate-100 px-2 py-2 text-center text-xs font-semibold">{money(shippingCost)}</td>
                            <td className="border-l border-slate-100 px-2 py-2 text-center text-sm font-black">{money(shippingCost)}</td>
                            <td className="px-2 py-2" />
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              {active.checkout.mode === "b2b" && active.checkout.status !== "b2b-confirmed" && pendingWithStock.length > 0 && (
                <section aria-label="Pendientes de procesar con stock" className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
                  <div className="border-b border-amber-100 bg-amber-50 px-5 py-4 sm:px-6">
                    <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#001f3f]"><Package className="h-4 w-4 text-amber-600" /> Pendientes de procesar con stock ({pendingWithStock.length})</h2>
                    <p className="mt-1 text-xs text-slate-600">No se enviarán hasta que los confirmes.</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {pendingWithStock.map(({ order, item }) => {
                      const key = `${order.id}_${item.sku}`;
                      const available = item.requestedQty - item.allocatedQty;
                      return <div key={key} className="grid gap-3 px-5 py-4 text-xs sm:px-6 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center md:gap-4">
                        <div className="min-w-0">
                          <p className="font-black text-[#001f3f]">{item.name}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{item.sku} · Pedido {order.id}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5" aria-label="Regiones con stock">
                          {Object.entries(item.stockRegional ?? {}).filter(([, level]) => level === "low" || level === "medium" || level === "high").map(([region, level]) => (
                            <span key={region} title={`Stock ${level === "high" ? "alto" : level === "medium" ? "medio" : "bajo"}`} className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${level === "high" ? "bg-emerald-100 text-emerald-800" : level === "medium" ? "bg-amber-100 text-amber-800" : "bg-orange-100 text-orange-800"}`}>{region}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 md:justify-end">
                          <span aria-label={`Cantidad a agregar de ${item.name}: ${available}`} className="inline-flex w-16 items-center justify-center rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-black text-[#001f3f]">{available}</span>
                          <span className="whitespace-nowrap text-slate-500">de {available} u. · {money(available * item.unitPriceARS)}</span>
                        </div>
                        <button type="button" onClick={() => addPendingItem(order.id, item)} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#006ad8] px-3 py-2 text-[10px] font-black uppercase text-white transition hover:bg-[#0053ac]"><ShoppingCart className="h-3.5 w-3.5" /> Agregar al carrito</button>
                      </div>;
                    })}
                  </div>
                </section>
              )}
            </div>

            {active.checkout.mode === "b2b" ? <aside className="rounded-[24px] bg-[#001f3f] p-6 text-white shadow-[0_20px_40px_rgba(0,31,63,0.14)] lg:sticky lg:top-28">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Resumen del pedido</h2>
                <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Eliminar pedido" className="text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><span className="text-[10px] font-bold uppercase text-slate-300">Subtotal</span><strong className="text-sm">{money(total)}</strong></div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><span className="text-[10px] font-bold uppercase text-slate-300">Peso total aprox.</span><strong className="text-sm">{weightLabel}</strong></div>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6"><span className="text-[10px] font-black uppercase tracking-wide text-slate-300">Total final</span><div className="text-right"><strong className="block text-xl font-black">{money(total)}</strong><span className="text-[9px] italic text-slate-400">IVA incluido (estimación)</span></div></div>
              {checkoutIssues.length > 0 && <div role="alert" className="mt-5 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-[11px] text-red-100"><p className="mb-2 font-black uppercase">Completá estos datos</p><ul className="list-inside list-disc space-y-1">{checkoutIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}
              <div className="mt-8 space-y-3">
                <button type="button" onClick={completeCheckout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10a351] px-4 py-4 text-xs font-black uppercase text-white transition hover:bg-emerald-600"><Check className="h-4 w-4" /> {active.checkout.status === "b2b-confirmed" ? "Pedido simulado" : "Confirmar pedido"}</button>
                {confirmDelete ? <div className="rounded-xl border border-red-400/40 p-3 text-center text-xs"><p>¿Eliminar este carrito y sus artículos?</p><div className="mt-3 flex justify-center gap-4"><button type="button" onClick={() => { deleteCart(active.id); setConfirmDelete(false); }} className="font-black text-red-300 hover:text-white">Eliminar</button><button type="button" onClick={() => setConfirmDelete(false)} className="font-black">Cancelar</button></div></div>
                  : <button type="button" onClick={() => setConfirmDelete(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff293d] px-4 py-4 text-xs font-black uppercase text-white transition hover:bg-red-600"><Trash2 className="h-4 w-4" /> Eliminar pedido</button>}
              </div>
              <p className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.35em] text-white/10">Intercap System</p>
            </aside> : <aside className="rounded-[24px] bg-[#001f3f] p-6 text-white shadow-[0_20px_40px_rgba(0,31,63,0.14)] lg:sticky lg:top-28">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Resumen del pedido</h2>
                <ClipboardList className="h-4 w-4 text-slate-500" />
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><span className="text-[10px] font-bold uppercase text-slate-300">Subtotal</span><strong className="text-sm">{money(total)}</strong></div>
                {shippingCost > 0 && <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><span className="text-[10px] font-bold uppercase text-slate-300">Envío dropshipping</span><strong className="text-sm">{money(shippingCost)}</strong></div>}
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><span className="text-[10px] font-bold uppercase text-slate-300">Peso total aprox.</span><strong className="text-sm">{weightLabel}</strong></div>
                <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><span className="text-[10px] font-bold uppercase text-slate-300">Markup</span><span className="flex items-center gap-1 text-sm font-bold"><input type="number" min="0" step="0.01" value={active.checkout.markupPercent} onChange={(event) => updateCheckout(active.id, { markupPercent: Math.max(0, Number(event.target.value) || 0) })} aria-label="Markup en porcentaje" className="w-20 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-right text-white outline-none focus:border-emerald-400" />%</span></label>
                {financials && <div className="flex items-center justify-between rounded-2xl border border-emerald-400/30 bg-emerald-900/30 px-4 py-3"><span className="text-[10px] font-bold uppercase text-emerald-200">Ganancia</span><strong className="text-sm text-emerald-300">{money(financials.markupAmount)}</strong></div>}
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6"><span className="text-[10px] font-black uppercase tracking-wide text-slate-300">Total final</span><strong className="text-xl font-black">{money(financials?.customerTotal ?? totalWithShipping)}</strong></div>
              <p className="mt-2 text-right text-[10px] italic text-slate-400">Productos, envío estimado y markup</p>

              {active.checkout.status !== "draft" && <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-[11px] leading-5 text-emerald-200">
                {active.checkout.status === "b2b-confirmed" && "Confirmación mayorista simulada. El carrito permanece guardado; no se envió un pedido real."}
                {active.checkout.status === "awaiting-payment" && "Checkout dropshipping preparado en esta simulación. No se generó un enlace de pago real."}
                {active.checkout.status === "paid" && "Pago simulado completado. No se procesó un cobro ni un despacho real."}
              </div>}
              {checkoutIssues.length > 0 && <div role="alert" className="mt-5 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-[11px] text-red-100"><p className="mb-2 font-black uppercase">Completá estos datos</p><ul className="list-inside list-disc space-y-1">{checkoutIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}

              <div className="mt-8 space-y-3">
                <button type="button" onClick={completeCheckout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10a351] px-4 py-4 text-xs font-black uppercase text-white transition hover:bg-emerald-600"><Check className="h-4 w-4" /> Preparar checkout dropshipping</button>
                {active.checkout.mode === "dropship" && active.checkout.status === "awaiting-payment" && <button type="button" onClick={() => setPaymentPreviewOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-[10px] font-bold uppercase text-emerald-200 hover:bg-white/10"><Link2 className="h-4 w-4" /> Ver vista previa de pago</button>}
                <p className="text-center text-[10px] leading-4 text-slate-400">Simulación local. No registra pedidos ni genera cobros reales.</p>
                {confirmClear ? (
                  <div className="rounded-xl border border-white/20 p-3 text-center text-xs"><p>¿Vaciar este carrito?</p><div className="mt-2 flex justify-center gap-4"><button type="button" onClick={() => { clearCart(); setConfirmClear(false); }} className="font-black text-red-300 hover:text-white">Vaciar</button><button type="button" onClick={() => setConfirmClear(false)} className="font-black">Cancelar</button></div></div>
                ) : (
                  <button type="button" onClick={() => setConfirmClear(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff293d] px-4 py-4 text-xs font-black uppercase text-white transition hover:bg-red-600"><Trash2 className="h-4 w-4" /> Vaciar carrito</button>
                )}
              </div>
              <div className="mt-8 border-t border-white/10 pt-5">
                {confirmDelete ? (
                  <div className="rounded-xl border border-red-400/40 p-3 text-center text-xs"><p>¿Eliminar este carrito y sus artículos?</p><div className="mt-3 flex justify-center gap-4"><button type="button" onClick={() => { deleteCart(active.id); setConfirmDelete(false); }} className="font-black text-red-300 hover:text-white">Eliminar</button><button type="button" onClick={() => setConfirmDelete(false)} className="font-black">Cancelar</button></div></div>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(true)} className="flex w-full items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase text-slate-400 hover:text-white"><X className="h-3.5 w-3.5" /> Eliminar este carrito</button>
                )}
              </div>
              <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.35em] text-white/10">Intercap System</p>
            </aside>}
          </div>
        )}

      </main>
      {paymentPreviewOpen && active && financials && <div role="presentation" className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setPaymentPreviewOpen(false); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="payment-preview-title" className="w-full max-w-md rounded-3xl bg-white p-6 text-[#001f3f] shadow-2xl">
          <div className="flex items-start justify-between gap-3"><div><span className="rounded bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-800">Simulación</span><h2 id="payment-preview-title" className="mt-3 text-xl font-black">Vista previa de pago</h2></div><button type="button" onClick={() => setPaymentPreviewOpen(false)} aria-label="Cerrar" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
          <p className="mt-2 text-sm text-slate-600">Pedido para <strong>{active.checkout.recipient.name}</strong>. Este importe sería el que abonaría el Consumidor Final.</p>
          <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm"><div className="flex justify-between gap-3"><span>Productos</span><strong>{money(financials.subtotal)}</strong></div><div className="flex justify-between gap-3"><span>Envío</span><strong>{money(financials.shippingCost)}</strong></div><div className="flex justify-between gap-3"><span>Markup ({active.checkout.markupPercent}%)</span><strong>{money(financials.markupAmount)}</strong></div><div className="flex justify-between gap-3 border-t border-slate-200 pt-3 text-base font-black"><span>Total a pagar</span><span>{money(financials.customerTotal)}</span></div></div>
          <p className="mt-4 text-xs leading-5 text-slate-500">El archivo de referencia utiliza un enlace ficticio. Esta vista no crea enlaces ni procesa pagos reales.</p>
          <button type="button" onClick={() => { updateCheckout(active.id, { status: "paid" }); setPaymentPreviewOpen(false); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase text-white hover:bg-emerald-700"><CreditCard className="h-4 w-4" /> Simular pago del Consumidor Final</button>
        </div>
      </div>}
      <Footer />
    </div>
  );
}
