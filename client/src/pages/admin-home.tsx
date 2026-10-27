import {
  BookOpen,
  CreditCard,
  Grid2X2,
  Mail,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Link } from "wouter";

const modules = [
  {
    title: "Catalogo",
    text: "Explora productos, precios y stock disponible.",
    icon: BookOpen,
  },
  {
    title: "Carritos",
    text: "Gestiona carritos del cliente seleccionado.",
    icon: ShoppingCart,
    disabled: true,
    badge: "SELECCIONA CLIENTE",
  },
  {
    title: "Cuenta corriente",
    text: "Estado de cuenta del cliente seleccionado.",
    icon: WalletCards,
    disabled: true,
    badge: "SELECCIONA CLIENTE",
  },
  {
    title: "Cobra con INPay",
    text: "Simulador de ventas y coeficientes por terminal.",
    icon: CreditCard,
  },
  {
    title: "Panel admin",
    text: "Panel principal de administracion.",
    icon: Grid2X2,
  },
  {
    title: "Parametros",
    text: "Configuracion general de la tienda virtual.",
    icon: Settings,
  },
  {
    title: "Ventas especiales",
    text: "Administra estrategias y campanas especiales.",
    icon: SlidersHorizontal,
  },
  {
    title: "Correos no enviados",
    text: "Revision de correos pendientes de envio.",
    icon: Mail,
    disabled: true,
    badge: "PROXIMAMENTE",
  },
];

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-white pt-24 text-intercap-blue-dark">
      <Header mode="admin" />

      <main className="bg-[#f0f0f0]">
        <div className="flex w-full">
          <AdminSidebar />

          <section className="min-h-[720px] flex-1 px-5 py-6 md:px-8">
            <div className="bg-white px-6 py-6 shadow-sm">
              <p className="text-[12px] font-black uppercase tracking-[0.32em] text-teal-600">
                Panel de control
              </p>
              <h1 className="mt-2 text-3xl font-black">¡Bienvenido, ADMIN!</h1>
              <p className="mt-3 text-sm">
                Tipo: <strong>Administrador</strong>
                <span className="ml-6">
                  Operando para: <strong>Sin cliente seleccionado</strong>
                </span>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">
                Todos los modulos
              </h2>
              <span className="text-xs font-semibold text-slate-400">8 modulos</span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className={`relative min-h-36 border bg-white p-6 shadow-sm ${
                      item.disabled ? "opacity-45" : ""
                    }`}
                  >
                    {item.badge && (
                      <span className="absolute right-5 top-5 rounded bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-400">
                        {item.badge}
                      </span>
                    )}
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-intercap-blue-dark text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-base font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
                    {!item.disabled && ["Ventas especiales", "Catalogo", "Cobra con INPay", "Panel admin", "Parametros"].includes(item.title) && (
                      <Link href={item.title === "Ventas especiales" ? "/admin/ventas-especiales" : item.title === "Catalogo" ? "/catalogo" : item.title === "Cobra con INPay" ? "/inpay" : item.title === "Parametros" ? "/admin/parametros/general" : "/admin"} className="mt-4 inline-block text-xs font-black uppercase text-teal-600">
                        Abrir
                        <span className="ml-2">›</span>
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
