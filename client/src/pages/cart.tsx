import { useState } from "react";
import { Link } from "wouter";
import { CalendarDays, Check, ClipboardList, CreditCard, FileText, Link2, MapPin, Minus, Package, Plus, ShoppingCart, Tag, Trash2, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { clearCart, createCart, deleteCart, removeFromCart, selectCart, setCartQuantity, updateCart, updateCheckout, useCarts, WHOLESALE_ADDRESSES } from "@/lib/cart";
import { calculateCheckout, checkoutErrors, shippingEstimate, SIMULATED_GATEWAY_RATE } from "@/lib/checkout";
import { CheckoutModeSelector, DropshipCheckoutForm, DropshipPriceSection } from "@/components/cart/CheckoutOptions";

const money = (value: number) => new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(value);

export default function Cart() {
  const { carts, activeId } = useCarts();
  const active = carts.find((cart) => cart.id === activeId);
  const items = active?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  const financials = active ? calculateCheckout(active) : null;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [checkoutAttempted, setCheckoutAttempted] = useState(false);
  const [paymentPreviewOpen, setPaymentPreviewOpen] = useState(false);
  const checkoutIssues = checkoutAttempted && active ? checkoutErrors(active) : [];

  const switchCart = (id: string) => {
    selectCart(id);
    setConfirmDelete(false);
    setConfirmClear(false);
    setCheckoutAttempted(false);
    setPaymentPreviewOpen(false);
  };

  const startCheckout = () => {
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

              {active.checkout.mode === "dropship" && <><DropshipCheckoutForm cart={active} /><DropshipPriceSection cart={active} /></>}

              <section aria-label="Artículos del carrito" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                  <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide"><Package className="h-4 w-4" /> Artículos ({items.length})</h2>
                  <Link href="/catalogo" className="rounded-lg bg-[#001f3f] px-3 py-2 text-[10px] font-black uppercase text-white transition hover:bg-[#006ad8]">+ Agregar artículos</Link>
                </div>
                {items.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-4 text-sm font-bold">Este carrito está vacío</p>
                    <p className="mt-1 text-xs text-slate-500">Elegí productos del catálogo para el carrito activo.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] table-fixed text-left">
                      <thead className="border-b border-slate-200 bg-white text-[10px] font-bold uppercase text-slate-500">
                        <tr><th className="w-[43%] px-5 py-3 sm:px-6">Producto</th><th className="w-[16%] px-2 py-3 text-center">Cant.</th><th className="w-[18%] px-2 py-3 text-right">Unit. c/IVA</th><th className="w-[18%] px-2 py-3 text-right">Total c/IVA</th><th className="w-[5%] px-2 py-3" /></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                          <tr key={item.code} className="align-middle">
                            <td className="px-5 py-5 sm:px-6">
                              <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white p-1.5 shadow-sm"><img src={item.image} alt="" className="max-h-full max-w-full object-contain" /></div>
                                <div className="min-w-0"><p className="text-[10px] font-bold uppercase text-slate-400">{item.brand}</p><p className="mt-1 text-xs font-black leading-4 text-[#001f3f]">{item.title}</p><p className="mt-1 text-[10px] text-slate-400">{item.code}</p></div>
                              </div>
                            </td>
                            <td className="px-2 py-5 text-center">
                              <div className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-[#f7f8fa]">
                                <button type="button" onClick={() => setCartQuantity(item.code, item.quantity - 1)} aria-label={`Restar ${item.title}`} className="flex h-full w-8 items-center justify-center hover:bg-slate-200"><Minus className="h-3 w-3" /></button>
                                <span className="min-w-7 text-xs font-black">{item.quantity}</span>
                                <button type="button" onClick={() => setCartQuantity(item.code, item.quantity + 1)} aria-label={`Sumar ${item.title}`} className="flex h-full w-8 items-center justify-center hover:bg-slate-200"><Plus className="h-3 w-3" /></button>
                              </div>
                            </td>
                            <td className="px-2 py-5 text-right text-xs font-semibold">{money(item.price)}</td>
                            <td className="px-2 py-5 text-right text-sm font-black">{money(item.price * item.quantity)}</td>
                            <td className="px-2 py-5 text-center"><button type="button" onClick={() => removeFromCart(item.code)} aria-label={`Quitar ${item.title}`} className="rounded p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            {active.checkout.mode === "b2b" ? <aside className="rounded-[24px] bg-[#001f3f] p-6 text-white shadow-[0_20px_40px_rgba(0,31,63,0.14)] lg:sticky lg:top-28">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Resumen del pedido</h2>
                <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Eliminar pedido" className="text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><span className="text-[10px] font-bold uppercase text-slate-300">Subtotal</span><strong className="text-sm">{money(total)}</strong></div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><span className="text-[10px] font-bold uppercase text-slate-300">Peso total</span><strong className="text-sm" title="El catálogo no incluye el peso unitario de los artículos">Sin datos</strong></div>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6"><span className="text-[10px] font-black uppercase tracking-wide text-slate-300">Total final</span><div className="text-right"><strong className="block text-xl font-black">{money(total)}</strong><span className="text-[9px] italic text-slate-400">IVA incluido (estimación)</span></div></div>
              {checkoutIssues.length > 0 && <div role="alert" className="mt-5 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-[11px] text-red-100"><p className="mb-2 font-black uppercase">Completá estos datos</p><ul className="list-inside list-disc space-y-1">{checkoutIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}
              <div className="mt-8 space-y-3">
                <button type="button" onClick={startCheckout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10a351] px-4 py-4 text-xs font-black uppercase text-white transition hover:bg-emerald-600"><Check className="h-4 w-4" /> {active.checkout.status === "b2b-confirmed" ? "Pedido simulado" : "Confirmar pedido"}</button>
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
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><span className="text-[10px] font-bold uppercase text-slate-300">Unidades</span><strong className="text-sm">{units}</strong></div>
                {active.checkout.mode === "dropship" && financials && <div className="space-y-1.5 rounded-2xl border border-emerald-400/30 bg-emerald-900/30 px-4 py-3 text-[11px]"><div className="flex justify-between gap-3"><span className="text-emerald-200">Cobro al Consumidor Final</span><strong>{money(financials.customerTotal)}</strong></div><div className="flex justify-between gap-3 text-slate-300"><span>− Productos</span><span>{money(financials.subtotal)}</span></div><div className="flex justify-between gap-3 text-slate-300"><span>− Envío a tu cargo</span><span>{money(financials.sellerShipping)}</span></div><div className="flex justify-between gap-3 text-slate-300"><span>− Comisión simulada ({SIMULATED_GATEWAY_RATE * 100}%)</span><span>{money(financials.gatewayFee)}</span></div><div className="flex justify-between gap-3 border-t border-white/10 pt-1.5"><span className="text-emerald-200">Resultado estimado</span><strong className={financials.margin >= 0 ? "text-emerald-300" : "text-red-300"}>{money(financials.margin)}</strong></div></div>}
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6"><span className="text-[10px] font-black uppercase tracking-wide text-slate-300">Total final</span><strong className="text-xl font-black">{money(total)}</strong></div>
              <p className="mt-2 text-right text-[10px] italic text-slate-400">Costo de productos según catálogo</p>

              {active.checkout.status !== "draft" && <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-[11px] leading-5 text-emerald-200">
                {active.checkout.status === "b2b-confirmed" && "Confirmación mayorista simulada. El carrito permanece guardado; no se envió un pedido real."}
                {active.checkout.status === "awaiting-payment" && "Checkout dropshipping preparado en esta simulación. No se generó un enlace de pago real."}
                {active.checkout.status === "paid" && "Pago simulado completado. No se procesó un cobro ni un despacho real."}
              </div>}
              {checkoutIssues.length > 0 && <div role="alert" className="mt-5 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-[11px] text-red-100"><p className="mb-2 font-black uppercase">Completá estos datos</p><ul className="list-inside list-disc space-y-1">{checkoutIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}

              <div className="mt-8 space-y-3">
                <button type="button" onClick={startCheckout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10a351] px-4 py-4 text-xs font-black uppercase text-white transition hover:bg-emerald-600"><Check className="h-4 w-4" /> Preparar checkout dropshipping</button>
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
          <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm"><div className="flex justify-between gap-3"><span>Productos</span><strong>{money(active.checkout.salePrice)}</strong></div><div className="flex justify-between gap-3"><span>Envío a cargo del Consumidor Final</span><strong>{money(active.checkout.buyerPaysShipping ? shippingEstimate(active) : 0)}</strong></div><div className="flex justify-between gap-3 border-t border-slate-200 pt-3 text-base font-black"><span>Total a pagar</span><span>{money(financials.customerTotal)}</span></div></div>
          <p className="mt-4 text-xs leading-5 text-slate-500">El archivo de referencia utiliza un enlace ficticio. Esta vista no crea enlaces ni procesa pagos reales.</p>
          <button type="button" onClick={() => { updateCheckout(active.id, { status: "paid" }); setPaymentPreviewOpen(false); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase text-white hover:bg-emerald-700"><CreditCard className="h-4 w-4" /> Simular pago del Consumidor Final</button>
        </div>
      </div>}
      <Footer />
    </div>
  );
}
