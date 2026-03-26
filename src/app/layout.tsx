import type { Metadata } from "next";
import { fontMontserrat } from "@/lib/constants/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

// Font loading is handled in the constants file

import { ApolloWrapper } from "@/lib/apollo-wrapper";

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
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
