import { Bell, DatabaseZap, FileText, Grid2X2, Images, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "wouter";

const tabs = [
  { label: "Conf. general", href: "/admin/parametros/general", icon: Grid2X2 },
  { label: "Banners", href: "/admin/parametros/banners", icon: Images },
  { label: "Solicitud de cliente", href: "/admin/parametros/solicitud-cliente", icon: FileText },
  { label: "Notificaciones", href: "/admin/parametros/notificaciones", icon: Bell },
  { label: "Carritos", href: "/admin/parametros/carritos", icon: ShoppingCart },
  { label: "Catálogo", href: "/admin/parametros/catalogo", icon: DatabaseZap },
];

export function AdminParametersTabs() {
  const [location] = useLocation();
  return <nav aria-label="Secciones de parámetros" className="mb-8 flex flex-wrap gap-1 border-b border-slate-200">
    {tabs.map(({ label, href, icon: Icon }) => {
      const active = location === href || (location === "/admin/parametros" && label === "Conf. general");
      const className = `flex items-center gap-2 border-b-2 px-3 py-3 text-[11px] font-black uppercase ${active ? "border-teal-500 text-[#001f3f]" : "border-transparent text-slate-400 hover:text-[#001f3f]"}`;
      const content = <><Icon className={`h-4 w-4 ${active ? "text-teal-600" : "text-slate-400"}`} />{label}</>;
      return href ? <Link key={label} href={href} aria-current={active ? "page" : undefined} className={className}>{content}</Link> : <span key={label} title="Se incorporará próximamente" className={`${className} cursor-default hover:text-slate-400`}>{content}</span>;
    })}
  </nav>;
}
