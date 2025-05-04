"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import axiosInstance from "@/lib/api/axiosConfig"
import { toast } from "@/hooks/use-toast"
import { addContactToGoogle } from "@/lib/googleContacts"

export default function SyncMoodle() {
    const [cohortStatus, setCohortStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
    const [userStatus, setUserStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")


    const handleSyncMoodle = async () => {
        setCohortStatus("loading")
        try {
            const response = await axiosInstance.post("/cohorts/sync-all");
            setCohortStatus("success");
            toast({
                title: "Sincronización de Cohorts exitosa",
                description: `
        Total de estudiantes: ${response.data.total_students}
        Asignados exitosamente: ${response.data.success_count}
        Ya asignados: ${response.data.already_assigned_count}
        Sin cohort encontrado: ${response.data.no_cohort_found_count}
        Errores: ${response.data.error_count}
        `,
            });

        } catch (error) {
            console.error(error);
            setCohortStatus("error");

            let errorMessage = "Hubo un problema al sincronizar los cohorts con Moodle.";
            if (error.response && error.response.data && error.response.data.errors) {
                const moodleErrors = error.response.data.errors;
                errorMessage = "Errores de Moodle (Cohorts):\n" + moodleErrors.join("\n");
            } else if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message
            }
            toast({
                title: "Error de sincronización de Cohorts",
                description: errorMessage,
                variant: "destructive",
            });

        } finally {
            setTimeout(() => setCohortStatus("idle"), 3000); 
        }
    };

    const handleSyncUsers = async () => {
        setUserStatus("loading")
        try {
        } catch (error) {
            setUserStatus("error")
            console.log(error)
            let errorMessage = "Hubo un problema al sincronizar los usuarios con Moodle.";
            if (error.response && error.response.data && error.response.data.errors) {
                const moodleErrors = error.response.data.errors;
                errorMessage = "Errores de Moodle (Usuarios):\n" + moodleErrors.join("\n");
            } else if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message
            }

            toast({
                title: "Error de sincronización de Usuarios",
                description: errorMessage,
                variant: "destructive",
            });

        } finally {
            setTimeout(() => setUserStatus("idle"), 3000);
        }

    }

    const handleExportEmailAndGroup = async () => {
        try {
            const response = await axiosInstance.get('/students/export-email-group', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'student_email_group.csv');
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Exportación Exitosa",
                description: "El archivo CSV se ha generado y descargado correctamente.",
            });

        } catch (error) {
            console.error("Error exporting CSV:", error);
             let errorMessage = "Hubo un problema al exportar el archivo CSV.";

            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message; // Backend error message
            }

            toast({
                title: "Error de Exportación",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };


    const getButtonContent = (status) => {
        switch (status) {
            case "loading":
                return <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            case "success":
                return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            case "error":
                return <XCircle className="mr-2 h-4 w-4 text-red-500" />
            default:
                return null
        }
    }
    const getButtonClassName = (status) => {
        switch (status) {
            case "success":
                return "bg-green-500 hover:bg-green-600 text-white";
            case "error":
                return "bg-red-500 hover:bg-red-600 text-white";
            default:
                return "bg-blue-500 hover:bg-blue-600 text-white";
        }
    };


    return (
        <div className="flex space-x-4">
            <Button
                onClick={handleSyncMoodle}
                disabled={cohortStatus === "loading" || userStatus === 'loading'}
                className={`min-w-[200px] ${getButtonClassName(cohortStatus)} font-semibold py-2 px-4 rounded-lg transition-colors duration-300`}
            >
                {getButtonContent(cohortStatus)}
                {cohortStatus === "loading" ? "Sincronizando..." : cohortStatus === 'success' ? "Cohorts Sincronizados" : cohortStatus === 'error' ? "Error" : "Sincronizar Cohorts"}
            </Button>
            <Button
                onClick={handleSyncUsers}
                disabled={userStatus === "loading" || cohortStatus === 'loading'}
                className={`min-w-[200px] ${getButtonClassName(userStatus)} font-semibold py-2 px-4 rounded-lg transition-colors duration-300`}

            >
                {getButtonContent(userStatus)}
                {userStatus === "loading" ? "Sincronizando..." : userStatus === 'success' ? "Usuarios Sincronizados" : userStatus === 'error' ? 'Error' : "Sincronizar Usuarios"}
            </Button>
             <Button
                onClick={handleExportEmailAndGroup}
                //  Optionally disable while other operations are in progress
                disabled={userStatus === "loading" || cohortStatus === 'loading'}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
                Exportar CSV
            </Button>
        </div>
    )
}