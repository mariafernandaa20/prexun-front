import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers"; // Importamos Providers

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prexun",
  description: "Authentication system with Next.js and Laravel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="tb4VnCQ9veS+etZWvizOmA"
          async
        ></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers> {/* Aquí envuelves tu aplicación con Providers */}
            <AuthProvider>
              {children}
            </AuthProvider>
          </Providers>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
