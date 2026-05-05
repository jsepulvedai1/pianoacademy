import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CLASS_TYPES, MOCK_TEACHERS } from '@/lib/mock-data';
import { Clock, DollarSign, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ClassDetailPageProps {
  params: {
    id: string;
  };
}

export default function ClassDetailPage({ params }: ClassDetailPageProps) {
  const classType = CLASS_TYPES.find((c) => c.id === params.id);

  if (!classType) {
    notFound();
  }

  // Filtrar profesores que pueden dar esta clase (lógica simple por ahora)
  // En un caso real, esto dependería de relaciones en BD
  const availableTeachers = MOCK_TEACHERS; 

  return (
    <div className="container py-10 mx-auto px-4 max-w-4xl">
      <Button variant="ghost" className="mb-6 gap-2 pl-0 hover:pl-0 hover:bg-transparent" asChild>
        <Link href="/catalog">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {classType.allowedLevels.map((level) => (
                <Badge key={level} variant="secondary">
                  {level}
                </Badge>
              ))}
              {classType.allowedModalities.map((mode) => (
                <Badge key={mode} variant="outline">
                  {mode}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">{classType.name}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {classType.description}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duración</p>
                  <p className="text-xl font-bold">{classType.durationMinutes} minutos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Precio por clase</p>
                  <p className="text-xl font-bold">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: classType.currency }).format(classType.price)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Lo que aprenderás</h2>
            <ul className="space-y-3">
              {[
                "Técnica y postura correcta",
                "Lectura musical y teoría aplicada",
                "Repertorio adaptado a tu nivel",
                "Expresión e interpretación musical"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-muted/30 border-primary/20">
            <h3 className="font-semibold mb-4">Profesores Disponibles</h3>
            <div className="space-y-4 mb-6">
              {availableTeachers.slice(0, 3).map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                      <img src={teacher.avatarUrl} alt={teacher.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {teacher.especialidades[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full text-lg h-12" asChild>
              <Link href={`/book?classId=${classType.id}`}>
                Reservar Hora
              </Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Cancelación gratuita hasta 24h antes.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
