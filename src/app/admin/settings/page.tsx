"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_GLOBAL_SETTINGS } from "@/graphql/queries/get-global-settings";
import { UPDATE_GLOBAL_SETTINGS, SEND_WHATSAPP_TEST } from "@/graphql/mutations/global-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, Phone, Mail, MapPin, Clock, Instagram, Facebook, 
  ShieldAlert, ShieldCheck, UserCheck, Key, Lock, Loader2, Save,
  MessageSquare, Send, Bot, Sparkles, Smartphone, CheckCircle2,
  Radio, HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import AnnouncementsTab from "./announcements-tab";

export default function AdminSettingsPage() {
  const { data, loading, refetch } = useQuery<any>(GET_GLOBAL_SETTINGS);
  
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'WHATSAPP' | 'ROLES' | 'AVISOS'>('CONFIG');

  const [formData, setFormData] = useState({
    phoneNumber: "",
    emailContact: "",
    address: "",
    openingHoursWeekdays: "",
    openingHoursSaturdays: "",
    facebookUrl: "",
    instagramUrl: "",
    trialClassEmailTemplate: "",
    whatsappNumber: "",
    whatsappAssignedTo: "",
    evolutionApiUrl: "",
    evolutionApiKey: "",
    evolutionInstanceName: "",
    whatsappAutoReply: true,
    whatsappWelcomeTemplate: ""
  });

  // Test WhatsApp State
  const [testPhone, setTestPhone] = useState("+56 9 ");
  const [testMessage, setTestMessage] = useState("🎻 Mensaje de prueba desde el Panel de Administración de Détaché.");

  useEffect(() => {
    if (data?.globalSettings) {
      setFormData({
        phoneNumber: data.globalSettings.phoneNumber || "",
        emailContact: data.globalSettings.emailContact || "",
        address: data.globalSettings.address || "",
        openingHoursWeekdays: data.globalSettings.openingHoursWeekdays || "",
        openingHoursSaturdays: data.globalSettings.openingHoursSaturdays || "",
        facebookUrl: data.globalSettings.facebookUrl || "",
        instagramUrl: data.globalSettings.instagramUrl || "",
        trialClassEmailTemplate: data.globalSettings.trialClassEmailTemplate || "",
        whatsappNumber: data.globalSettings.whatsappNumber || "+56 9 6427 9239",
        whatsappAssignedTo: data.globalSettings.whatsappAssignedTo || "Recepción / Admisiones",
        evolutionApiUrl: data.globalSettings.evolutionApiUrl || "http://localhost:8080",
        evolutionApiKey: data.globalSettings.evolutionApiKey || "admin_apikey_123",
        evolutionInstanceName: data.globalSettings.evolutionInstanceName || "MainInstance",
        whatsappAutoReply: data.globalSettings.whatsappAutoReply ?? true,
        whatsappWelcomeTemplate: data.globalSettings.whatsappWelcomeTemplate || "¡Hola {nombre}! Gracias por contactar a Academia Détaché 🎻. ¿En qué instrumento o clase estás interesado/a?"
      });
    }
  }, [data]);

  const [updateSettings, { loading: isSaving }] = useMutation<any>(UPDATE_GLOBAL_SETTINGS, {
    onCompleted: () => {
      refetch();
      toast.success("Configuraciones actualizadas con éxito ✅");
    },
    onError: (err) => toast.error(err.message)
  });

  const [sendTestWhatsapp, { loading: isSendingTest }] = useMutation<any>(SEND_WHATSAPP_TEST, {
    onCompleted: (res: any) => {
      if (res?.sendWhatsapp?.success) {
        toast.success("¡Mensaje de prueba enviado exitosamente por WhatsApp! 📲");
      } else {
        toast.error("Error al enviar mensaje: " + (res?.sendWhatsapp?.response || "Verifica la instancia de Evolution API"));
      }
    },
    onError: (err) => toast.error("Error al enviar: " + err.message)
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      variables: formData
    });
  };

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone || testPhone.length < 8) {
      toast.error("Ingresa un número telefónico válido");
      return;
    }
    sendTestWhatsapp({
      variables: {
        phoneNumber: testPhone.replace(/\s+/g, ""),
        message: testMessage
      }
    });
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-800 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Settings className="h-3 w-3" /> Panel de Control
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Configuraciones y Conexiones</h1>
          <p className="text-slate-500 italic text-sm">Gestiona los parámetros globales de Détaché, WhatsApp oficial y perfiles de acceso.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200 overflow-x-auto pb-0">
        <button 
          onClick={() => setActiveTab('CONFIG')} 
          className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] relative transition-colors whitespace-nowrap ${activeTab === 'CONFIG' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Parámetros Globales
          {activeTab === 'CONFIG' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('WHATSAPP')} 
          className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] relative transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'WHATSAPP' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          WhatsApp & Mensajería
          {activeTab === 'WHATSAPP' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('ROLES')} 
          className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] relative transition-colors whitespace-nowrap ${activeTab === 'ROLES' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Roles y Perfiles de Acceso
          {activeTab === 'ROLES' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('AVISOS')} 
          className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] relative transition-colors whitespace-nowrap ${activeTab === 'AVISOS' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Feriados y Avisos
          {activeTab === 'AVISOS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'CONFIG' && (
          <form onSubmit={handleSave} className="space-y-8">
            {loading ? (
              <div className="py-20 text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-slate-400 italic">Sincronizando base de datos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Input Sections */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Contact Info Card */}
                  <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8 space-y-6">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">Información de Contacto</h3>
                      <p className="text-slate-400 text-xs italic">Aparece en el pie de página del sitio web y secciones de reservas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F] flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" /> Teléfono Celular
                        </label>
                        <Input
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl"
                          placeholder="+56 9 1234 5678"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F] flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" /> Correo Electrónico
                        </label>
                        <Input
                          required
                          type="email"
                          value={formData.emailContact}
                          onChange={(e) => setFormData({ ...formData, emailContact: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl"
                          placeholder="contacto@detache.cl"
                        />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F] flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> Dirección de la Sede
                        </label>
                        <Input
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl"
                          placeholder="Calle 123, Comuna"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Opening Hours & Socials Card */}
                  <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8 space-y-6">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">Horarios y Redes Sociales</h3>
                      <p className="text-slate-400 text-xs italic">Define la disponibilidad horaria y enlaces dinámicos del pie de página.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F] flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> Horarios de Lunes a Viernes
                        </label>
                        <Input
                          required
                          value={formData.openingHoursWeekdays}
                          onChange={(e) => setFormData({ ...formData, openingHoursWeekdays: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl"
                          placeholder="Ej: 9:00 - 20:00"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F] flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> Horarios Sábados
                        </label>
                        <Input
                          required
                          value={formData.openingHoursSaturdays}
                          onChange={(e) => setFormData({ ...formData, openingHoursSaturdays: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl"
                          placeholder="Ej: 10:00 - 14:00"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F] flex items-center gap-1.5">
                          <Instagram className="h-3.5 w-3.5" /> Enlace Instagram
                        </label>
                        <Input
                          value={formData.instagramUrl}
                          onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl"
                          placeholder="https://instagram.com/nombre"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F] flex items-center gap-1.5">
                          <Facebook className="h-3.5 w-3.5" /> Enlace Facebook
                        </label>
                        <Input
                          value={formData.facebookUrl}
                          onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl"
                          placeholder="https://facebook.com/nombre"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Email Templates Card */}
                  <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8 space-y-6">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">Plantilla Correo de Reserva (Clase Prueba)</h3>
                      <p className="text-slate-400 text-xs italic">Redacta la plantilla del correo automático que se enviará al reservar una clase de prueba.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Cuerpo del Mensaje (Soporta variables y HTML)</label>
                      <Textarea
                        value={formData.trialClassEmailTemplate}
                        onChange={(e) => setFormData({ ...formData, trialClassEmailTemplate: e.target.value })}
                        className="min-h-[220px] bg-slate-50 border-none rounded-2xl p-4 font-mono text-xs leading-relaxed"
                        placeholder="Estimado/a {alumno},\nConfirmamos tu solicitud para..."
                      />
                    </div>
                  </Card>
                </div>

                {/* Right Column: Actions */}
                <div className="lg:col-span-4 sticky top-8">
                  <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8 space-y-6 text-center">
                    <div className="h-16 w-16 bg-[#70125F]/5 rounded-3xl flex items-center justify-center text-primary mx-auto">
                      <Save className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-slate-800">Guardar Cambios</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Aplica las configuraciones globales instantáneamente a todos los formularios del sitio público.
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSaving} 
                      className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl h-12 font-bold uppercase tracking-widest text-[10px]"
                    >
                      {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </Card>
                </div>

              </div>
            )}
          </form>
        )}

        {activeTab === 'WHATSAPP' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {loading ? (
              <div className="py-20 text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
                <p className="text-sm text-slate-400 italic">Cargando configuración de WhatsApp...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: WhatsApp Settings */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Card 1: Asignación de Línea WhatsApp */}
                  <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                      <div>
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-[0.2em] mb-1">
                          <Smartphone className="h-4 w-4" /> Línea Oficial
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg">Asignación de WhatsApp de la Academia</h3>
                        <p className="text-slate-400 text-xs italic">Define el número que usará Détaché para enviar mensajes y chatear con los clientes.</p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 w-fit">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Línea Conectada
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" /> Número de WhatsApp Oficial
                        </label>
                        <Input
                          required
                          value={formData.whatsappNumber}
                          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl font-mono font-bold text-slate-800"
                          placeholder="+56 9 6427 9239"
                        />
                        <p className="text-[10px] text-slate-400 italic">Formato internacional con código de país (ej: +56 9 ...)</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5" /> Área / Responsable Asignado
                        </label>
                        <Input
                          required
                          value={formData.whatsappAssignedTo}
                          onChange={(e) => setFormData({ ...formData, whatsappAssignedTo: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl text-slate-800 font-semibold"
                          placeholder="Recepción / Admisiones"
                        />
                        <p className="text-[10px] text-slate-400 italic">Ej: Recepción, Ventas & Leads, Dirección General</p>
                      </div>
                    </div>
                  </Card>

                  {/* Card 2: Servidor Evolution API */}
                  <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">
                        <Radio className="h-4 w-4" /> Gateway Evolution API
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-lg">Parámetros del Servidor de Mensajería</h3>
                      <p className="text-slate-400 text-xs italic">Ajusta los datos de conexión con el motor de WhatsApp sin editar variables de entorno manualmente.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          URL del Servidor Evolution
                        </label>
                        <Input
                          value={formData.evolutionApiUrl}
                          onChange={(e) => setFormData({ ...formData, evolutionApiUrl: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl font-mono text-xs text-slate-700"
                          placeholder="http://localhost:8080"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Nombre de Instancia
                        </label>
                        <Input
                          value={formData.evolutionInstanceName}
                          onChange={(e) => setFormData({ ...formData, evolutionInstanceName: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl font-mono text-xs text-slate-700"
                          placeholder="MainInstance"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <Key className="h-3.5 w-3.5" /> API Key de Autenticación
                        </label>
                        <Input
                          type="password"
                          value={formData.evolutionApiKey}
                          onChange={(e) => setFormData({ ...formData, evolutionApiKey: e.target.value })}
                          className="h-11 bg-slate-50 border-none rounded-xl font-mono text-xs text-slate-700"
                          placeholder="••••••••••••••••"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Card 3: Automatizaciones y Plantillas */}
                  <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
                        <Bot className="h-4 w-4" /> Respuestas Automáticas
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-lg">Mensajes y Plantillas Predeterminadas</h3>
                      <p className="text-slate-400 text-xs italic">Configura el mensaje de saludo inicial que se envía cuando un lead escribe por primera vez.</p>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.whatsappAutoReply}
                          onChange={(e) => setFormData({ ...formData, whatsappAutoReply: e.target.checked })}
                          className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Activar auto-respuesta para nuevos prospectos</p>
                          <p className="text-[11px] text-slate-500">Envía un saludo inmediato cuando ingresa un lead por WhatsApp o formulario web.</p>
                        </div>
                      </label>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between">
                          <span>Plantilla de Bienvenida</span>
                          <span className="text-[9px] text-emerald-700 font-mono">Variable disponible: &#123;nombre&#125;</span>
                        </label>
                        <Textarea
                          value={formData.whatsappWelcomeTemplate}
                          onChange={(e) => setFormData({ ...formData, whatsappWelcomeTemplate: e.target.value })}
                          className="min-h-[120px] bg-slate-50 border-none rounded-2xl p-4 font-sans text-xs leading-relaxed text-slate-800"
                          placeholder="¡Hola {nombre}! Gracias por contactar a Academia Détaché 🎻..."
                        />
                      </div>
                    </div>
                  </Card>

                </div>

                {/* Right Column: Actions & Test Runner */}
                <div className="lg:col-span-4 space-y-6 sticky top-8">
                  
                  {/* Save Card */}
                  <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8 space-y-6 text-center">
                    <div className="h-16 w-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto">
                      <Save className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-base">Guardar Cambios</h4>
                      <p className="text-slate-400 text-xs italic">Los cambios en WhatsApp se aplicarán de inmediato en los chats y envíos.</p>
                    </div>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl h-12 font-bold uppercase tracking-[0.1em] text-xs shadow-lg shadow-emerald-700/20 cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar WhatsApp"}
                    </Button>
                  </Card>

                  {/* Live Test Runner Card */}
                  <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/10 rounded-2xl text-emerald-400">
                        <Send className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">Prueba de Envío en Vivo</h4>
                        <p className="text-slate-400 text-[11px] italic">Verifica que la línea emita mensajes.</p>
                      </div>
                    </div>

                    <form onSubmit={handleSendTest} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Teléfono Destino
                        </label>
                        <Input
                          required
                          value={testPhone}
                          onChange={(e) => setTestPhone(e.target.value)}
                          className="h-10 bg-white/10 border-white/10 text-white placeholder:text-slate-500 rounded-xl text-xs font-mono"
                          placeholder="+56912345678"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Mensaje de Prueba
                        </label>
                        <Textarea
                          required
                          value={testMessage}
                          onChange={(e) => setTestMessage(e.target.value)}
                          className="min-h-[80px] bg-white/10 border-white/10 text-white placeholder:text-slate-500 rounded-xl text-xs resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSendingTest}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl h-11 shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        {isSendingTest ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                            Enviando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="h-3.5 w-3.5" />
                            Enviar Mensaje de Prueba
                          </span>
                        )}
                      </Button>
                    </form>
                  </Card>

                </div>

              </div>
            )}
          </div>
        )}

        {activeTab === 'ROLES' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Administrador */}
            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <Badge className="bg-rose-50 text-rose-700 border-0 font-black text-[9px]">FULL ACCESS</Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Administrador</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Rol destinado al equipo de dirección y dueños del establecimiento. Otorga control completo del CRM.
                  </p>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permisos Clave</p>
                  <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-4 leading-relaxed">
                    <li>Modificar configuraciones globales y plantillas.</li>
                    <li>Registrar, editar y dar de baja profesores.</li>
                    <li>Acceder a finanzas y registro de cobros.</li>
                    <li>Modificar inventario de instrumentos y salas.</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Ventas */}
            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <Badge className="bg-amber-50 text-amber-700 border-0 font-black text-[9px]">SALES & LEADS</Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Coordinación / Ventas</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Diseñado para el personal encargado del embudo de ventas, captación de leads y pre-reservas.
                  </p>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permisos Clave</p>
                  <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-4 leading-relaxed">
                    <li>Visualizar y gestionar Leads de contacto.</li>
                    <li>Coordinar y convertir Leads en alumnos activos.</li>
                    <li>Enviar mensajes y notificaciones de WhatsApp.</li>
                    <li>Gestionar pre-reservas de prueba.</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Recepción */}
            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-sky-50 text-sky-700 rounded-2xl">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <Badge className="bg-sky-50 text-sky-700 border-0 font-black text-[9px]">FRONT DESK</Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Recepción / Staff</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Orientado a la gestión operacional diaria, atención presencial y control de asistencia física.
                  </p>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permisos Clave</p>
                  <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-4 leading-relaxed">
                    <li>Marcar asistencia e incidencias en la bitácora.</li>
                    <li>Visualizar calendario de clases y disponibilidad diaria.</li>
                    <li>Completar y firmar tareas asignadas de recepción.</li>
                    <li>Visualizar fichas de estudiantes autorizados.</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Security Explanation */}
            <div className="md:col-span-3">
              <Card className="border-none shadow-md bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 space-y-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                  <Lock className="h-80 w-80" />
                </div>
                <div className="max-w-2xl text-left space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <Key className="h-4 w-4" /> Control de Acceso del Sistema
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold font-serif leading-tight">¿Cómo acceden los distintos roles?</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Détaché CRM no dispone de un botón de ingreso público en la página inicial para proteger la seguridad y el prestigio de la marca. Para entrar al sistema:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs leading-relaxed text-slate-300">
                    <div className="space-y-2">
                      <p className="font-bold text-white flex items-center gap-2">
                        <span className="h-5 w-5 bg-white/10 rounded-full flex items-center justify-center font-bold text-[10px]">1</span> 
                        Acceso Manual URL
                      </p>
                      <p>El personal Staff escribe directamente <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-primary">/login</span> en el navegador para ser redirigido a la pantalla de credenciales corporativas.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-white flex items-center gap-2">
                        <span className="h-5 w-5 bg-white/10 rounded-full flex items-center justify-center font-bold text-[10px]">2</span> 
                        Pie de Página Staff
                      </p>
                      <p>Existe un acceso discreto en el pie de página de la academia titulado <strong>Portal Staff</strong>, que lleva directamente al portal de autenticación.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        )}

        {activeTab === 'AVISOS' && (
          <AnnouncementsTab />
        )}
      </div>

    </div>
  );
}
