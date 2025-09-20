"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import axiosInstance from "@/lib/api/axiosConfig"
import React, { useEffect } from "react"
import AttendanceCalendar from "./AttendanceCalendar"

export default function StudentAttendance({ studentId }: { studentId: string }) {
  const [attendances, setAttendances] = React.useState<any[]>([
    {
      id: 12,
      student_id: 3783,
      grupo_id: 82,
      user_id: null,
      date: "2025-09-20T00:00:00.000000Z",
      present: true,
      created_at: "2025-09-20T06:36:28.000000Z",
      updated_at: "2025-09-20T06:36:28.000000Z",
      attendance_time: "2025-09-20T06:36:28.000000Z",
      notes: null,
    },
  ])

  async function fetchAttendance() {
    const res = await axiosInstance(`/teacher/attendance/student/${studentId}/report`)

    setAttendances(res.data.data || [])
  }

  console.log(attendances)

  useEffect(() => {
    if (!studentId) return
    fetchAttendance()
  }, [studentId])

  return (
    <AttendanceCalendar attendance={attendances} />
  )
}
