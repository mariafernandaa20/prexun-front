'use client'

import * as React from "react"
import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Facebook } from 'lucide-react'

interface Testimonial {
  id: number
  author: string
  image: string
  date: string
  content: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    author: "Isaac Ramirez",
    image: "/placeholder.svg?height=50&width=50",
    date: "hace 5 meses",
    content: "Muy bien explicados los temas, los maestros te enseñan muy bien y te responden tus dudas y gracias a eso es que pude pasar el examen 👍"
  },
  {
    id: 2,
    author: "Wicho García",
    image: "/placeholder.svg?height=50&width=50",
    date: "hace 5 meses",
    content: "Super Recomendado, un excelente plan de clases claramente explicado, y justo el tiempo adecuado, adicional el servicio y seguimiento excelente, gracias a que mi hijo se preparo aquí, logro pasar el examen a la prepa y quedar en la opcion #1\n\nGracias por todo !!"
  },
  // Add more testimonials as needed
]

export function TestimonialsSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-medium mb-4 relative inline-block">
          Somos la respuesta
          <span className="relative">
            <span className="relative z-10">correcta</span>
            <svg
              className="absolute -top-1 -right-2 -left-2 bottom-0 text-orange-400 z-0"
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.2" />
            </svg>
          </span>
        </h2>
        <p className="text-gray-600 mb-12">
          Explora los comentarios de ex-alumnos sobre su experiencia con nosotros.
        </p>

        <Carousel className="mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{testimonial.author}</h3>
                        <Facebook className="w-5 h-5 text-[#1877F2]" />
                      </div>
                      <p className="text-sm text-gray-500">{testimonial.date}</p>
                    </div>
                  </div>
                  <p className="text-left text-gray-600">{testimonial.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <button className="hover:text-gray-700">Me gusta</button>
                    <button className="hover:text-gray-700">Comentar</button>
                    <button className="hover:text-gray-700">Compartir</button>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  )
}

