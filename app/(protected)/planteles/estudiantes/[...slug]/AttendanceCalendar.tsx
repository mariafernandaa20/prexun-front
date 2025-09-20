"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AttendanceRecord {
  id: number
  student_id: number
  grupo_id: number
  user_id: number | null
  date: string
  present: boolean
  created_at: string
  updated_at: string
  attendance_time: string
  notes: string | null
}

interface AttendanceCalendarProps {
  attendance: AttendanceRecord[]
  month?: number
  year?: number
}

export default function AttendanceCalendar({
  attendance,
  month = new Date().getMonth(),
  year = new Date().getFullYear(),
}: AttendanceCalendarProps) {
  // Obtener el primer día del mes y cuántos días tiene
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Nombres de los días de la semana
  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  // Crear un mapa de asistencias por fecha
  const attendanceMap = new Map<string, boolean>()
  attendance.forEach((record) => {
    const date = new Date(record.date)
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    attendanceMap.set(dateKey, record.present)
  })

  // Generar los días del calendario
  const calendarDays = []

  // Días vacíos al inicio del mes
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month}-${day}`
    const hasAttendance = attendanceMap.has(dateKey)
    const isPresent = attendanceMap.get(dateKey)

    calendarDays.push({
      day,
      hasAttendance,
      isPresent,
    })
  }

  const getAttendanceStats = () => {
    const totalDays = attendance.length
    const presentDays = attendance.filter((record) => record.present).length
    const absentDays = totalDays - presentDays
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

    return { totalDays, presentDays, absentDays, attendanceRate }
  }

  const stats = getAttendanceStats()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Calendario de Asistencias - {monthNames[month]} {year}
          </span>
          <Badge variant="outline" className="text-sm">
            {stats.attendanceRate}% Asistencia
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
            <div className="text-sm text-muted-foreground">Presentes</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-600">{stats.absentDays}</div>
            <div className="text-sm text-muted-foreground">Ausentes</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{stats.totalDays}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Calendario */}
        <div className="grid grid-cols-7 gap-1">
          {/* Encabezados de días de la semana */}
          {daysOfWeek.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Días del calendario */}
          {calendarDays.map((dayData, index) => (
            <div
              key={index}
              className={`
                aspect-square p-1 text-center text-sm border rounded-md
                ${!dayData ? "invisible" : ""}
                ${
                  dayData?.hasAttendance
                    ? dayData.isPresent
                      ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300"
                      : "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300"
                    : "bg-muted/50 border-border text-muted-foreground"
                }
              `}
            >
              {dayData && (
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="font-medium">{dayData.day}</span>
                  {dayData.hasAttendance && <div className="text-xs mt-1">{dayData.isPresent ? "✓" : "✗"}</div>}
                </div>
              )}
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  )
}
