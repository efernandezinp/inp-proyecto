import { MessageCircle } from "lucide-react";
import { Router as WouterRouter, Switch, Route, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AdminHome from "@/pages/admin-home";
import AdminSpecialSales from "@/pages/admin-special-sales";
import AdminParametersGeneral from "@/pages/admin-parameters-general";
import AdminParametersBanners from "@/pages/admin-parameters-banners";
import AdminParametersClientRequest from "@/pages/admin-parameters-client-request";
import AdminParametersNotifications from "@/pages/admin-parameters-notifications";
import AdminParametersCarts from "@/pages/admin-parameters-carts";
import AdminParametersCatalog from "@/pages/admin-parameters-catalog";
import SellerHome from "@/pages/seller-home";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import QuickHelp from "@/pages/quick-help";
import Orders from "@/pages/orders";
import Cart from "@/pages/cart";
import Inpay from "@/pages/inpay";
import CurrentAccount from "@/pages/current-account";

function PaymentReportPage() { return <CurrentAccount initialReportOpen />; }
function CurrentAccountPage() { return <CurrentAccount />; }

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/admin/ventas-especiales" component={AdminSpecialSales} />
      <Route path="/admin/parametros/general" component={AdminParametersGeneral} />
      <Route path="/admin/parametros/banners" component={AdminParametersBanners} />
      <Route path="/admin/parametros/solicitud-cliente" component={AdminParametersClientRequest} />
      <Route path="/admin/parametros/notificaciones" component={AdminParametersNotifications} />
      <Route path="/admin/parametros/carritos" component={AdminParametersCarts} />
      <Route path="/admin/parametros/catalogo" component={AdminParametersCatalog} />
      <Route path="/admin/parametros" component={AdminParametersGeneral} />
      <Route path="/admin" component={AdminHome} />
      <Route path="/vendedor" component={SellerHome} />
      <Route path="/catalogo" component={Catalog} />
      <Route path="/producto/:id" component={ProductDetail} />
      <Route path="/info/ayuda-rapida/forma-parte" component={QuickHelp} />
      <Route path="/info/ayuda-rapida/sobre-nosotros" component={QuickHelp} />
      <Route path="/info/ayuda-rapida/sucursales" component={QuickHelp} />
      <Route path="/info/ayuda-rapida/bancos" component={QuickHelp} />
      <Route path="/info/ayuda-rapida/informacion-util" component={QuickHelp} />
      <Route path="/info/ayuda-rapida/solicitud-de-cliente" component={QuickHelp} />
      <Route path="/info/ayuda-rapida" component={QuickHelp} />
      <Route path="/pedidos" component={Orders} />
      <Route path="/carrito" component={Cart} />
      <Route path="/inpay" component={Inpay} />
      <Route path="/cuenta-corriente/informar-pago" component={PaymentReportPage} />
      <Route path="/cuenta-corriente" component={CurrentAccountPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function WhatsAppFloatButton() {
  const [location] = useLocation();
  const isCatalogView = location.startsWith("/catalogo");

  if (isCatalogView) return null;

  return (
    <a
      href="https://api.whatsapp.com/send?phone=5493482440801"
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 transition hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={2.6} />
    </a>
  );
}

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <TooltipProvider>
      <WouterRouter base={base}>
        <Router />
        <WhatsAppFloatButton />
      </WouterRouter>
    </TooltipProvider>
  );
}

export default App;
