import type { Metadata } from "next";
import { Lora, Montserrat } from "next/font/google";
import "./globals.css";

// 1. Configurar fuente Serif 
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora", // Variable CSS para usar en Tailwind
});

// 2. Configurar fuente Sans-serif 
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["900"], // black weight para títulos y elementos destacados
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Plataforma de Talleres",
  description: "Sistema de gestión de talleres y prácticas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* Aplicamos las variables de las fuentes y los colores globales al body */}
      <body 
        className={`${lora.variable} ${montserrat.variable} font-serif bg-brand-beige text-brand-dark antialiased flex flex-col min-h-screen`}
      >
        <main className="flex-grow w-full max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          {children}
        </main>
      </body>
    </html>
  );
}