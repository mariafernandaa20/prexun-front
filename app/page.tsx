"use client";

import { MainNav } from "@/components/main-nav";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  if (user) {
    router.push("/dashboard");
  }

  return (
    <main className="flex-1">
          <MainNav />
      <section className="container px-4 md:px-6 mx-auto w-full py-12 md:py-24 lg:py-32">
        <div className="">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Welcome to Prexun
            </h1>
          </div>
        </div>
      </section>
    </main>
  );
}
