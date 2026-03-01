import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CLASS_TYPES } from '@/lib/mock-data';
import { Clock, DollarSign, Users } from 'lucide-react';

export default function CatalogPage() {
  return (
    <div className="container py-10 mx-auto px-4">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Clases</h1>
        <p className="text-muted-foreground">
          Explora nuestra oferta académica y encuentra la clase perfecta para ti.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CLASS_TYPES.map((classType) => (
          <Card key={classType.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl">{classType.name}</CardTitle>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {classType.allowedLevels.map((level) => (
                  <Badge key={level} variant="secondary" className="text-xs">
                    {level}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="mb-4 text-base">
                {classType.description}
              </CardDescription>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{classType.durationMinutes} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: classType.currency }).format(classType.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {classType.allowedModalities.join(' / ')}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={`/catalog/${classType.id}`}>Ver Detalle</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
