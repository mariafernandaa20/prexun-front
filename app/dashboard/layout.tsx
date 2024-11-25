import { MainNav } from "@/components/main-nav";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen container mx-auto">
      <MainNav />

      {children}
    </div>
  );
}
