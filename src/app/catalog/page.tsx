import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Users, BookOpen } from 'lucide-react';
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

const GET_CATALOG_ITEMS = gql`
  query GetCatalogItems {
    allClassTypes {
      id
      name
      description
      durationMinutes
      price
      currency
      allowedLevels
      allowedModalities
    }
  }
`;

export default async function CatalogPage() {
  let classTypes = [];
  try {
    const { data } = await getClient().query<any>({
      query: GET_CATALOG_ITEMS,
      fetchPolicy: 'no-cache',
    });
    classTypes = data?.allClassTypes || [];
  } catch (e) {
    console.error("Could not fetch catalog items:", e);
  }

  const itemsToShow = classTypes;

  if (itemsToShow.length === 0) {
    return (
      <div className="container py-20 mx-auto px-4 text-center max-w-xl flex flex-col items-center justify-center space-y-6">
        <div className="p-4 bg-fuchsia-50 text-fuchsia-600 rounded-3xl shrink-0">
          <BookOpen className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight font-serif text-slate-900">Catálogo de Clases</h1>
        <p className="text-slate-500 max-w-md leading-relaxed">
          Nuestra oferta académica se está actualizando. Por favor, vuelve a ingresar más tarde o contáctanos para agendar tu clase personalizada.
        </p>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl h-11 px-6" asChild>
          <Link href="/#plans">Ver planes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 mx-auto px-4">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-serif">Catálogo de Clases</h1>
        <p className="text-muted-foreground">
          Explora nuestra oferta académica y encuentra la clase perfecta para ti.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itemsToShow.map((ct: any) => (
          <Card key={ct.id} className="flex flex-col h-full hover:shadow-md transition-shadow border-slate-100 rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-4">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl font-bold font-serif leading-snug">{ct.name}</CardTitle>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {safeParseArray(ct.allowedLevels).map((level: string) => (
                  <Badge key={level} variant="secondary" className="text-[9px] font-bold uppercase tracking-wider">
                    {level === 'BEGINNER' ? 'Principiante' : level === 'INTERMEDIATE' ? 'Intermedio' : level === 'ADVANCED' ? 'Avanzado' : level}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex-1">
              <CardDescription className="mb-6 text-sm text-slate-500 leading-relaxed">
                {ct.description}
              </CardDescription>

              <div className="space-y-2.5 text-xs text-slate-500 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>{ct.durationMinutes} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="font-bold text-slate-800">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: ct.currency || 'CLP', maximumFractionDigits: 0 }).format(ct.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="capitalize">
                    {safeParseArray(ct.allowedModalities).map((m: string) => m === 'IN_PERSON' ? 'Presencial' : m === 'ONLINE' ? 'Online' : m).join(' / ')}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex flex-col gap-2 shrink-0">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl h-11" asChild>
                <Link href={`/contact?service=${encodeURIComponent(ct.name)}`}>Solicitar Prueba</Link>
              </Button>
              <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-400" asChild>
                <Link href={`/catalog/${ct.id}`}>Ver Detalle</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
