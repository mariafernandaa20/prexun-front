"use client";

import { MainNav } from "@/components/main-nav";
import { useAuthStore } from "@/lib/store/auth-store";
import Image from "next/image";
import Link from "next/link";
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
      <div className="relative h-[800px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/50" />
          <Image
            src="/cheerful-mood-group-people-business-conference-modern-classroom-daytime-2-scaled.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Asesorías para la Preparatoria y Facultad
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Comienza a construir tu futuro hoy mismo
              <br />
              con un aprendizaje efectivo.
            </h2>
            <p className="text-lg mb-8">
              Aclara todas tus dudas y enfrenta tu examen de admisión con
              confianza.
              <br />
              ¡Inscríbete hoy y asegúrate el éxito!
            </p>
            <Link
              href="/contacto"
              className="inline-block bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
