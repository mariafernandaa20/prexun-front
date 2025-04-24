import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { PenIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { updateStudent } from '@/lib/api/studentApi'
import { getGrupos, getSemanas } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

interface Student {
  id: number
  email: string
  firstname: string
  lastname: string
  grupo_id?: number
}

interface Grupo {
  id?: number
  name: string
  capacity: number
  students_count?: number
}

export default function UpdatePersonalInfo({ student }: { student: Student }) {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [semanas, setSemanas] = useState<Grupo[]>([])
  const [formData, setFormData] = useState({
    id: student.id,
    email: student.email,
    firstname: student.firstname,
    lastname: student.lastname,
    grupo_id: student.grupo_id || "",
    semana_intensiva_id: student.grupo_id || "",
  })

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const grupos = await getGrupos()
        const semanas = await getSemanas();

        setSemanas(semanas)
        setGrupos(grupos)
      } catch (error) {
        console.error('Error al cargar grupos:', error)
      }
    }

    fetchGrupos()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await updateStudent(formData)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Actualizar Información Personal <PenIcon className="ml-2" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Actualizar Información Personal</DialogTitle>
          <div className='text-gray-500'>Este formulario actualiza directamente a moodle</div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="correo@prexun.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstname">Nombre</Label>
            <Input
              id="firstname"
              name="firstname"
              type="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              placeholder="Nombre"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname">Apellido</Label>
            <Input
              id="lastname"
              name="lastname"
              type="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              placeholder="Apellido"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grupo_id">Grupo</Label>
            <Select
              name="grupo_id"
              value={formData.grupo_id as string}
              onValueChange={(value) => handleSelectChange(value, 'grupo_id')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el grupo" />
              </SelectTrigger>
              <SelectContent>
                {grupos.map((grupo) => (
                  <SelectItem key={grupo.id} value={grupo.id?.toString() || ""}>
                    {grupo.name} - {grupo.students_count || 0}/{grupo.capacity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="semana_intensiva_id">Grupo de Semanas Intensivas</Label>
            <Select
              name="semana_intensiva_id"
              value={formData.semana_intensiva_id as string}
              onValueChange={(value) => handleSelectChange(value, 'semana_intensiva_id')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el grupo" />
              </SelectTrigger>
              <SelectContent>
                {semanas.map((semana) => (
                  <SelectItem key={semana.id} value={semana.id?.toString() || ""}>
                    {semana.name} - {semana.students_count || 0}/{semana.capacity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Guardar Cambios
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
