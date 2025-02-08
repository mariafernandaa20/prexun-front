"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import axiosInstance from "@/lib/api/axiosConfig"
import { toast } from "@/hooks/use-toast"

export default function SyncMoodle() {
    const [cohortStatus, setCohortStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
    const [userStatus, setUserStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")


    const handleSyncMoodle = async () => {
        setCohortStatus("loading")
        try {
            //Cohorts
            const response = await axiosInstance.post("/cohorts/sync-all"); // Cambia la ruta

            //Procesa respuesta
            console.log(response.data);
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
               //Errores especificos
                const moodleErrors = error.response.data.errors;
                errorMessage = "Errores de Moodle (Cohorts):\n" + moodleErrors.join("\n");
            } else if (error.response && error.response.data && error.response.data.message){
                //Errores del Backend
                errorMessage = error.response.data.message
            }

            toast({
                title: "Error de sincronización de Cohorts",
                description: errorMessage,
                variant: "destructive",
            });

        } finally {
             setTimeout(() => setCohortStatus("idle"), 3000); //Vuelve a idle
        }
    };

      const handleSyncUsers = async() => {
         setUserStatus("loading")
        try {
            //Usuarios
            const usersResponse = await axiosInstance.post("/students/sync-module") // Cambia la ruta
            console.log(usersResponse.data)
            setUserStatus("success")
             toast({
                title: "Sincronización de usuarios exitosa",
                description: `Usuarios Creados: ${usersResponse.data.length}`,
            });


        } catch (error){
            setUserStatus("error")
            console.log(error)
              let errorMessage = "Hubo un problema al sincronizar los usuarios con Moodle.";
            if (error.response && error.response.data && error.response.data.errors) {
              //Errores de Moodle
                const moodleErrors = error.response.data.errors;
                errorMessage = "Errores de Moodle (Usuarios):\n" + moodleErrors.join("\n");
            } else if (error.response && error.response.data && error.response.data.message){
                //Errores del Backend
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
        return "bg-blue-500 hover:bg-blue-600 text-white"; // Default Shadcn button style
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
        </div>
    )
}