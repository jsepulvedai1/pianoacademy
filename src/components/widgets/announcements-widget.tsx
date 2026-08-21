"use client";

import { useQuery } from "@apollo/client/react/index.js";
import { GET_ACTIVE_ANNOUNCEMENTS } from "@/graphql/queries/get-announcements";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function AnnouncementsWidget({ targetAudience }: { targetAudience: 'STUDENTS' | 'TEACHERS' }) {
  const { data, loading } = useQuery<any>(GET_ACTIVE_ANNOUNCEMENTS, {
    variables: { targetAudience }
  });

  const announcements = data?.activeAnnouncements || [];

  if (loading) return null;
  if (announcements.length === 0) return null;

  return (
    <Card className="rounded-[2.5rem] border border-slate-100 shadow-sm bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Megaphone className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800">Feriados y Avisos</h3>
          </div>
        </div>

        <div className="space-y-4">
          {announcements.map((ann: any) => (
            <div key={ann.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 leading-tight">{ann.title}</h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {format(parseISO(ann.createdAt), "dd MMM yyyy", { locale: es })}
                </p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
