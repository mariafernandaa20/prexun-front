import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { importStudents } from '@/lib/api'

export function ImportStudent({fetchStudents, campusId}: {fetchStudents: () => void, campusId: string}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    handleFileSelection(droppedFile)
  }

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile?.type !== 'text/csv') {
      toast({
        title: 'Error',
        description: 'Solo se permiten archivos CSV',
        variant: 'destructive'
      })
      return
    }
    setFile(selectedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelection(selectedFile)
    }
  }
  const handleFileUpload = async () => {
    if (!file) return

    try {
      const response = await importStudents(file, campusId)
      
      toast({
        title: 'Éxito',
        description: response.message
      })
      setIsOpen(false)
      setFile(null)
      fetchStudents()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al importar estudiantes',
        variant: 'destructive'
      })
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Upload className="mr-2 h-4 w-4" /> Importar
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Estudiantes</DialogTitle>
          </DialogHeader>

          <div
            className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
            {file ? (
              <div>
                <p className="mb-2">Archivo seleccionado:</p>
                <p className="font-medium">{file.name}</p>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Arrastra y suelta un archivo CSV aquí o haz clic para seleccionar</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFileUpload} disabled={!file}>
              Importar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
