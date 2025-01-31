"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import axiosInstance from "@/lib/api/axiosConfig"
import { toast } from "@/hooks/use-toast"

export default function SyncMoodle() {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSyncMoodle = async () => {
    setStatus("loading")
    try {
      const response = await axiosInstance.post("/students/sync-module")
      console.log(response.data)
      setStatus("success")
      toast({
        title: "Sincronización exitosa",
        description: "Los datos de Moodle se han sincronizado correctamente.",
      })
    } catch (error) {
      console.error(error)
      setStatus("error")
      toast({
        title: "Error de sincronización",
        description: "Hubo un problema al sincronizar con Moodle. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    }
    setTimeout(() => setStatus("idle"), 3000)
  }

  const buttonVariants = {
    idle: { scale: 1 },
    loading: { scale: 0.95 },
    success: { scale: 1.05 },
    error: { scale: 1.05 },
  }

  const getButtonContent = () => {
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

  const getButtonText = () => {
    switch (status) {
      case "loading":
        return "Sincronizando..."
      case "success":
        return "Sincronizado"
      case "error":
        return "Error"
      default:
        return "Sincronizar Moodle"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            variants={buttonVariants}
            animate={status}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Button
              onClick={handleSyncMoodle}
              disabled={status === "loading"}
              className={`min-w-[200px] ${
                status === "success"
                  ? "bg-green-500 hover:bg-green-600"
                  : status === "error"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
              } text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300`}
            >
              {getButtonContent()}
              {getButtonText()}
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sincroniza los datos más recientes de Moodle</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

