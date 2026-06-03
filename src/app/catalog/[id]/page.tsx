import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, DollarSign, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client/core/index.js';

export const dynamic = 'force-dynamic';

const safeParseArray = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const GET_CLASS_TYPE = gql`
  query GetClassTypeDetail($id: Int!) {
    classTypeById(id: $id) {
      id
      name
      description
      durationMinutes
      price
      currency
      allowedLevels
      allowedModalities
      whatYouWillLearn
      teachers {
        id
        name
        photo
        specialties {
          id
          name
        }
      }
    }
  }
`;

interface ClassDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { id } = await params;
  
  const dbId = parseInt(id, 10);
  if (isNaN(dbId)) {
    notFound();
  }

  let classType: any = null;
  try {
    const { data } = await getClient().query<any>({
      query: GET_CLASS_TYPE,
      variables: { id: dbId },
      fetchPolicy: 'no-cache',
    });
    classType = data?.classTypeById;
  } catch (e) {
    console.error("Error fetching class type detail from GraphQL:", e);
  }

  if (!classType) {
    notFound();
  }

  // Map teachers lists
  const availableTeachers = (classType.teachers || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    photo: t.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`,
    specialtyText: t.specialties?.[0]?.name || 'Profesor'
  }));

  const allowedLevels = safeParseArray(classType.allowedLevels);
  const allowedModalities = safeParseArray(classType.allowedModalities);
  const whatYouWillLearn = safeParseArray(classType.whatYouWillLearn);

  // Fallback for what you will learn
  const whatYouWillLearnList = whatYouWillLearn.length > 0
    ? whatYouWillLearn
    : [
        "Técnica y postura correcta",
        "Lectura musical y teoría aplicada",
        "Repertorio adaptado a tu nivel",
        "Expresión e interpretación musical"
      ];

  return (
    <div className="container py-10 mx-auto px-4 max-w-5xl">
      <Button variant="ghost" className="mb-6 gap-2 pl-0 hover:pl-0 hover:bg-transparent text-slate-500 font-bold uppercase text-[10px] tracking-widest" asChild>
        <Link href="/catalog">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {allowedLevels.map((level: string) => (
                <Badge key={level} variant="secondary" className="bg-amber-400 hover:bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {level === 'BEGINNER' ? 'Principiante' : level === 'INTERMEDIATE' ? 'Intermedio' : level === 'ADVANCED' ? 'Avanzado' : level}
                </Badge>
              ))}
              {allowedModalities.map((mode: string) => (
                <Badge key={mode} variant="outline" className="border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white">
                  {mode === 'IN_PERSON' ? 'Presencial' : mode === 'ONLINE' ? 'Online' : mode}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight font-serif mb-4 text-slate-900 leading-tight">
              {classType.name}
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed font-normal">
              {classType.description}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-fuchsia-50 rounded-2xl shrink-0">
                  <Clock className="h-6 w-6 text-fuchsia-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duración</p>
                  <p className="text-lg font-bold text-slate-800">{classType.durationMinutes} minutos</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-fuchsia-50 rounded-2xl shrink-0">
                  <DollarSign className="h-6 w-6 text-fuchsia-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Precio por clase</p>
                  <p className="text-lg font-bold text-slate-800">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: classType.currency || 'CLP', maximumFractionDigits: 0 }).format(classType.price)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-serif mb-5 text-slate-800">Lo que aprenderás</h2>
            <ul className="space-y-3.5">
              {whatYouWillLearnList.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-fuchsia-600 shrink-0 mt-0.5" />
                  <span className="text-slate-600 text-sm md:text-base font-normal leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <h3 className="font-serif font-bold text-lg text-slate-800 mb-5">Profesores Disponibles</h3>
            <div className="space-y-4 mb-6">
              {availableTeachers.length > 0 ? (
                availableTeachers.slice(0, 4).map((teacher: any) => (
                  <div key={teacher.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-100">
                      <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{teacher.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {teacher.specialtyText}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No hay profesores específicos asignados aún.</p>
              )}
            </div>
            
            <Button className="w-full h-12 bg-fuchsia-700 hover:bg-fuchsia-800 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-md shadow-fuchsia-200/50" asChild>
              <Link href={`/book?service=${encodeURIComponent(classType.name)}`}>
                Solicitar Clase de Prueba
              </Link>
            </Button>
            <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-wider mt-4">
              Cancelación gratuita hasta 24h antes.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

