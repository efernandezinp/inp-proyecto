import { Building2, Send, ShieldCheck, UserRound } from "lucide-react";
import type { CheckoutMode, Recipient, SavedCart } from "@/lib/cart";
import { updateCheckout } from "@/lib/cart";

const inputClass = "mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const labelClass = "text-[10px] font-black uppercase tracking-wide text-slate-600";

function RecipientField({ cart, field, label, type = "text", placeholder = "", required = true, className = "" }: {
  cart: SavedCart; field: keyof Recipient; label: string; type?: string; placeholder?: string; required?: boolean; className?: string;
}) {
  return <label className={`block min-w-0 ${className}`}><span className={labelClass}>{label}{required && " *"}</span>
    <input type={type} value={cart.checkout.recipient[field]} onChange={(event) => updateCheckout(cart.id, { recipient: { [field]: event.target.value } })}
      placeholder={placeholder} required={required} className={inputClass} /></label>;
}

export function CheckoutModeSelector({ cart }: { cart: SavedCart }) {
  const mode = cart.checkout.mode;
  const options: { value: CheckoutMode; icon: typeof Building2; title: string; badge: string; description: string }[] = [
    { value: "b2b", icon: Building2, title: "Pedido Mayorista", badge: "A tu local", description: "Enviamos los productos a tu dirección de entrega habitual." },
    { value: "dropship", icon: Send, title: "Pedido dropshipping", badge: "Directo al Consumidor Final", description: "Preparamos el envío para tu Consumidor Final y calculás su precio de venta." },
  ];
  return <section aria-label="Modalidad de despacho" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="grid gap-2.5 md:grid-cols-2">
      {options.map((option) => {
        const Icon = option.icon;
        const selected = mode === option.value;
        return <label key={option.value} className={`flex cursor-pointer gap-2.5 rounded-xl border-2 p-3 transition ${selected ? option.value === "dropship" ? "border-emerald-500 bg-emerald-50/60" : "border-slate-500 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
          <input type="radio" name={`checkout-mode-${cart.id}`} checked={selected} onChange={() => updateCheckout(cart.id, { mode: option.value })} className="mt-1 accent-emerald-600" />
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2 text-xs font-black uppercase"><Icon className="h-4 w-4" />{option.title}</span><span className={`rounded px-2 py-0.5 text-[9px] font-bold ${option.value === "dropship" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>{option.badge}</span></div>
            <p className="mt-1 text-[11px] leading-4 text-slate-600">{option.description}</p></div>
        </label>;
      })}
    </div>
  </section>;
}

export function DropshipCheckoutForm({ cart }: { cart: SavedCart }) {
  return <section aria-label="Checkout dropshipping" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 p-4 shadow-sm">
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-emerald-100 pb-3">
      <div className="flex items-start gap-2"><div className="rounded-full bg-emerald-600 p-1.5 text-white"><UserRound className="h-4 w-4" /></div>
        <div><h2 className="text-xs font-black uppercase">Datos del Consumidor Final</h2><p className="mt-1 text-xs text-emerald-800">Completá los datos de la persona que recibirá el pedido.</p></div></div>
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-100 px-2.5 py-1.5 text-[10px] font-bold text-emerald-800"><ShieldCheck className="h-3.5 w-3.5" /> Datos para envío directo</span>
    </div>
    <div className="grid gap-x-2.5 gap-y-2 sm:grid-cols-2 lg:grid-cols-12">
      <RecipientField cart={cart} field="name" label="Nombre y apellido" placeholder="Nombre del Consumidor Final" className="sm:col-span-2 lg:col-span-5" />
      <RecipientField cart={cart} field="document" label="DNI / CUIT" className="lg:col-span-3" />
      <RecipientField cart={cart} field="phone" label="Teléfono / WhatsApp" type="tel" className="lg:col-span-4" />
      <RecipientField cart={cart} field="email" label="Correo electrónico" type="email" placeholder="consumidor@correo.com" className="sm:col-span-2 lg:col-span-5" />
      <RecipientField cart={cart} field="street" label="Calle" className="lg:col-span-4" />
      <RecipientField cart={cart} field="number" label="Número" className="lg:col-span-3" />
      <RecipientField cart={cart} field="apartment" label="Piso / departamento" required={false} className="lg:col-span-3" />
      <RecipientField cart={cart} field="city" label="Localidad" className="lg:col-span-4" />
      <RecipientField cart={cart} field="province" label="Provincia" className="lg:col-span-3" />
      <RecipientField cart={cart} field="postalCode" label="Código postal" className="lg:col-span-2" />
    </div>
  </section>;
}
