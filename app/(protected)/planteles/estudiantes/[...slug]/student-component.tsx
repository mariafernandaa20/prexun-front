'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Student, Transaction, Card as CardType } from '@/lib/types';
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from '@/components/ui/table';
import { getStudent, deleteChargeImage, getStudentNotes } from '@/lib/api';
import ChargesForm from '@/components/dashboard/estudiantes/charges-form';
import { formatTime, getPaymentMethodLabel } from '@/lib/utils';
import EditarFolio from '../../ingresos/EditarFolio';
import Purchace from './purchace';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import Link from 'next/link';
import { Eye, History, Trash2, StickyNote } from 'lucide-react';
import UpdatePersonalInfo from '@/components/dashboard/UpdatePersonalInfo';
import UpdatePassword from '@/components/dashboard/UpdatePassword';
import axiosInstance from '@/lib/api/axiosConfig';
import SectionContainer from '@/components/SectionContainer';
import StudentPeriod from '../student-period';
import StudentLogs from './StudentLogs';
import StudentNotes from './StudentNotes';
import StudentDebtsManager from '@/components/dashboard/estudiantes/StudentDebtsManager';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import StudentAttendance from './StudentAttendance';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import StudentGrades from '@/components/students/StudentGrades';
import { StudentTagsSelector } from '@/components/students/StudentTagsSelector';

