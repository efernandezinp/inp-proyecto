import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminParametersTabs } from "@/components/admin/AdminParametersTabs";
import defaultTemplate from "@/data/notificaciones-template.html?raw";

type Settings = {
  whatsappUrl: string;
  accountName: string;
  user: string;
  port: string;
  startTls: string;
  authorization: string;
  host: string;
  smtpType: "smtp" | "secure";
  fromAddress: string;
  fromName: string;
  consultationRecipients: string;
  specialSaleRecipients: string;
  testRecipient: string;
  template: string;
};

const storageKey = "intercap-admin-parametros-notificaciones";

const defaults: Settings = {
  whatsappUrl: "https://api.whatsapp.com/send?phone=5493482440801",
  accountName: "Tienda Virtual Intercap S.R.L.",
  user: "ebiz@intercap.com.ar",
  port: "25",
  startTls: "false",
  authorization: "true",
  host: "192.168.0.210",
  smtpType: "smtp",
  fromAddress: "info@intercap.com.ar",
  fromName: "EBIZ - Intercap S.R.L.",
  consultationRecipients: "ebiz@intercap.com.ar",
  specialSaleRecipients: "ebiz@intercap.com.ar;fsager@intercap.com.ar",
  testRecipient: "agimenez@intercap.com.ar",
  template: defaultTemplate,
};

function readSettings(): Settings {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}

const fieldClass = "mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold normal-case tracking-normal text-[#001f3f] shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

function Field({ label, hint, value, onChange, type = "text" }: { label: string; hint?: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block min-w-0 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{label}{hint && <span className="ml-2 font-medium normal-case tracking-normal text-slate-400">{hint}</span>}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass} /></label>;
}

export default function AdminParametersNotifications() {
  const [settings, setSettings] = useState<Settings>(readSettings);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(settings));
      setPassword("");
      setMessage("Guardado en este navegador. La contraseña SMTP requiere conexión al servidor.");
    } catch {
      setMessage("No se pudo guardar en este navegador");
    }
  }

  return <div className="min-h-screen bg-[#f1f3f5] pt-24 text-[#001f3f]">
    <Header mode="admin" />
    <main className="flex min-h-[calc(100vh-96px)]">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Administración</p><h1 className="mt-2 text-2xl font-black">Parámetros · Notificaciones</h1></div>
        <div className="px-4 pb-10 pt-5 sm:px-6">
          <div className="mb-5 text-[11px]"><span className="text-blue-600">Administración</span><span className="mx-1 text-slate-300">/</span><span className="text-blue-600">Parámetros</span><span className="mx-1 text-slate-300">/</span><strong>NOTIFICACIONES</strong></div>
          <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <AdminParametersTabs />
            <p className="mb-6 text-xs font-semibold text-slate-600">WhatsApp, SMTP, destinos y plantilla de notificaciones. La prueba HTML usa el mail configurado en <strong>recepción modo prueba</strong>.</p>

            <section className="mb-7 rounded-xl border border-slate-100 bg-slate-50/80 p-4"><h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-teal-600">WhatsApp</h2><div className="max-w-xl"><Field label="URL de mensajes" value={settings.whatsappUrl} onChange={(value) => update("whatsappUrl", value)} /></div></section>

            <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Cuenta SMTP</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre de la cuenta" value={settings.accountName} onChange={(value) => update("accountName", value)} />
              <Field label="Usuario" value={settings.user} onChange={(value) => update("user", value)} />
              <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Password (solo si cambia)<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className={fieldClass} /></label>
              <Field label="Puerto" value={settings.port} onChange={(value) => update("port", value)} />
              <Field label="StartTLS (true/false o s/n)" value={settings.startTls} onChange={(value) => update("startTls", value)} />
              <Field label="Autorización SMTP" value={settings.authorization} onChange={(value) => update("authorization", value)} />
              <Field label="Host SMTP" value={settings.host} onChange={(value) => update("host", value)} />
              <div className="hidden md:block" />
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 md:col-span-2"><p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Tipo SMTP</p><div className="mt-2 flex gap-2"><button type="button" aria-pressed={settings.smtpType === "smtp"} onClick={() => update("smtpType", "smtp")} className={`rounded-lg border px-4 py-2 text-[10px] font-black uppercase ${settings.smtpType === "smtp" ? "border-[#001f3f] bg-[#001f3f] text-white" : "border-slate-200 bg-white"}`}>SMTP</button><button type="button" aria-pressed={settings.smtpType === "secure"} onClick={() => update("smtpType", "secure")} className={`rounded-lg border px-4 py-2 text-[10px] font-black uppercase ${settings.smtpType === "secure" ? "border-[#001f3f] bg-[#001f3f] text-white" : "border-slate-200 bg-white"}`}>SMTP seguro</button></div></div>
              <Field label="Dirección de envío (from)" value={settings.fromAddress} onChange={(value) => update("fromAddress", value)} />
              <Field label="Nombre de envío (from)" value={settings.fromName} onChange={(value) => update("fromName", value)} />
            </div>
            <button type="button" onClick={() => setMessage("El envío de prueba requiere conexión al servidor de correo; no se envió ningún mensaje.")} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-[11px] font-black uppercase text-white"><Mail className="h-4 w-4" /> Envío prueba HTML</button>

            <div className="my-7 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950"><strong>Atención:</strong> varias direcciones de correo separadas con <strong>;</strong></div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="E-mail recepción notificaciones de consulta" value={settings.consultationRecipients} onChange={(value) => update("consultationRecipients", value)} />
              <Field label="E-mail recepción notificaciones V. Esp." value={settings.specialSaleRecipients} onChange={(value) => update("specialSaleRecipients", value)} />
              <Field label="E-mail recepción notificaciones modo prueba" hint="Destino del botón de prueba" value={settings.testRecipient} onChange={(value) => update("testRecipient", value)} />
            </div>

            <label htmlFor="notifications-template" className="mb-2 mt-7 block text-sm font-black">Plantilla envío notificaciones</label>
            <textarea id="notifications-template" value={settings.template} onChange={(event) => update("template", event.target.value)} spellCheck={false} className="h-[300px] w-full resize-y rounded-xl border border-slate-200 bg-white p-3 font-mono text-[12px] leading-[1.55] text-[#001f3f] shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-100 pt-4"><span role="status" className="text-xs font-semibold text-teal-700">{message}</span><button type="submit" className="rounded-xl bg-teal-600 px-6 py-3 text-[11px] font-black uppercase text-white shadow-sm hover:bg-teal-500">Guardar</button></div>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
