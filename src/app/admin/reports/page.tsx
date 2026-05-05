"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminReportsPage() {
  // Mock data for initial rendering (will connect to Django later)
  const stats = [
    { 
      title: "Leads Totales", 
      value: "128", 
      change: "+12%", 
      trend: "up", 
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      title: "Clases Realizadas", 
      value: "456", 
      change: "+5%", 
      trend: "up", 
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    { 
      title: "Tasa de Conversión", 
      value: "24%", 
      change: "-2%", 
      trend: "down", 
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    { 
      title: "Ingresos Estimados", 
      value: "$4.2M", 
      change: "+8%", 
      trend: "up", 
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
  ];

  const chartData = [
    { label: "Lun", leads: 12, sales: 8 },
    { label: "Mar", leads: 18, sales: 12 },
    { label: "Mie", leads: 15, sales: 10 },
    { label: "Jue", leads: 22, sales: 15 },
    { label: "Vie", leads: 30, sales: 20 },
    { label: "Sab", leads: 10, sales: 5 },
    { label: "Dom", leads: 5, sales: 2 },
  ];

  const maxVal = Math.max(...chartData.map(d => d.leads));

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Reportes y Métricas</h1>
          <p className="text-muted-foreground italic">Monitoreo en tiempo real del crecimiento de la academia.</p>
        </div>
        
        <div className="flex gap-3">
          <Select defaultValue="month">
            <SelectTrigger className="w-[180px] rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-xl">Exportar PDF</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-xl shadow-muted/20 overflow-hidden bg-white group hover:scale-[1.02] transition-transform">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {stat.change}
                  {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 ml-1" /> : <ArrowDownRight className="h-3 w-3 ml-1" />}
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <Card className="lg:col-span-2 border-none shadow-2xl shadow-muted/30 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="font-serif italic flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              Actividad Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-end justify-between gap-4 pt-10">
              {chartData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="relative w-full flex flex-col items-center gap-1 justify-end h-full">
                    <div 
                      className="w-full max-w-[40px] bg-primary/20 rounded-t-lg transition-all duration-500 group-hover:bg-primary/30" 
                      style={{ height: `${(day.leads / maxVal) * 100}%` }}
                    >
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                         {day.leads} Lead
                       </div>
                    </div>
                    <div 
                      className="w-full max-w-[40px] bg-primary rounded-t-lg transition-all duration-500 group-hover:scale-y-105" 
                      style={{ height: `${(day.sales / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">{day.label}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-8 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary/20" />
                <span className="text-xs font-medium">Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-xs font-medium">Conversiones</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Teachers / Services */}
        <Card className="border-none shadow-2xl shadow-muted/30 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="font-serif italic text-primary">Top Servicios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                { name: "Piano Niños", value: 45, color: "bg-blue-500" },
                { name: "Piano Adultos", value: 30, color: "bg-purple-500" },
                { name: "Canto", value: 15, color: "bg-emerald-500" },
                { name: "Teoría", value: 10, color: "bg-amber-500" },
              ].map((service, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{service.name}</span>
                    <span className="text-muted-foreground">{service.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${service.color}`} style={{ width: `${service.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t font-serif">
              <h4 className="font-bold mb-4">Próximos Hitos</h4>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm italic">
                  <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <span>Alcanzar 150 leads mensuales (+17%)</span>
                </li>
                <li className="flex gap-3 text-sm italic">
                  <div className="h-5 w-5 rounded-full bg-muted border flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  </div>
                  <span>Incrementar conversión a 28%</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
