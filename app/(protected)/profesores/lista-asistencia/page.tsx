'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';
import { useAuthStore } from '@/lib/store/auth-store';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  matricula: string;
}

interface Grupo {
  id: string;
  name: string;
  students: Student[];
}

export default function AttendanceListPage() {
  const user = useAuthStore((state) => state.user);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch teacher's groups
  const fetchTeacherGroups = async () => {
    try {
      if (!user?.id) return;
      const response = await axiosInstance.get(`/teacher/groups/${user.id}`);
      setGrupos(response.data);
      setIsLoading(false);
    } catch (error) {
      toast('Error loading groups', {
        description: 'Could not load teacher groups'
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTeacherGroups();
    }
  }, [user]);

  // Handle attendance change
  const handleAttendanceChange = (studentId: string, checked: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: checked
    }));
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    try {
      await axiosInstance.post('/teacher/attendance', {
        grupo_id: selectedGrupo,
        date: selectedDate,
        attendance: attendance
      });
      
      toast('Attendance saved', {
        description: 'Attendance was saved successfully'
      });
    } catch (error) {
      toast('Error saving', {
        description: 'Could not save attendance'
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="text-lg">Loading groups...</div>
    </div>;
  }

  const selectedGroupStudents = grupos.find(g => g.id === selectedGrupo)?.students || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Attendance List</h1>
      
      <div className="flex gap-4 mb-6">
        <div className="w-1/3">
          <Select
            value={selectedGrupo}
            onValueChange={setSelectedGrupo}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {grupos.map(grupo => (
                <SelectItem key={grupo.id} value={grupo.id}>
                  {grupo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-1/3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>
      </div>

      {selectedGrupo && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedGroupStudents.map(student => (
                <TableRow key={student.id}>
                  <TableCell>{student.matricula}</TableCell>
                  <TableCell>{student.firstname}</TableCell>
                  <TableCell>{student.lastname}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={attendance[student.id] || false}
                      onCheckedChange={(checked) => 
                        handleAttendanceChange(student.id, checked as boolean)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveAttendance}>
              Save Attendance
            </Button>
          </div>
        </>
      )}
    </div>
  );
}