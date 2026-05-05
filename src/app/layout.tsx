import type { Metadata } from "next";
import { fontMontserrat } from "@/lib/constants/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { HeaderWrapper, FooterWrapper } from "@/components/layout/BackofficeWrapper";

export const metadata: Metadata = {
  title: "Détaché | Academia de Música",
  description: "Reserva tus clases de piano con los mejores profesores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(
        fontMontserrat.variable,
        "min-h-screen flex flex-col bg-background font-sans antialiased"
      )}>
        <ApolloWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <HeaderWrapper />
            <main className="flex-1">
              {children}
            </main>
            <FooterWrapper />
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
