"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulated auth check for testing
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        router.push("/admin/dashboard");
      } else {
        setError("Credenciales incorrectas. Intenta con admin/admin.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md border-muted/50 shadow-2xl backdrop-blur-sm bg-white/80 relative z-10 animate-fade-in">
        <CardHeader className="space-y-4 pb-8 text-center pt-10">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 animate-pulse">
              <Music className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold font-serif tracking-tight">Détaché Manager</CardTitle>
            <CardDescription className="text-base italic">
              Acceso exclusivo para la administración de la academia.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2 group">
              <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-12 bg-white/50 border-muted/60 focus:border-primary/50 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="password" title="" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-white/50 border-muted/60 focus:border-primary/50 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 animate-shake">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 text-base font-bold uppercase tracking-wider shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all group" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Ingresar al sistema
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pb-10">
          <div className="h-px w-full bg-muted/40" />
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
          >
            ← Volver a la página principal
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
