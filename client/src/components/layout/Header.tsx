import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, Home, ChevronDown, LogOut, HelpCircle, User, Users, Settings, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import intercapLogo from "@assets/intercap-logo-blanco.png";
import { useCarts } from "@/lib/cart";
import { ClaimsModal } from "@/components/layout/ClaimsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { label: "CATÁLOGO", href: "/catalogo", hasDropdown: true },
  { label: "CARRITO", href: "/carrito" },
  { label: "PEDIDOS Y SEGUIMIENTO", href: "/pedidos" },
  { label: "CUENTA CORRIENTE", href: "/cuenta-corriente" },
  { label: "COBRÁ CON INPAY", href: "/inpay" },
  { label: "RECLAMOS", href: "/reclamos" },
];

type HeaderProps = {
  mode?: "client" | "admin" | "seller";
};

export function Header({ mode }: HeaderProps) {
  const { carts, activeId } = useCarts();
  const activeCart = carts.find((cart) => cart.id === activeId);
  const cartCount = activeCart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const cartTotal = activeCart?.items.reduce((total, item) => total + item.price * item.quantity, 0) ?? 0;
  const formattedCartTotal = new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(cartTotal);
  const [location, navigate] = useLocation();
  const [storedMode, setStoredMode] = useState<"client" | "admin" | "seller">("client");
  const [claimsOpen, setClaimsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const effectiveMode = mode ?? storedMode;
  const isAdmin = effectiveMode === "admin";
  const isSeller = effectiveMode === "seller";
  const homeHref = isAdmin ? "/admin" : "/home";
  const isManagementUser = isAdmin || isSeller;
  const AvatarMenuIcon = isManagementUser ? Settings : User;
  const avatarMenuLabel = isAdmin ? "Panel" : isManagementUser ? "Panel de Gestión" : "Mis Datos";
  const managementPanelHref = isAdmin ? "/admin/ventas-especiales" : "/vendedor";

  useEffect(() => {
    const sessionMode = window.localStorage.getItem("intercap-user-mode");

    if (sessionMode === "admin" || sessionMode === "seller" || sessionMode === "client") {
      setStoredMode(sessionMode);
    }
  }, []);

  useEffect(() => {
    if (mode) {
      window.localStorage.setItem("intercap-user-mode", mode);
      setStoredMode(mode);
    }
  }, [mode]);

  const handleLogout = () => {
    window.localStorage.removeItem("intercap-user-mode");
    navigate("/");
  };

  return (
    <div className="flex flex-col w-full fixed top-0 z-50 shadow-lg">

      {/* ── ROW 1 ── */}
      <header className="bg-intercap-blue-dark h-14 border-b border-white/5">
        <div className="mx-auto px-6 h-full flex w-full items-center gap-3 max-w-[1500px]">

          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 shrink-0 text-white no-underline mr-2">
            <img src={intercapLogo} alt="Intercap" className="h-7 w-auto" />
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Input
                type="search"
                placeholder="¿Qué estás buscando?"
                className="h-9 rounded-full bg-white text-slate-800 border-white pl-4 pr-10 placeholder:text-slate-400 w-full focus-visible:ring-1 focus-visible:ring-intercap-blue-main text-[12px] font-medium"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Cart total */}
          {!isAdmin && <Link href="/carrito" aria-label={`Ver ${activeCart?.name || "Mi carrito"}, ${cartCount} unidades, total ${formattedCartTotal}`} className="hidden md:flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 rounded-lg px-3 h-9 text-white transition-colors relative">
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">{cartCount > 99 ? "99+" : cartCount}</span>}
            </div>
            <span className="max-w-28 truncate bg-intercap-blue-main text-white text-[9px] font-black rounded-md px-2 h-[18px] flex items-center justify-center tracking-tight ml-0.5" title={activeCart?.name || "Mi carrito"}>
              {activeCart?.name || "Mi carrito"}
            </span>
            <span className="whitespace-nowrap text-[12px] font-semibold tabular-nums">{formattedCartTotal}</span>
          </Link>}

          {/* Brand name */}
          <span className="hidden lg:block text-white font-black text-[13px] tracking-widest uppercase ml-2">
            {isAdmin ? "ADMIN" : isSeller ? "VENDEDOR" : "MOTOINP"}
          </span>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menu de usuario"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white text-intercap-blue-dark shadow-sm transition hover:bg-slate-100 md:flex"
              >
                <User className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-lg border-slate-200 p-2 shadow-xl">
              {isAdmin && <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer font-semibold"><User className="h-4 w-4" /> Mi perfil</DropdownMenuItem>}
              <DropdownMenuItem
                onClick={() => {
                  if (isManagementUser) {
                    navigate(managementPanelHref);
                  }
                }}
                className="cursor-pointer font-semibold"
              >
                <AvatarMenuIcon className="h-4 w-4" />
                {avatarMenuLabel}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer font-black text-green-600 focus:bg-green-50 focus:text-green-700"
              >
                <LogOut className="h-4 w-4" />
                SALIR
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {!isAdmin && <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Abrir notificaciones"
                className="relative order-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/15 md:order-none"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black leading-none text-white ring-2 ring-intercap-blue-dark">
                  3
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-[288px] overflow-hidden rounded-[10px] border border-red-200 bg-white p-0 shadow-xl"
            >
              <div className="bg-red-50 px-4 pb-4 pt-3">
                <p className="text-[11px] font-black uppercase text-red-600">
                  SALDO VENCIDO
                </p>
                <p className="mt-2 text-[14px] font-black leading-5 text-slate-950">
                  Tenes <span className="text-red-600">8</span> documentos pendientes de pago
                </p>
              </div>
              <div className="border-t border-red-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Monto vencido</span>
                  <span className="text-sm font-black text-red-600">$ 4.531.101,48</span>
                </div>
                <button
                  type="button"
                  className="mt-3 h-8 w-full rounded-lg bg-red-600 text-[11px] font-black uppercase text-white transition hover:bg-red-700"
                >
                  Ver cuenta corriente
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>}

          {/* Ayuda */}
          <Link
            href="/info/ayuda-rapida"
            className={`hidden lg:flex items-center gap-1.5 text-[11px] font-bold transition-colors ${
              location === "/info/ayuda-rapida" ? "text-white" : "text-white/80 hover:text-white"
            }`}
            aria-current={location === "/info/ayuda-rapida" ? "page" : undefined}
          >
            AYUDA
            <HelpCircle className="w-3.5 h-3.5" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menu de usuario"
                className="order-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white text-intercap-blue-dark shadow-sm transition hover:bg-slate-100 md:hidden"
              >
                <User className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-lg border-slate-200 p-2 shadow-xl">
              {isAdmin && <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer font-semibold"><User className="h-4 w-4" /> Mi perfil</DropdownMenuItem>}
              <DropdownMenuItem
                onClick={() => {
                  if (isManagementUser) {
                    navigate(managementPanelHref);
                  }
                }}
                className="cursor-pointer font-semibold"
              >
                <AvatarMenuIcon className="h-4 w-4" />
                {avatarMenuLabel}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer font-black text-green-600 focus:bg-green-50 focus:text-green-700"
              >
                <LogOut className="h-4 w-4" />
                SALIR
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="order-3 ml-1 text-white lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-intercap-blue-dark text-white border-r border-white/10">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href={homeHref} onClick={() => setMobileMenuOpen(false)} className="text-base font-bold">Home</Link>
                {isAdmin && <Link href="/admin/ventas-especiales" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold">Ventas especiales</Link>}
                {NAV_LINKS.map((link) => link.href === "/reclamos" ? (
                  <button key={link.href} type="button" onClick={() => { setMobileMenuOpen(false); setClaimsOpen(true); }} className="text-left text-base font-bold">{link.label}</button>
                ) : (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-base font-bold">{link.label}</Link>
                ))}
                <Link
                  href="/info/ayuda-rapida"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-base font-bold"
                  aria-current={location === "/info/ayuda-rapida" ? "page" : undefined}
                >
                  <HelpCircle className="h-4 w-4" />
                  AYUDA
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── ROW 2: Main nav + cotización ── */}
      <nav className="hidden lg:flex bg-[#0d1730] border-b border-white/5 h-10 items-center justify-center">
        <div className="w-full max-w-[1500px] mx-auto px-6 flex items-center h-full">
        {/* Nav links — left */}
        <div className="flex items-center gap-1 flex-1">
          <Link
            href={homeHref}
            aria-label="Home"
            title="Home"
            aria-current={location === homeHref ? "page" : undefined}
            className={`flex h-10 w-10 shrink-0 items-center justify-center transition-colors hover:text-intercap-blue-main
              ${location === homeHref ? "text-intercap-blue-main" : "text-white/80"}`}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
          </Link>
          {NAV_LINKS.map((link) => link.href === "/reclamos" ? (
            <button key={link.href} type="button" onClick={() => setClaimsOpen(true)} className="flex h-10 items-center px-4 text-[11px] font-bold uppercase tracking-wide text-white/80 transition-colors hover:text-intercap-blue-main">{link.label}</button>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase px-4 h-10 hover:text-intercap-blue-main transition-colors
                ${location === link.href ? "text-intercap-blue-main" : "text-white/80"}`}
            >
              {link.label}
              {link.hasDropdown && <ChevronDown className="w-3 h-3 opacity-60" />}
            </Link>
          ))}
        </div>

        {/* Cotización — right */}
        {(isSeller || isAdmin) && (
          <button className="mr-3 hidden h-8 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-[11px] font-black uppercase text-white/70 lg:flex">
            <Users className="h-3.5 w-3.5" />
            Seleccionar Clientes
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
        )}
        <span className="text-white/50 text-[11px] font-semibold whitespace-nowrap">
          {isAdmin || isSeller ? "COTIZACIÓN USD $ 1.430,00" : "COTIZACIÓN USD $ 1490,00"}
        </span>
        </div>
      </nav>

      {claimsOpen && <ClaimsModal onClose={() => setClaimsOpen(false)} />}
      {profileOpen && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false); }}><section role="dialog" aria-modal="true" aria-label="Mi perfil" className="w-full max-w-sm rounded-2xl bg-white p-6 text-[#001f3f] shadow-2xl"><div className="flex items-start justify-between"><h2 className="text-lg font-black">Mi perfil</h2><button type="button" onClick={() => setProfileOpen(false)} aria-label="Cerrar" className="rounded p-1 text-slate-500 hover:bg-slate-100">×</button></div><p className="mt-4 text-sm">Usuario: <strong>ADMIN</strong></p><p className="mt-1 text-sm text-slate-500">Rol: Administrador</p></section></div>}

    </div>
  );
}
