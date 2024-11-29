import { School } from '@/lib/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

interface SchoolTableProps {
  schools: School[]
  onEdit: (school: School) => void
  onDelete: (id: string) => void
}

export function SchoolTable({ schools, onEdit, onDelete }: SchoolTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre del Plantel</TableHead>
          <TableHead>Administrador</TableHead>
          <TableHead>Ubicación</TableHead>
          <TableHead>Número de Estudiantes</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schools.map((school) => (
          <TableRow key={school.id}>
            <TableCell>{school.name}</TableCell>
            <TableCell>{school.administrator}</TableCell>
            <TableCell>{school.location}</TableCell>
            <TableCell>{school.studentCount}</TableCell>
            <TableCell>
              <Button variant="ghost" onClick={() => onEdit(school)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={() => onDelete(school.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost">
                <Eye className="h-4 w-4" />
            </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

