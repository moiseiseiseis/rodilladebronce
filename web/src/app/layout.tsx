// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/layout/TopBar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import PageTransition from "@/components/layout/PageTransition";

export const metadata: Metadata = {
  title: "SmartKnee Portal",
  description:
    "Portal clínico para visualizar sesiones de rehabilitación con la órtesis inteligente SmartKnee.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-[var(--bg)] text-[var(--text-main)]">
        <ThemeProvider>
          <div className="min-h-screen">
            <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6">
              <TopBar />
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
