import Link from "next/link";
import { TEACHERS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { User, Calendar, MapPin, Monitor } from "lucide-react";

export default function TeachersPage() {
  return (
    <div className="container py-10 mx-auto px-4">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Nuestros Profesores</h1>
        <p className="text-muted-foreground text-lg">
          Conoce al equipo de músicos profesionales dedicados a guiarte en tu camino pianístico.
          Cada uno con su especialidad y enfoque único.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TEACHERS.map((teacher) => (
          <Card key={teacher.id} className="overflow-hidden flex flex-col h-full border-muted hover:border-primary/50 transition-colors group">
            <div className="aspect-square relative bg-muted overflow-hidden">
              {teacher.avatarUrl ? (
                <img 
                  src={teacher.avatarUrl} 
                  alt={`${teacher.firstName} ${teacher.lastName}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <User className="h-20 w-20 text-muted-foreground opacity-50" />
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                <h2 className="text-white text-2xl font-bold truncate">
                  {teacher.firstName} {teacher.lastName}
                </h2>
                <div className="flex gap-2 mt-2">
                   {teacher.availableModalities.includes("IN_PERSON") && (
                     <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-none">
                       <MapPin className="w-3 h-3 mr-1" /> Presencial
                     </Badge>
                   )}
                   {teacher.availableModalities.includes("ONLINE") && (
                     <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-none">
                       <Monitor className="w-3 h-3 mr-1" /> Online
                     </Badge>
                   )}
                </div>
              </div>
            </div>

            <CardContent className="flex-1 pt-6">
              <div className="mb-4">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wider">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {teacher.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="font-normal">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wider">Bio</h3>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {teacher.bio}
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-2 pb-6">
              <Button asChild className="w-full" size="lg">
                <Link href={`/book?teacherId=${teacher.id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Reservar con {teacher.firstName}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
