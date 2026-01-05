'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import axiosInstance from '@/lib/api/axiosConfig';
import React, { useEffect } from 'react';
import AttendanceCalendar from './AttendanceCalendar';

export default function StudentAttendance({
  studentId,
}: {
  studentId: string;
}) {
  const [attendances, setAttendances] = React.useState<any[]>([]);

  async function fetchAttendance() {
    const res = await axiosInstance(
      `/teacher/attendance/student/${studentId}/report`
    );

    setAttendances(res.data.data || []);
  }

  useEffect(() => {
    if (!studentId) return;
    fetchAttendance();
  }, [studentId]);

  return <AttendanceCalendar attendance={attendances} />;
}
