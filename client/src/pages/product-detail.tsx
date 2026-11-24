import { useState } from "react";
import { Link, useRoute } from "wouter";
import { Check, ChevronLeft, ShoppingCart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { addToCart } from "@/lib/cart";
import { PRODUCTS, type Product } from "@/lib/products";

const jacketCodes = ["018007130001", "018007130002", "018007130003", "018007130019", "018007130023"];
const money = (n: number) => "$ " + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const titleOf = (p: Product) => p.title.replace(/\u00a0/g, " ").replace(/Â/g, "");

function Attributes({ rows }: { rows: [string, string][] }) {
  return <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{rows.map(([label, value]) =>
    <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-2 text-xs leading-5">
      <span className="text-slate-500">{label}:</span><span className="font-medium text-slate-800">{value}</span>
    </div>)}</div>;
}

function ProductPage({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const [applicationSearch, setApplicationSearch] = useState("");
  const [imageError, setImageError] = useState(false);
  const title = titleOf(product);
  const jacket = jacketCodes.includes(product.code);
  const concept = title.includes("CONCEPT");
  const size = title.match(/TALLE\s+(.+)$/)?.[1] ?? "";
  const image = product.code === "018007130003" ? "/images/radikal-concept-negro-l.jpg" : product.image;
  const attrs: [string, string][] = jacket ? [
    ["MARCA", "RADIKAL"], ["TALLE", size], ["COLOR", concept ? "NEGRO" : "ROJO"],
    ["MODELO", concept ? "CONCEPT" : "RIDE"], ["PRODUCTO", "CAMPERA"], ["ORIGEN", concept ? "PAKISTAN" : product.origin ?? "Importado"]
  ] : [["MARCA", product.brand], ["TIPO", product.type ?? ""], ["SUBTIPO", product.subtype ?? ""]];
  if (concept) attrs.push(
    ["IMPERMEABILIDAD", "100% IMPERMEABLE"], ["COLUMNA DE AGUA (MM)", "10.000"],
    ["INTERIOR TÉRMICO", "REMOVIBLE"], ["MATERIAL", "CORDURA DE POLYESTER MAX-TEC 600-D"],
    ["MATERIAL EXTERNO", "100% POLIÉSTER"], ["GÉNERO", "MASCULINO/FEMENINO"],
    ["USO", "URBANO, TOURING"], ["TEMPORADA", "OTOÑO, INVIERNO, PRIMAVERA, VERANO"],
    ["REFLECTIVO", "MATERIAL REFLECTIVO FRONTAL Y POSTERIOR"], ["VENTILACIÓN", "SI"]
  );
  if (product.code === "018007130003") attrs.push(
    ["ANCHO DE PECHO (CM)", "54"], ["LARGO DE ESPALDA (CM)", "72"],
    ["LARGO DE MANGA (CM)", "67"], ["LARGO FRONTAL (CM)", "63"],
    ["PUÑO DE MANGA (CM)", "13"], ["PROTECCIÓN CODOS", "REMOVIBLE, EN 1621-1:2012 NIVEL 1"],
    ["PROTECCIÓN ESPALDA", "REMOVIBLE, EN 1621-2:2014 NIVEL 2"],
    ["PROTECCIÓN HOMBROS", "REMOVIBLE, EN 1621-1:2012 NIVEL 1"],
    ["VELCROS", "CUELLO, PUÑOS, CADERA"]
  );
  const related = jacket ? PRODUCTS.filter(p => jacketCodes.includes(p.code) && p.code !== product.code) : [];

  return <div className="min-h-screen bg-[#f8f9fb] pt-28 text-slate-800">
    <Header />
    <main className="mx-auto max-w-[1550px] px-4 pb-10 sm:px-6">
      <nav aria-label="Ubicación" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/home" className="hover:text-blue-700">INICIO</Link><span>/</span>
        <Link href="/catalogo" className="hover:text-blue-700">{jacket ? "INDUMENTARIA" : "CATÁLOGO"}</Link>
        {jacket && <><span>/</span><span>CAMPERAS</span></>}<span>/</span><strong className="text-slate-800">{product.brand}</strong>
        <Link href="/catalogo" className="ml-auto inline-flex items-center gap-1 text-xs hover:text-blue-700"><ChevronLeft size={16} /> Volver</Link>
      </nav>
      <article className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[58%_42%]">
        <div className="flex min-h-[430px] gap-5 border-b border-slate-100 p-6 lg:min-h-[720px] lg:border-b-0 lg:border-r lg:p-8">
          <div className="shrink-0"><button type="button" aria-label="Ver imagen principal" className="flex h-16 w-16 items-center justify-center rounded-md border-2 border-blue-500 p-1"><img src={image} alt="Vista en miniatura" className="max-h-full object-contain" /></button></div>
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
            <div className="flex w-full max-w-[580px] flex-1 items-center justify-center rounded-xl border border-slate-100 bg-white p-5">
              {!imageError ? <img src={image} alt={title} onError={() => setImageError(true)} className="max-h-[575px] max-w-full object-contain" /> : <div className="text-center text-slate-400">Imagen no disponible</div>}
            </div>
            <span className="mt-4 text-[10px] font-bold tracking-[.23em] text-slate-400">E-BIZ INTERCAP</span>
          </div>
        </div>
        <div className="flex flex-col p-6 lg:p-8">
          <p className="text-[11px] font-black tracking-widest text-blue-700">{product.brand}</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900">{title}</h1>
          <span className="mt-5 text-xs text-slate-500">Cod:</span><strong className="mt-1 w-fit rounded-md bg-sky-100 px-2 py-1 text-sm">{product.code}</strong>
          <div className="mt-5 space-y-1 text-[11px] font-semibold text-slate-500">
            {product.code === "018007130003" ? <>
              <div className="w-fit rounded bg-slate-50 px-2 py-1">1° Envase Unidad 1 UNI 1,92 Kgs</div>
              <div className="w-fit rounded bg-slate-50 px-2 py-1">2° Envase Unidad 1 UNI 1,92 Kgs</div>
              <div className="w-fit rounded bg-slate-50 px-2 py-1">3° Envase Cajas 10 UNI 20,00 Kgs</div>
            </> : <div className="w-fit rounded bg-slate-50 px-2 py-1">1° Envase Caja 1 UNI</div>}
          </div>
          <div className="mt-5 flex items-center justify-end gap-2 text-[11px] font-bold text-slate-400">MONEDA: <div className="flex rounded-lg bg-slate-100 p-1"><button type="button" onClick={() => setCurrency("ARS")} className={`rounded px-3 py-1 ${currency === "ARS" ? "bg-[#001f3f] text-white" : "text-slate-500"}`}>ARS</button><button type="button" onClick={() => setCurrency("USD")} className={`rounded px-3 py-1 ${currency === "USD" ? "bg-[#001f3f] text-white" : "text-slate-500"}`}>USD</button></div></div>
          <div className="mt-4 border-t border-slate-100 pt-4"><p className="text-[10px] font-bold text-slate-400">PRECIO FINAL:</p><strong className="block text-3xl font-extrabold text-[#0756ae]">{currency === "ARS" ? money(product.price) : "Consultar cotización"}</strong><p className="mt-2 text-[10px] text-slate-400">IVA incluido. Precio sujeto a cambios.</p></div>
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 text-xs">
            <div className="grid grid-cols-[1fr_1fr_50px] bg-slate-50 px-3 py-2 font-bold text-slate-400"><span>ALMC.</span><span>NIVEL</span><span className="text-right">CANT.</span></div>
            {(["NOA", "NEA", "BUE", "CUYO"] as const).map(region => <div key={region} className="grid grid-cols-[1fr_1fr_50px] border-t border-slate-100 px-3 py-2 font-semibold text-slate-600"><span>{region}</span><span><i aria-hidden="true" className={`inline-block h-4 w-3 rounded-sm ${region === "BUE" ? "bg-emerald-500" : product.stock[region] ? "bg-amber-400" : "bg-rose-400"}`} /></span><span className="text-right">{region === "BUE" && product.stock.BUE > 0 ? <Check className="ml-auto h-4 w-4" /> : product.stock[region]}</span></div>)}
          </div>
          <div className="mt-auto flex gap-2 pt-6"><button type="button" onClick={() => addToCart(product, quantity)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0758b3] text-xs font-bold text-white shadow-sm hover:bg-blue-700"><ShoppingCart size={17} /> AGREGAR AL CARRITO</button><input type="number" min="1" value={quantity} onChange={e => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))} aria-label="Cantidad" className="h-11 w-16 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold" /></div>
        </div>
      </article>
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8"><h2 className="text-2xl font-bold text-slate-900">Descripción</h2><p className="mt-5 text-sm text-slate-600">{title}</p><p className="mt-5 text-sm text-slate-600">Este producto forma parte del catálogo técnico INTERCAP. Verifique compatibilidad por medida, uso y aplicación antes de realizar la compra.</p></section>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="border-b border-slate-600 pb-2 text-lg font-semibold">Aplicaciones por Motocicleta</h2><input value={applicationSearch} onChange={e => setApplicationSearch(e.target.value)} placeholder="Buscar por marca, modelo o cilindrada..." aria-label="Buscar aplicaciones" className="mt-4 h-11 w-full rounded-lg border border-slate-200 px-4 text-sm" /><div className="mt-4 flex min-h-20 items-center justify-center rounded-lg border border-slate-200 px-4 text-center text-sm text-slate-500">No hay aplicaciones cargadas para este producto.</div></section>
        <div className="space-y-6"><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 border-b border-slate-600 pb-2 text-lg font-semibold">Atributos</h2><Attributes rows={attrs} /></section><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 border-b border-slate-600 pb-2 text-lg font-semibold">Características</h2><Attributes rows={[["Tipo de producto", jacket ? "INDUMENTARIA" : product.type ?? "CATÁLOGO"], ["Sub-Tipo", jacket ? "CAMPERAS" : product.subtype ?? ""], ["Origen", product.origin ?? "Importado"], ["Marca", product.brand], ["Unidad", "UNI"]]} /></section></div>
      </div>
      {related.length > 0 && <section className="mt-8"><h2 className="mb-4 text-xl font-bold">Otras tallas y colores</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{related.map(item => <Link key={item.code} href={`/producto/${item.code}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-blue-500"><img src={item.image} alt="" className="h-16 w-16 object-contain" /><span className="text-xs font-semibold">{titleOf(item)}<small className="mt-1 block text-blue-700">{money(item.price)}</small></span></Link>)}</div></section>}
    </main><Footer />
  </div>;
}

export default function ProductDetail() {
  const [, route] = useRoute("/producto/:id");
  const product = PRODUCTS.find(item => item.code === route?.id || String(item.id) === route?.id);
  if (!product) return <div className="flex min-h-screen flex-col bg-slate-50 pt-28"><Header /><main className="mx-auto flex-1 px-4 py-16 text-center"><h1 className="text-2xl font-bold">Producto no encontrado</h1><Link href="/catalogo" className="mt-4 inline-block text-blue-700 hover:underline">Volver al catálogo</Link></main><Footer /></div>;
  return <ProductPage key={product.code} product={product} />;
}
