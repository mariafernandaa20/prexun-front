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
import { Campus, Grupo } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  const { toast } = useToast();

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [administrators, setAdministrators] = useState<
    { id: string; name: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // ✅ TIPADO FIJO AQUÍ
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
    grupo_ids: [], // Array de strings
  });

  const [grupos, setGrupos] = useState<Grupo[]>([]);

  useEffect(() => {
    fetchCampuses();
    fetchAdministrators();
    fetchGrupos();
  }, []);

  const fetchGrupos = async () => {
    try {
      const response = await axiosInstance.get('/grupos');
      setGrupos(response.data);
    } catch (error) {
      toast({ title: "Error al cargar grupos" });
    }
  };

  const fetchAdministrators = async () => {
    try {
      const response = await axiosInstance.get('/users');
      setAdministrators(response.data.map((user: any) => ({
        id: user.id,
        name: user.name
      })));
    } catch (error) {
      toast({ title: "Error al cargar administradores" });
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await getCampuses();
      setCampuses(response);
      setIsLoading(false);
    } catch (error) {
      toast({ title: "Error al cargar planteles" });
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedCampus(null);
    setFormData({
      name: "",
      titular: "",
      code: "",
      rfc: "",
      description: "",
      address: "",
      is_active: true,
      admin_ids: [],
      folio_inicial: 1,
      grupo_ids: [],
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
      grupo_ids: campus.grupos?.map(grupo => grupo.id.toString()) || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const campusRequest: Campus = {
        ...(selectedCampus?.id ? { id: selectedCampus.id } : {}),
        name: formData.name,
        titular: formData.titular,
        rfc: formData.rfc,
        code: formData.code,
        description: formData.description,
        address: formData.address,
        is_active: formData.is_active,
        admin_ids: formData.admin_ids || [],
        folio_inicial: formData.folio_inicial,
        grupo_ids: formData.grupo_ids // Asegurarse que se envían como array de strings
      };

      const response = selectedCampus
        ? await updateCampus(campusRequest)
        : await createCampus(campusRequest);

      // Actualizar el estado asegurando que los grupos se mantengan
      setCampuses(prev =>
        selectedCampus
          ? prev.map((c) => {
              if (c.id === selectedCampus.id) {
                return {
                  ...response,
                  grupos: response.grupos || [] // Asegurar que grupos esté definido
                };
              }
              return c;
            })
          : [...prev, { ...response, grupos: response.grupos || [] }]
      );

      toast({ title: `Plantel ${selectedCampus ? 'actualizado' : 'creado'} correctamente` });
      setIsModalOpen(false);
      handleCloseModal();
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      titular: "",
      rfc: "",
      code: "",
      description: "",
      address: "",
      is_active: true,
      admin_ids: [],
      folio_inicial: 1,
      grupo_ids: []
    });
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
                  <TableHead>Grupos de Estudiantes</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Cargando planteles...
                    </TableCell>
                  </TableRow>
                ) : campuses.length > 0 ? (
                  campuses.map((campus) => (
                    <TableRow key={campus.id}>
                      <TableCell>{campus.name}</TableCell>
                      <TableCell>{campus.titular}</TableCell>
                      <TableCell>{campus.rfc}</TableCell>
                      <TableCell>{campus.code}</TableCell>
                      <TableCell>{campus.address || "No especificada"}</TableCell>
                      <TableCell>
                        <span className={campus.is_active ? "text-green-600" : "text-red-600"}>
                          {campus.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {campus.users && campus.users.length > 0 ? (
                          <div className="max-h-20 overflow-y-auto">
                            {campus.users.map((user, index) => (
                              <div key={`${campus.id}-user-${index}`} className="text-sm">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-muted-foreground ml-2">({user.role})</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin usuarios</span>
                        )}
                      </TableCell>
                     <TableCell>
  {campus.grupos?.length ? (
    <div className="max-h-20 overflow-y-auto">
      {campus.grupos.map((grupo) => (
        <div key={`grupo-${campus.id}-${grupo.id}`} className="text-sm">
          <span className="font-medium">{grupo.name}</span>
        </div>
      ))}
    </div>
  ) : (
    <span className="text-muted-foreground">Sin grupos asignados</span>
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
                    <TableCell colSpan={9} className="text-center">
                      No hay planteles disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Modal de Creación/Edición */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal} modal={true}>
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

                <form onSubmit={handleSubmit} className="grid grid-cols-2 w-full gap-2 max-h-[80vh] overflow-y-auto">
                  <div>
                    <Label htmlFor="name">Nombre del Plantel</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="titular">Titular</Label>
                    <Input id="titular" name="titular" value={formData.titular} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="rfc">RFC</Label>
                    <Input id="rfc" name="rfc" value={formData.rfc} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="folio_inicial">Folio Inicial</Label>
                    <Input id="folio_inicial" name="folio_inicial" value={formData.folio_inicial} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="code">Código del Plantel</Label>
                    <Input id="code" name="code" value={formData.code} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Input id="description" name="description" value={formData.description} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="h-4 w-4" />
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
                  <div className="col-span-full">
                    <Label>Grupos de Estudiantes</Label>
                    <MultiSelect
                      options={grupos.map((grupo) => ({
                        value: grupo.id.toString(),
                        label: grupo.name,
                      }))}
                      selectedValues={formData.grupo_ids || []}
                      onSelectedChange={(selectedGroups) => {
                        setFormData(prev => ({
                          ...prev,
                          grupo_ids: selectedGroups
                        }));
                      }}
                      title="Grupos"
                      placeholder="Seleccionar grupos"
                      searchPlaceholder="Buscar grupo..."
                      emptyMessage="No se encontraron grupos"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                    <Button type="submit">{selectedCampus ? "Actualizar" : "Crear"}</Button>
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
                    Esta acción no se puede deshacer. Se eliminará permanentemente el plantel.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                  <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
