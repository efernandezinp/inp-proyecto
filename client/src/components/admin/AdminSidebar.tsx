import { BookOpen, CreditCard, Grid2X2, Mail, Settings, ShoppingCart, SlidersHorizontal, WalletCards } from "lucide-react";
import { Link, useLocation } from "wouter";

const groups = [
  { title: "Compras", links: [{ label: "Catálogo", href: "/catalogo", icon: BookOpen }, { label: "Carritos", href: "/carrito", icon: ShoppingCart }] },
  { title: "Cuenta", links: [{ label: "Cuenta corriente", href: "/cuenta-corriente", icon: WalletCards }, { label: "Cobrá con INPAY", href: "/inpay", icon: CreditCard }] },
  { title: "Admin", links: [{ label: "Parámetros", href: "/admin/parametros/general", icon: Settings }, { label: "Ventas especiales", href: "/admin/ventas-especiales", icon: SlidersHorizontal }, { label: "Correos no enviados", href: "", icon: Mail }] },
];

export function AdminSidebar() {
  const [location] = useLocation();
  return <aside className="hidden w-60 shrink-0 bg-[#001f3f] text-white lg:block">
    <div className="border-b border-white/10 px-4 py-5 text-lg font-black italic">PANEL</div>
    <nav className="p-3" aria-label="Panel administrativo">
      <Link href="/admin" className={`mb-4 flex h-10 items-center gap-3 rounded-lg px-3 text-[11px] font-black uppercase ${location === "/admin" ? "bg-teal-600" : "hover:bg-white/10"}`}><Grid2X2 className="h-4 w-4" /> Todos los módulos</Link>
      {groups.map((group) => <section key={group.title} className="border-t border-white/10 py-4">
        <h2 className="mb-2 flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-300">{group.title}<span className="rounded-full bg-blue-800 px-1.5 py-0.5 text-[9px]">{group.links.length}</span></h2>
        <div className="space-y-1">{group.links.map(({ label, href, icon: Icon }) => href ?
          <Link key={label} href={href} aria-current={location === href || (label === "Parámetros" && location.startsWith("/admin/parametros")) ? "page" : undefined} className={`flex h-9 items-center gap-3 rounded-lg px-3 text-[11px] font-black uppercase transition ${location === href || (label === "Parámetros" && location.startsWith("/admin/parametros")) ? "bg-teal-600 text-white" : "text-white/85 hover:bg-white/10"}`}><Icon className="h-4 w-4 text-sky-300" />{label}</Link> :
          <span key={label} className="flex h-9 items-center gap-3 px-3 text-[11px] font-black uppercase text-white/35"><Icon className="h-4 w-4" />{label}</span>)}</div>
      </section>)}
    </nav>
  </aside>;
}
