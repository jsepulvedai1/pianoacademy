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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
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
            defaultTheme="light"
            enableSystem={false}
            forcedTheme="light"
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
