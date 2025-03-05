"use client";

import { MainNav } from "@/components/main-nav";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth-store";
import { BookOpen, CheckCircle2, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  if (user) {
    router.push("/dashboard");
  }
  const benefits = [
    {
      title: "Maestros especializados",
      description:
        "Equipo de maestros altamente calificados y especializados en sus respectivas áreas de conocimiento.",
    },
    {
      title: "Material Didáctico",
      description:
        "Libros totalmente de imprenta, elaborados para complementar tus clases y ayudarte a dominar cada tema de manera efectiva.",
    },
    {
      title: "Terapia Antiestrés y Anti-nervios",
      description:
        "Sesión para ayudarte a manejar el estrés y ansiedad antes de tu examen para que puedas tener el mejor desempeño posible.",
    },
    {
      title: "Pruebas y simulaciones completas",
      description:
        "Evaluaciones, ejercicios extra y exámenes de simulación donde podrás medir tu progreso y reforzar conocimientos con ayuda de las retroalimentaciones de cada prueba donde se verá la solución de cada reactivo.",
    },
  ];
  return (
    <div>
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
      <div>
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-medium text-center mb-16">
            Conoce nuestros servicios
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 shadow-lg">
              <CardContent className="flex flex-col items-center text-center space-y-4 pt-6">
                <div className="bg-[#131f46] p-4 rounded-full">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-medium">Curso Facultad</h3>
                <p className="text-muted-foreground">
                  Preparación para el examen de ingreso a Facultades de la UANL,
                  Escuelas Normales y a Enfermería (IMSS).
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 shadow-lg">
              <CardContent className="flex flex-col items-center text-center space-y-4 pt-6">
                <div className="bg-[#131f46] p-4 rounded-full">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-medium">Curso Preparatoria</h3>
                <p className="text-muted-foreground">
                  Asesoramiento en todas las materias presentes en tu examen de
                  ingreso a Preparatoria.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-[#131f46] rounded-lg transform -rotate-2"></div>
              <img
                src="/profesor-sonriente-sosteniendo-tableta_23-2148668619.jpg"
                alt="Profesor en el aula"
                className="relative rounded-lg w-full h-auto object-cover"
              />
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl font-medium">
                ¡9 de cada 10 alumnos aceptados!
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Gracias a nuestros beneficios exclusivos:
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-[#131f46] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-lg">{benefit.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* YouTube Section */}
        <section className="w-full bg-[#131f46] text-white py-16">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-medium leading-tight">
                ¿Estás preparándote para ingresar a la Facultad? ¡Tenemos lo que
                necesitas! En nuestro canal de YouTube, encontrarás:
              </h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Clases muestra.</li>
                <li>Resolución de dudas.</li>
                <li>Apoyo para tu registro al examen.</li>
              </ul>
            </div>
            <div className="aspect-video">
              <iframe
                className="w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/VIDEO_ID"
                title="Tutorial: Cómo registrarse al examen"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-medium mb-4">
            Somos la respuesta correcta
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explora los comentarios de ex-alumnos sobre su experiencia con
            nosotros.
          </p>
        </section>
      </div>
    </div>
  );
}
