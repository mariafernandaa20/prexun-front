'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Campus, Grupo, Period } from '@/lib/types';
import GrupoModal from '../../../../components/dashboard/GrupoModal';
import { createGrupo, getCampuses, getGrupos, getPeriods, updateGrupo } from '@/lib/api';

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = React.useState<Grupo[]>([]);
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [grupo, setGrupo] = React.useState<Grupo | null>(null);
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [campuses, setCampuses] = React.useState<Campus[]>([]);

  React.useEffect(() => {
    fetchPeriods();
    fetchCampuses();
    fetchGrupos();
  }, []);

  const filteredGrupos = grupos.filter((grupo) =>
    grupo.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (grupo: Grupo) => {
    try {
        if (grupo.id) {
          await updateGrupo(grupo)
        } else {
          await createGrupo(grupo)
      }
      fetchGrupos()
    } catch (error) {
      console.error('Error:', error)
    }
    console.log(grupo);
  };
  const fetchGrupos = async () => {
    try {
      const response = await getGrupos();
      setGrupos(response);
    } catch (error) {
      console.error('Error fetching grupos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchCampuses = async () => {
    const response = await getCampuses();
    setCampuses(response);
  };
  const fetchPeriods = async () => {
    const response = await getPeriods();
    console.log(response);
    setPeriods(response);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Grupos</h1>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Grupo
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar grupos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Capacidad</TableHead>
            <TableHead>Frecuencia</TableHead>
            <TableHead>Horario</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Cargando...
              </TableCell>
            </TableRow>
          ) : filteredGrupos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No se encontraron grupos
              </TableCell>
            </TableRow>
          ) : (
            filteredGrupos.map((grupo) => (
              <TableRow
                key={grupo.id}
              >
                <TableCell>{grupo.name}</TableCell>
                <TableCell>{grupo.type}</TableCell>
                <TableCell>{grupo.capacity}</TableCell>
                <TableCell>{grupo.frequency}</TableCell>
                <TableCell>
                  {grupo.start_time} - {grupo.end_time}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <GrupoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        grupo={grupo}
        periods={periods}
        campuses={campuses}
      />
    </div>
  );
}
