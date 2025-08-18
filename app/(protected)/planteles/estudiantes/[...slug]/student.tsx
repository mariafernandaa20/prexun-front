"use client";
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Student, Transaction, Card as CardType } from "@/lib/types";
import { Table, TableCell, TableHead, TableHeader, TableRow, TableBody } from '@/components/ui/table'
import { getStudent } from '@/lib/api';
import ChargesForm from '@/components/dashboard/estudiantes/charges-form'
import { formatTime, getPaymentMethodLabel } from '@/lib/utils';
import Purchace from './purchace';
import { useActiveCampusStore } from '@/lib/store/plantel-store'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import UpdatePersonalInfo from '@/components/dashboard/UpdatePersonalInfo'
import axiosInstance from '@/lib/api/axiosConfig'
import SectionContainer from '@/components/SectionContainer'
import StudentPeriod from '../student-period'
import StudentLogs from './StudentLogs'
import StudentNotes from './StudentNotes'
import StudentDebtsManager from '@/components/dashboard/estudiantes/StudentDebtsManager'


interface TransactionsTableProps {
  transactions: Transaction[];
  onUpdateTransaction: (updatedTransaction: Transaction) => void;
  cards: CardType[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, onUpdateTransaction, cards }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>Folio</TableHead>
        <TableHead>Folio Nuevo</TableHead>
        <TableHead>Folio Efectivo</TableHead>
        <TableHead>Folio Transferencia</TableHead>
        <TableHead>Método</TableHead>
        <TableHead>Monto</TableHead>
        <TableHead>Fecha</TableHead>
        <TableHead>Fecha de pago</TableHead>
        <TableHead>Fecha Limite de Pago</TableHead>
        <TableHead>Notas</TableHead>
        <TableHead>Pagado</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {transactions.map((transaction) => (
        <TableRow key={transaction.id}>
          <TableCell>{transaction.id}</TableCell>
          <TableCell>{transaction?.folio}</TableCell>
          <TableCell>{transaction?.folio_new}</TableCell>
          <TableCell>{transaction?.folio_cash}</TableCell>
          <TableCell>{transaction?.folio_transfer}</TableCell>
          <TableCell>{getPaymentMethodLabel(transaction.payment_method)}</TableCell>
          <TableCell>${transaction.amount}</TableCell>
          <TableCell>{formatTime({ time: transaction.created_at })}</TableCell>
          <TableCell>{formatTime({ time: transaction.payment_date })}</TableCell>
          <TableCell>{transaction.expiration_date ? formatTime({ time: transaction.expiration_date }) : "Sin vencimiento"}</TableCell>
          <TableCell>{transaction.notes}</TableCell>
          <TableCell>{transaction.paid !== 0 ? "Sí" : "No"}</TableCell>
          <TableCell>
            <div className="flex justify-left items-center gap-2">
              <Link href={`/recibo/${transaction.uuid}`} target="_blank">
                <Eye className="w-4 h-4 mr-2" />
              </Link>
              <ChargesForm
                  campusId={transaction.campus_id}
                  cards={cards}
                  fetchStudents={() => { }}
                  student_id={transaction.student_id}
                  transaction={transaction}
                  formData={transaction}
                  setFormData={() => { }}
                  onTransactionUpdate={onUpdateTransaction}
                  mode="update"
                  student={null}
                  icon={false}
                />
            </div>
          </TableCell>
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
}

function useStudentData(studentId: number, campusId?: number): UseStudentData {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const response = await getStudent(studentId);
      setStudent(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar estudiante"));
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    if (!campusId) return;
    try {
      const response = await axiosInstance.get("/cards", { params: { campus_id: campusId } });
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
    setStudent(prevStudent => {
      if (!prevStudent) return null;
      const transactionExists = prevStudent.transactions.some(t => t.id === updatedTransaction.id);
      return {
        ...prevStudent,
        transactions: transactionExists
          ? prevStudent.transactions.map(transaction =>
            transaction.id === updatedTransaction.id ? updatedTransaction : transaction
          )
          : [...prevStudent.transactions, updatedTransaction]
      };
    });
  };

  return { student, loading, error, updateTransaction, refetch: fetchStudent, cards };
}

export function StudentComponent({ slug }: { slug: string[] }) {
  const studentId = Number(slug.join("/"));
  const campusId = useActiveCampusStore((state) => state.activeCampus?.id);
  const { student, loading, error, updateTransaction, refetch, cards } = useStudentData(studentId, campusId);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!student) return <div>No se encontró el estudiante</div>;

  const handlePurchaseComplete = (newTransaction: Transaction) => {
    updateTransaction(newTransaction);
  };

  const studentForUpdatePersonalInfo = {
    ...student,
    id: typeof student.id === "string" ? Number(student.id) : student.id
  };

  return (
    <div className="space-y-4 ">
      <Card className="w-full">
        <CardHeader className="sticky top-0 z-8 bg-card">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold">{student.firstname} {student.lastname}</h1>
            <div className="flex gap-2">
              <Purchace
                campusId={campusId}
                studentId={student.id}
                onPurchaseComplete={handlePurchaseComplete}
              />
              <UpdatePersonalInfo student={studentForUpdatePersonalInfo} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SectionContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="space-y-2">
                <h3 className="font-semibold">Información Personal</h3>
                <p><span className="text-muted-foreground">Matricula:</span> {student.id}</p>
                <p><span className="text-muted-foreground">Moodle User:</span> {student.id}</p>
                <p><span className="text-muted-foreground">Email:</span> {student.email || "No registrado"}</p>
                <p><span className="text-muted-foreground">Teléfono:</span> {student.phone || "No registrado"}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Estado Académico</h3>
                <p><span className="text-muted-foreground">Estatus:</span> {student.status || "Activo"}</p>
                <p><span className="text-muted-foreground">Grupo:</span> {student.grupo_id || "No asignado"}</p>
                <p><span className="text-muted-foreground">Semana Intensiva:</span> {student.semana_intensiva_id || "No asignado"}</p>
                <p><span className="text-muted-foreground">Fecha de registro:</span> {formatTime({ time: student.created_at })}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Resumen de Pagos</h3>
                <p><span className="text-muted-foreground">Total de transacciones:</span> {student.transactions?.length || 0}</p>
                <p><span className="text-muted-foreground">Pagos pendientes:</span> {student.transactions?.filter(t => t.paid === 0).length || 0}</p>
                <p><span className="text-muted-foreground">Último pago:</span> {student.transactions?.length ? formatTime({ time: student.transactions[student.transactions.length - 1].payment_date }) : "Sin pagos"}</p>
              </div>
            </div>
          </SectionContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-2">
          <StudentDebtsManager
            studentId={Number(student.id)}
            onTransactionUpdate={updateTransaction}
          />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Historial de Transacciones</h2>
            </CardHeader>
            <CardContent>
              <SectionContainer>
                {student.transactions && (
                  <TransactionsTable
                    transactions={student.transactions}
                    onUpdateTransaction={updateTransaction}
                    cards={cards}
                  />
                )}
              </SectionContainer>
            </CardContent>
          </Card>
        </div>
        <div>
          <StudentPeriod student={student} onRefresh={refetch} />
        </div>
        <div>
          <StudentNotes studentId={student.id.toString()} />
        </div>
        <div className="lg:col-span-2">
          <StudentLogs studentId={student.id} />
        </div>
      </div>
    </div>
  );
}