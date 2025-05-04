'use client'
import axiosInstance from '@/lib/api/axiosConfig';
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';

export default function CohortesPage() {
    const [cohortes, setCohortes] = React.useState([]);
    const [generating, setGenerating] = React.useState(false);
    const [syncing, setSyncing] = React.useState(false); // Nuevo estado para el botón de sincronización

    React.useEffect(() => {
        fetchCohortes();
    }, []);

    const fetchCohortes = async () => {
        try {
            const response = await axiosInstance.get('/cohortes');
            setCohortes(response.data);
        } catch (error) {
            console.error('Error fetching cohortes:', error);
        }
    };

    const generateCohortes = async () => {
        setGenerating(true);
        try {
            const response = await axiosInstance.post('/cohortes/generate');
            fetchCohortes();
        } catch (error) {
            console.error('Error generating cohortes:', error);
        } finally {
            setGenerating(false);
        }
    };

    const syncWithMoodle = async () => {
        setSyncing(true);
        try {
            const response = await axiosInstance.post('/cohorts/sync');
        } catch (error) {
            console.error('Error syncing with Moodle:', error);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Cohortes</h2>

            <Button onClick={generateCohortes} disabled={generating} className="mr-2">
                {generating ? 'Generando...' : 'Generar Cohortes'}
            </Button>

            <Button onClick={syncWithMoodle} disabled={syncing}> {/* Nuevo botón */}
                {syncing ? 'Sincronizando...' : 'Sincronizar con Moodle'}
            </Button>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Periodo</TableHead>
                        <TableHead>Grupo</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cohortes.map((cohorte) => (
                        <TableRow key={cohorte.id}>
                            <TableCell>{cohorte.id}</TableCell>
                            <TableCell>{cohorte.name}</TableCell>
                            <TableCell>{cohorte.period?.name}</TableCell>
                            <TableCell>{cohorte.group?.name}</TableCell>
                        </TableRow>
                    ))}
                    {cohortes.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                No hay cohortes registradas.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}