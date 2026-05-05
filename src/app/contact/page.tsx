import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Send, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="pt-20 pb-12 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold font-serif tracking-tight text-foreground">Contacto</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic">
            ¿Tienes dudas? Estamos aquí para ayudarte a encontrar el programa perfecto para ti.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Info Column */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-serif">Conecta con nosotros</h2>
                <div className="grid gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-primary">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">WhatsApp & Teléfono</h4>
                      <p className="text-muted-foreground">+56 9 1234 5678</p>
                      <Button variant="link" className="px-0 h-auto text-primary font-bold">Enviar mensaje ahora →</Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-primary">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Email Directo</h4>
                      <p className="text-muted-foreground">hola@detache.cl</p>
                      <p className="text-muted-foreground text-sm leading-tight">Respondemos en menos de 24 horas hábiles.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-primary">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Horario de Atención</h4>
                      <p className="text-muted-foreground">Lunes a Viernes: 09:00 - 20:00</p>
                      <p className="text-muted-foreground">Sábados: 10:00 - 14:00</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold font-serif">Síguenos en redes</h3>
                <div className="flex gap-4">
                  {[Instagram, Facebook, Youtube].map((Icon, i) => (
                    <a key={i} href="#" className="p-4 bg-muted/50 rounded-2xl hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                      <Icon className="h-6 w-6" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-muted shadow-2xl shadow-muted/50 space-y-8">
              <div className="space-y-2 text-center lg:text-left">
                <h3 className="text-2xl font-bold">Escríbenos</h3>
                <p className="text-muted-foreground">Completa el formulario y nos pondremos en contacto.</p>
              </div>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre</label>
                    <Input placeholder="Tu nombre completo" className="h-12 rounded-xl focus:ring-primary focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">WhatsApp</label>
                    <Input placeholder="+56 9 ..." className="h-12 rounded-xl focus:ring-primary focus-visible:ring-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email (Opcional)</label>
                  <Input type="email" placeholder="ejemplo@correo.com" className="h-12 rounded-xl focus:ring-primary focus-visible:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">¿En qué instrumento estás interesado?</label>
                  <Input placeholder="Piano, Canto, Violín..." className="h-12 rounded-xl focus:ring-primary focus-visible:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mensaje</label>
                  <Textarea placeholder="Cuéntanos más..." className="min-h-[120px] rounded-xl focus:ring-primary focus-visible:ring-primary" />
                </div>
                <Button className="w-full h-14 text-lg font-bold rounded-xl space-x-2">
                  <span>Enviar Formulario</span>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section - Reused from Home */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="h-[400px] rounded-3xl overflow-hidden shadow-xl border bg-white relative">
              <div className="absolute inset-0 bg-[#f8f9fa] flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-ping" />
                  <div className="absolute inset-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-serif tracking-tight">Nuestra Academia</h2>
              <p className="text-muted-foreground text-lg">
                Visítanos en nuestra sede de Providencia. Ambientes diseñados para la concentración y el arte.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm border">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Providencia</h4>
                    <p className="text-muted-foreground">Av. Música 123, Piso 2</p>
                    <p className="text-xs text-primary font-medium mt-1">SANTIAGO, CHILE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