interface TransactionsTableProps {
  transactions: Transaction[];
  onUpdateTransaction: (updatedTransaction: Transaction) => void;
  cards: CardType[];
  showNotes: boolean;
  onRefresh: () => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onUpdateTransaction,
  cards,
  showNotes,
  onRefresh,
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>Acciones</TableHead>
        <TableHead>Folio</TableHead>
        <TableHead>Método</TableHead>
        <TableHead>Monto</TableHead>
        <TableHead>Fecha</TableHead>
        <TableHead>Fecha de pago</TableHead>
        <TableHead>Fecha Limite de Pago</TableHead>
        {showNotes && <TableHead>Notas</TableHead>}
        <TableHead>Pagado</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {transactions.map((transaction) => (
        <TableRow key={transaction.id}>
          <TableCell>{transaction.id}</TableCell>
          <TableCell>
            <div className="flex justify-left items-center gap-2">
              <Link href={`/recibo/${transaction.uuid}`} target="_blank">
                <Eye className="w-4 h-4 mr-2" />
              </Link>
              <EditarFolio
                transaction={transaction}
                onSuccess={() => onRefresh()} // Esto refresca la lista al terminar
              />
              <ChargesForm
                campusId={transaction.campus_id}
                cards={cards}
                fetchStudents={onRefresh}
                student_id={transaction.student_id}
                transaction={transaction}
                formData={transaction}
                setFormData={() => { }}
                onTransactionUpdate={onUpdateTransaction}
                icon={false}
              />
              {transaction.image && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={async () => {
                    if (confirm('¿Estás seguro de eliminar el comprobante de esta transacción?')) {
                      try {
                        await deleteChargeImage(transaction.id!);
                        onRefresh();
                      } catch (error) {
                        console.error('Error al eliminar imagen:', error);
                      }
                    }
                  }}
                  title="Eliminar Comprobante"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </TableCell>
          <TableCell>


            {transaction?.paid ? (
              <>
                {transaction?.folio_new + ' '}
                {(
                  transaction?.folio ??
                  transaction?.folio_cash ??
                  transaction?.folio_transfer ??
                  0
                )
                  .toString()
                  .padStart(4, '0')}
              </>
            ) : (
              'No Pagado'
            )}

          </TableCell>

          <TableCell>
            {getPaymentMethodLabel(transaction.payment_method)}
          </TableCell>
          <TableCell>${transaction.amount}</TableCell>
          <TableCell>{formatTime({ time: transaction.created_at })}</TableCell>
          <TableCell>
            {formatTime({ time: transaction.payment_date })}
          </TableCell>
          <TableCell>
            {transaction.expiration_date
              ? formatTime({ time: transaction.expiration_date })
              : 'Sin vencimiento'}
          </TableCell>
          {showNotes && <TableCell>{transaction.notes}</TableCell>}
          <TableCell>{transaction.paid !== 0 ? 'Sí' : 'No'}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

interface UseStudentData {
  student: Student | null;
  loading: boolean;
  error: Error | null;
  updateTransaction: (updatedTransaction: Transaction) => void;
  refetch: () => void;
  cards: CardType[];
  notesCount: number;
}

function useStudentData(studentId: number, campusId?: number): UseStudentData {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [notesCount, setNotesCount] = useState(0);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const studentData = await getStudent(studentId);
      setStudent(studentData);

      const notesData = await getStudentNotes(studentId);
      setNotesCount(notesData.notes?.length || 0);

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Error al cargar datos del estudiante')
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    if (!campusId) return;
    try {
      const response = await axiosInstance.get('/cards', {
        params: { campus_id: campusId },
      });
      setCards(response.data);
    } catch {
      setCards([]);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  useEffect(() => {
    fetchCards();
  }, [campusId]);

  const updateTransaction = (updatedTransaction: Transaction) => {
    setStudent((prevStudent) => {
      if (!prevStudent) return null;
      const transactionExists = prevStudent.transactions.some(
        (t) => t.id === updatedTransaction.id
      );
      return {
        ...prevStudent,
        transactions: transactionExists
          ? prevStudent.transactions.map((transaction) =>
            transaction.id === updatedTransaction.id
              ? updatedTransaction
              : transaction
          )
          : [...prevStudent.transactions, updatedTransaction],
      };
    });
  };

  return {
    student,
    loading,
    error,
    updateTransaction,
    refetch: fetchStudent,
    cards,
    notesCount,
  };
}

export function StudentComponent({ slug }: { slug: string[] }) {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { SAT } = useFeatureFlags();
  // El ID sigue viniendo del slug del path
  const studentId = Number(slug.join('/'));

  // La pestaña ahora viene de los query params ?tab=...
  const activeTab = searchParams.get('tab') || 'pagos';

  const campusId = useActiveCampusStore((state) => state.activeCampus?.id);
  const { student, loading, error, updateTransaction, refetch, cards, notesCount } =
    useStudentData(studentId, campusId);
  const [showNotes, setShowNotes] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const handleTabChange = (value: string) => {
    // Creamos una nueva instancia de los params actuales
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);

    // Usamos replace con scroll: false para que sea instantáneo y no "salte" la página
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!student) return <div>No se encontró el estudiante</div>;

  const handlePurchaseComplete = (newTransaction: Transaction) => {
    updateTransaction(newTransaction);
  };

  const studentForUpdatePersonalInfo = {
    ...student,
    id: Number(student.id),
  };

  return (
    <div className="space-y-4 ">
      <Card className="w-full">
        <CardHeader className="sticky top-0 z-8 bg-card">

          <div className='grid grid-cols-1 xl:grid-cols-4 gap-4'>
            <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className='md:col-span-2 lg:col-span-3'>
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <h1 className="text-2xl font-bold">
                    {student.firstname} {student.lastname}
                  </h1>
                  <div className="flex gap-2">
                    <Purchace
                      campusId={campusId}
                      studentId={student.id}
                      onPurchaseComplete={handlePurchaseComplete}
                    />
                    <UpdatePersonalInfo student={studentForUpdatePersonalInfo} />
                    <UpdatePassword studentId={Number(student.id)} />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setHistoryOpen(true)}
                      title="Ver Historial"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setNotesOpen(true)}
                      title="Ver Notas"
                      className="relative"
                    >
                      <StickyNote className="w-4 h-4" />
                      {notesCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px] h-[18px] border-2 border-white">
                          {notesCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2 ">
                <h3 className="font-semibold">Información Personal</h3>
                <p>
                  <span className="text-muted-foreground">Matricula:</span>{' '}
                  {student.id}
                </p>
                <p>
                  <span className="text-muted-foreground">Moodle User:</span>{' '}
                  {student.id}
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  {student.email || 'No registrado'}
                </p>
                <p>
                  <span className="text-muted-foreground">Teléfono:</span>{' '}
                  {student.phone || 'No registrado'}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Estado Académico</h3>
                <p>
                  <span className="text-muted-foreground">Estatus:</span>{' '}
                  {student.status || 'Activo'}
                </p>
                <p>
                  <span className="text-muted-foreground">Grupo:</span>{' '}
                  {student?.grupo ? student.grupo.name : (student?.grupo_id || 'No asignado')}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Semana Intensiva:
                  </span>{' '}
                  {student.semana_intensiva_id || 'No asignado'}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Fecha de registro:
                  </span>{' '}
                  {formatTime({ time: student.created_at })}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Etiquetas</h3>
                <StudentTagsSelector
                  studentId={Number(student.id)}
                  initialTags={(student.tags || []).map(tag => ({
                    id: tag.id,
                    name: tag.name,
                    campus_id: tag.campus_id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }))}
                  onTagsChange={(tags) => {
                    if (student) {
                      student.tags = tags;
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Resumen de Pagos</h3>
                <p>
                  <span className="text-muted-foreground">
                    Total de transacciones:
                  </span>{' '}
                  {student.transactions?.length || 0}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Pagos pendientes:
                  </span>{' '}
                  {student.transactions?.filter((t) => t.paid === 0).length ||
                    0}
                </p>
                <p>
                  <span className="text-muted-foreground">Último pago:</span>{' '}
                  {student.transactions?.length
                    ? formatTime({
                      time: student.transactions[
                        student.transactions.length - 1
                      ].payment_date,
                    })
                    : 'Sin pagos'}
                </p>
              </div>

            </div>
            <StudentAttendance studentId={student.id} />
          </div>
        </CardHeader>
        <CardContent>

        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pagos">Pagos y Deudas</TabsTrigger>
          <TabsTrigger value="asignacion">Asignación</TabsTrigger>
        </TabsList>

        <TabsContent value="pagos" className="space-y-4">
          <div className='flex flex-col gap-4'>
            {!SAT && (
              <div className="lg:col-span-2">
                <StudentDebtsManager
                  studentId={Number(student.id)}
                  onTransactionUpdate={updateTransaction}
                />
              </div>
            )}

            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">
                      Historial de Transacciones
                    </h2>
                    <Label className="flex items-center gap-2">
                      Mostrar notas{' '}
                      <Checkbox
                        checked={showNotes}
                        onCheckedChange={() => setShowNotes(!showNotes)}
                      />
                    </Label>
                  </div>
                </CardHeader>
                <CardContent>
                  <SectionContainer>
                    {student.transactions && (
                      <TransactionsTable
                        transactions={student.transactions}
                        onUpdateTransaction={updateTransaction}
                        onRefresh={refetch}
                        cards={cards}
                        showNotes={showNotes}
                      />
                    )}
                  </SectionContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="asignacion" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className='col-span-2 flex-col flex gap-4'>
              <StudentPeriod student={student} onRefresh={refetch} />
              <StudentGrades studentId={student.id} />

            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial de {student.firstname}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <StudentLogs studentId={student.id} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notas de {student.firstname}</DialogTitle>
          </DialogHeader>

        </DialogContent>
      </Dialog>
    </div>
  );
}
