'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Student, Transaction } from "@/lib/types"
import { Table, TableCell, TableHead, TableHeader, TableRow, TableBody } from '@/components/ui/table'
import { getStudent } from '@/lib/api'
import ChargesForm from '@/components/dashboard/estudiantes/charges-form'
import { formatTime } from '@/lib/utils';
import Purchace from './purchace'
import { useActiveCampusStore } from '@/lib/store/plantel-store'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import UpdatePersonalInfo from '@/components/dashboard/UpdatePersonalInfo'

const PaymentMethod: React.FC<{ method: string }> = ({ method }) => {
    const methods = {
        cash: 'Efectivo',
        transfer: 'Transferencia',
        card: 'Tarjeta'
    }
    return <>{methods[method] || method}</>
}
const parseDenominations = (denominations: any) => {
    if (!denominations) return {};
    if (typeof denominations === 'string') {
        try {
            return JSON.parse(denominations);
        } catch {
            return {};
        }
    }
    return denominations;
};
const TransactionActions: React.FC<{
    transaction: Transaction;
    onTransactionUpdate: (updatedTransaction: Transaction) => void;
}> = ({ transaction, onTransactionUpdate }) => {
    const [formData, setFormData] = useState<Transaction>({
        ...transaction,
        denominations: {},
        notes: transaction.notes || '',
        payment_date: transaction.payment_date || new Date().toISOString().split('T')[0],
        image: transaction.image || null,
    });

    const handleMarkAsPaid = () => {
    };

    if (transaction.paid !== 0) return null;

    return (
        <ChargesForm
            campusId={transaction.campus_id}
            fetchStudents={handleMarkAsPaid}
            student_id={transaction.student_id}
            transaction={transaction}
            formData={formData}
            setFormData={setFormData}
            onTransactionUpdate={onTransactionUpdate}
            mode="update"
            student={null}
            icon={false}
        />
    );
};

const TransactionsTable: React.FC<{
    transactions: Transaction[];
    onUpdateTransaction: (updatedTransaction: Transaction) => void;
}> = ({ transactions, onUpdateTransaction }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Denominaciones</TableHead>
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
                        <TableCell>
                            <PaymentMethod method={transaction.payment_method} />
                        </TableCell>
                        <TableCell>${transaction.amount}</TableCell>
                        <TableCell>
                            {transaction?.denominations && Object.entries(
                                parseDenominations(transaction.denominations)
                            ).map(([denomination, count]) => (
                                `$${denomination} x ${count} `
                            ))}
                        </TableCell>
                        <TableCell>
                            {formatTime({ time: transaction.created_at })}
                        </TableCell>
                        <TableCell>
                            {formatTime({ time: transaction.payment_date })}
                        </TableCell>
                        <TableCell>
                            {transaction.expiration_date ? formatTime({
                                time: transaction.expiration_date
                            }) : 'Sin vencimiento'}
                        </TableCell>
                        <TableCell>{transaction.notes}</TableCell>
                        <TableCell>{transaction.paid !== 0 ? 'Sí' : 'No'}</TableCell>
                        <TableCell>
                            <div className='flex justify-left items-center gap-2'>
                                <Link href={`/recibo/${transaction.uuid}`} target='_blank'>
                                    <Eye className="w-4 h-4 mr-2" />
                                </Link>
                                <TransactionActions
                                    transaction={transaction}
                                    onTransactionUpdate={onUpdateTransaction}
                                />
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

const useStudent = (studentId: number) => {
    const [student, setStudent] = React.useState<Student | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<Error | null>(null)

    const fetchStudent = React.useCallback(async () => {
        try {
            setLoading(true)
            const response = await getStudent(studentId)
            setStudent(response)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Error al cargar estudiante'))
        } finally {
            setLoading(false)
        }
    }, [studentId])

    const updateTransaction = React.useCallback((updatedTransaction: Transaction) => {
        setStudent(prevStudent => {
            if (!prevStudent) return null

            const transactionExists = prevStudent.transactions.some(t => t.id === updatedTransaction.id);

            return {
                ...prevStudent,
                transactions: transactionExists
                    ? prevStudent.transactions.map(transaction =>
                        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
                    )
                    : [...prevStudent.transactions, updatedTransaction]
            }
        })
    }, [])

    React.useEffect(() => {
        fetchStudent()
    }, [fetchStudent])

    return { student, loading, error, updateTransaction }
}

export function StudentComponent({ slug }: { slug: string[] }) {
    const studentId = Number(slug.join('/'))
    const { student, loading, error, updateTransaction } = useStudent(studentId)
    const campusId = useActiveCampusStore((state) => state.activeCampus?.id)
    if (loading) return <div>Cargando...</div>
    if (error) return <div>Error: {error.message}</div>
    if (!student) return <div>No se encontró el estudiante</div>

    const handlePurchaseComplete = (newTransaction: Transaction) => {
        updateTransaction(newTransaction)
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className='sticky top-0 z-10 bg-card'>
                    <div className='flex justify-between items-center'>
                        <h1 className="text-2xl font-bold">{student.firstname} {student.lastname}</h1>
                        <div className='flex gap-4'>
                            <Purchace
                                campusId={campusId}
                                studentId={student.id}
                                onPurchaseComplete={handlePurchaseComplete as any}
                            />
                            <UpdatePersonalInfo student={student} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Información Personal</h3>
                            <p><span className="text-muted-foreground">ID:</span> {student.id}</p>
                            <p><span className="text-muted-foreground">Usuario Moodle:</span> {student.id}</p>
                            <p><span className="text-muted-foreground">Email:</span> {student.email || 'No registrado'}</p>
                            <p><span className="text-muted-foreground">Teléfono:</span> {student.phone || 'No registrado'}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Estado Académico</h3>
                            <p><span className="text-muted-foreground">Estatus:</span> {student.status || 'Activo'}</p>
                            <p><span className="text-muted-foreground">Grupo:</span> {student.grupo_id || 'No asignado'}</p>
                            <p><span className="text-muted-foreground">Fecha de registro:</span> {formatTime({ time: student.created_at })}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Resumen de Pagos</h3>
                            <p><span className="text-muted-foreground">Total de transacciones:</span> {student.transactions?.length || 0}</p>
                            <p><span className="text-muted-foreground">Pagos pendientes:</span> {student.transactions?.filter(t => t.paid === 0).length || 0}</p>
                            <p><span className="text-muted-foreground">Último pago:</span> {student.transactions?.length ? formatTime({ time: student.transactions[student.transactions.length - 1].payment_date }) : 'Sin pagos'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Historial de Transacciones</h2>
                </CardHeader>
                <CardContent>
                    {student.transactions && (
                        <TransactionsTable
                            transactions={student.transactions}
                            onUpdateTransaction={updateTransaction}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}