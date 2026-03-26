import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { User, Calendar, Star } from "lucide-react";
import { getClient } from "@/lib/apollo-client";
import { GET_TEACHERS } from "@/graphql/queries/get-teachers";
import { GetTeachersData } from "@/types/graphql";

export default async function TeachersPage() {
  const { data } = await getClient().query<GetTeachersData>({
    query: GET_TEACHERS,
  });

  const teachers = data?.allTeachers || [];

  return (
    <div className="container py-10 mx-auto px-4">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4 font-serif">Nuestros Profesores</h1>
        <p className="text-muted-foreground text-lg">
          Conoce al equipo de músicos profesionales dedicados a guiarte en tu camino pianístico.
          Cada uno con su especialidad y enfoque único.
        </p>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted">
          <p className="text-muted-foreground">No se encontraron profesores disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="overflow-hidden flex flex-col h-full border-muted/60 hover:border-primary/40 transition-all duration-500 group hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-b from-white to-primary/[0.02]">
              <div className="pt-10 flex flex-col items-center">
                <div className="w-44 h-44 relative rounded-full overflow-hidden border-[6px] border-white shadow-xl ring-1 ring-primary/5 group-hover:ring-primary/20 transition-all duration-500">
                  {teacher.photo ? (
                    <img
                      src={teacher.photo}
                      alt={teacher.name}
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                      <User className="h-20 w-20 text-muted-foreground/20" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
                </div>

                <div className="mt-6 text-center px-6">
                  <Badge variant="outline" className="mb-3 font-semibold text-[10px] uppercase tracking-[0.2em] border-primary/20 text-primary/70 bg-primary/5">
                    {teacher.status === "ACTIVE" ? "Disponible" : teacher.status}
                  </Badge>
                  <h2 className="text-2xl font-bold leading-tight font-serif tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {teacher.name}
                  </h2>
                  <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500/80">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current text-muted-foreground/20" />
                  </div>
                </div>
              </div>

              <CardContent className="flex-1 pt-6 px-8 space-y-6 text-center">
                <div>
                  <h3 className="font-bold text-[10px] text-primary/50 mb-3 uppercase tracking-[0.15em]">Especialidades</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {teacher.specialties.map((specialty) => (
                      <Badge key={specialty.id} variant="secondary" className="font-medium bg-white border border-primary/10 text-primary/80 hover:bg-primary/5 shadow-sm">
                        {specialty.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-primary/10" />
                  <p className="text-sm leading-relaxed text-muted-foreground italic line-clamp-3 pt-2">
                    "{teacher.description}"
                  </p>
                </div>
              </CardContent>

              <CardFooter className="pt-4 pb-8 px-8">
                <Button asChild className="w-full h-12 text-sm font-bold uppercase tracking-wider shadow-lg shadow-primary/10 border-b-4 border-primary/80 active:border-b-0 hover:translate-y-[1px] transition-all" size="lg">
                  <Link href={`/book?teacherId=${teacher.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Reservar ahora
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
