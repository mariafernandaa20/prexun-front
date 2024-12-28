'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Student, Transaction } from "@/lib/types"
import { Table, TableCell, TableHead, TableHeader, TableRow, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getStudent, updateCharge } from '@/lib/api'
import { FormattedDate } from '@/lib/utils'
import { StudentForm } from '../student-form'
import ChargesForm from '@/components/dashboard/estudiantes/charges-form'

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
        denominations: transaction.denominations || {},
        notes: transaction.notes || '',
    });

    const handleMarkAsPaid = () => {
        console.log(formData);
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
                            <FormattedDate date={transaction.created_at} />
                        </TableCell>
                        <TableCell>
                            <FormattedDate date={transaction.payment_date} />
                        </TableCell>
                        <TableCell>
                            <FormattedDate
                                date={transaction.expiration_date}
                                defaultText="Sin vencimiento"
                            />
                        </TableCell>
                        <TableCell>{transaction.notes}</TableCell>
                        <TableCell>{transaction.paid !== 0 ? 'Sí' : 'No'}</TableCell>
                        <TableCell>
                            <TransactionActions
                                transaction={transaction}
                                onTransactionUpdate={onUpdateTransaction}
                            />
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
            return {
                ...prevStudent,
                transactions: prevStudent.transactions.map(transaction =>
                    transaction.id === updatedTransaction.id ? updatedTransaction : transaction
                )
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

    if (loading) return <div>Cargando...</div>
    if (error) return <div>Error: {error.message}</div>
    if (!student) return <div>No se encontró el estudiante</div>

    return (
        <Card>
            <CardHeader>
                <h1>{student.firstname} {student.lastname}</h1>
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
    )
}