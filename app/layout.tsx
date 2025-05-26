import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";
import { Toaster } from "sonner";

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
        {/* <div>
          <div className="block sm:hidden fixed top-0 left-0 z-[100] px-2 bg-white dark:text-black">
            sm
          </div>
          <div className="hidden sm:block md:hidden fixed top-0 left-0 z-[100] px-2 bg-white dark:text-black">
            md
          </div>
          <div className="hidden md:block lg:hidden fixed top-0 left-0 z-[100] px-2 bg-white dark:text-black">
            lg
          </div>
          <div className="hidden lg:block xl:hidden fixed top-0 left-0 z-[100] px-2 bg-white dark:text-black">
            xl
          </div>
          <div className="hidden xl:block 2xl:hidden fixed top-0 left-0 z-[100] px-2 bg-white dark:text-black">
            2xl
          </div>
          <div className="hidden 2xl:block fixed top-0 left-0 z-[100] px-2 bg-white dark:text-black">
            +2xl
          </div>
        </div> */}

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <AuthProvider>
              {children}
            </AuthProvider>
          </Providers>
          <Toaster
            position="top-center"
            richColors
            expand
            closeButton
          />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
