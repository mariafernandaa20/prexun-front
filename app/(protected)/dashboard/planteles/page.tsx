"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { MultiSelect } from "@/components/multi-select";
import {
  getCampuses,
  createCampus,
  updateCampus,
  deleteCampus,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/api/axiosConfig";
import { Campus } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  const { toast } = useToast();

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [administrators, setAdministrators] = useState<
    { id: string; name: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Campus>({
    name: "",
    titular: "",
    rfc: "",
    code: "",
    description: "",
    address: "",
    is_active: true,
    admin_ids: [],
    folio_inicial: 1,
  });

  useEffect(() => {
    fetchCampuses();
    fetchAdministrators();
  }, []);

  const fetchCampuses = async () => {
    try {
      setIsLoading(true);
      const response = await getCampuses();
      setCampuses(response);
      setIsLoading(false);
    } catch (error) {
      toast({ title: "Error al cargar planteles" });
      setIsLoading(false);
    }
  };

  const fetchAdministrators = async () => {
    try {
      const response = await axiosInstance.get("/users?role=admin");
      setAdministrators(
        response.data.map((admin: any) => ({
          id: admin.id.toString(),
          name: admin.name,
        }))
      );
    } catch (error) {
      toast({ title: "Error al cargar administradores" });
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedCampus(null);
    setFormData({
      name: "",
      titular: "",
      code: "",
      description: "",
      address: "",
      is_active: true,
      admin_ids: [],
      folio_inicial: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (campus: Campus) => {
    setSelectedCampus(campus);
    setFormData({
      name: campus.name,
      titular: campus.titular,
      rfc: campus.rfc,
      code: campus.code,
      description: campus.description,
      address: campus.address,
      is_active: campus.is_active,
      admin_ids: campus.users?.map(user => user.id.toString()) || [],
      folio_inicial: campus.folio_inicial,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCampus) {
        const campusRequest: Campus = {
          id: selectedCampus.id,
          name: formData.name,
          code: formData.code,
          description: formData.description,
          address: formData.address,
          is_active: formData.is_active,
          admin_ids: formData.admin_ids || [],
          folio_inicial: formData.folio_inicial,
        };
        const response = await updateCampus(campusRequest);
        setCampuses(
          campuses.map((c) => (c.id === selectedCampus.id ? response : c))
        );
        toast({ title: "Plantel actualizado correctamente" });
      } else {
        const campusRequest: Campus = {
          name: formData.name,
          code: formData.code,
          description: formData.description,
          address: formData.address,
          is_active: formData.is_active,
          admin_ids: formData.admin_ids || [],
          folio_inicial: formData.folio_inicial,
        };
        const response = await createCampus(campusRequest);
        setCampuses([...campuses, response]);
        toast({ title: "Plantel creado correctamente" });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error al guardar plantel",
        description: error.response?.data?.message || "Intente nuevamente",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCampus) return;

    try {
      await deleteCampus(selectedCampus.id);
      setCampuses(campuses.filter((c) => c.id !== selectedCampus.id));
      toast({ title: "Plantel eliminado correctamente" });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({ title: "Error al eliminar plantel" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdministratorChange = (selectedAdmins: string[]) => {
    setFormData((prev) => ({
      ...prev,
      admin_ids: selectedAdmins,
    }));
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Planteles</h2>
            <Button variant="secondary" onClick={handleOpenCreateModal}>
              <Plus className="mr-2 h-4 w-4" /> Crear Plantel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4">


            {/* Tabla de Planteles */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Titular</TableHead>
                  <TableHead>RFC</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Usuarios Asignados</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campuses ? (
                  campuses.map((campus) => (
                    <TableRow key={campus.id}>
                      <TableCell>{campus.name}</TableCell>
                      <TableCell>{campus.titular}</TableCell>
                      <TableCell>{campus.rfc}</TableCell>
                      <TableCell>{campus.code}</TableCell>
                      <TableCell>{campus.address || "No especificada"}</TableCell>
                      <TableCell>
                        <span
                          className={
                            campus.is_active ? "text-green-600" : "text-red-600"
                          }
                        >
                          {campus.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {campus.users && campus.users.length > 0 ? (
                          <div className="max-h-20 overflow-y-auto">
                            {campus.users.map((user) => (
                              <div key={user.id} className="text-sm">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-muted-foreground ml-2">
                                  ({user.role})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin usuarios</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditModal(campus)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCampus(campus);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No hay planteles disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Modal de Creación/Edición */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} modal={false}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedCampus ? "Editar Plantel" : "Crear Plantel"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedCampus
                      ? "Modifica los datos del plantel"
                      : "Introduce los datos del nuevo plantel"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 w-full gap-4 max-h-[80vh] overflow-y-auto">
                  <div>
                    <Label htmlFor="name">Nombre del Plantel</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="titular">Titular</Label>
                    <Input
                      id="titular"
                      name="titular"
                      value={formData.titular}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rfc">RFC</Label>
                    <Input
                      id="rfc"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="folio_inicial">Folio Inicial</Label>
                    <Input
                      id="folio_inicial"
                      name="folio_inicial"
                      value={formData.folio_inicial}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="code">Código del Plantel</Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="is_active">Plantel Activo</Label>
                  </div>

                  <div className="col-span-full">
                    <Label>Administradores</Label>
                    <MultiSelect
                      options={administrators.map((admin) => ({
                        value: admin.id.toString(),
                        label: admin.name,
                      }))}
                      selectedValues={formData.admin_ids || []}
                      onSelectedChange={handleAdministratorChange}
                      title="Administradores"
                      placeholder="Seleccionar administradores"
                      searchPlaceholder="Buscar administrador..."
                      emptyMessage="No se encontraron administradores"
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {selectedCampus ? "Actualizar" : "Crear"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Diálogo de Confirmación de Eliminación */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Estás seguro?</DialogTitle>
                  <DialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente el
                    plantel.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Eliminar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
