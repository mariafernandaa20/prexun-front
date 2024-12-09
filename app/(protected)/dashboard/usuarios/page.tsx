"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { User, UserFormData } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MultiSelect } from "@/components/multi-select";
import { createUser, deleteUser, getCampuses, getUsers, updateUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/api/axiosConfig";
import { useActiveCampusStore } from "@/lib/store/plantel-store";

export default function page() {
  const { toast } = useToast();
  const activeCampus = useActiveCampusStore((state) => state.activeCampus);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [campuses, setCampuses] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState<UserFormData>({
    id: undefined,
    name: "",
    email: "",
    role: "admin",
    password: "",
    campuses: [],
  });

  // Fetch users and campuses
  useEffect(() => {
    fetchUsers();
    fetchCampuses();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getUsers();
      toast({ title: "Usuarios cargados correctamente" });
      setUsers(response);
      setIsLoading(false);
    } catch (error) {
      toast({ title: "Error al cargar usuarios" });
      setIsLoading(false);
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await getCampuses();
      setCampuses(
        response.map((campus: any) => ({
          id: campus.id.toString(),
          name: campus.name,
        }))
      );
    } catch (error) {
      toast({ title: "Error al cargar planteles" });
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      role: "user",
      password: "",
      campuses: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      id: user.id || undefined,
      name: user.name,
      email: user.email,
      role: user.role,
      campuses: user.campuses?.map(campus => campus.id.toString()) || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        const response = await updateUser(formData as unknown as User);
        await fetchUsers();
        toast({ title: "Usuario actualizado correctamente" });
      } else {
        const response = await createUser(formData as unknown as User);
        await fetchUsers();
        toast({ title: "Usuario creado correctamente" });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error al guardar usuario",
        description: error.response?.data?.message || "Intente nuevamente",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      await fetchUsers();
      toast({ title: "Usuario eliminado correctamente" });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({ title: "Error al eliminar usuario" });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCampusChange = (selectedCampuses: string[]) => {
    setFormData((prev) => ({
      ...prev,
      campuses: selectedCampuses,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <Button variant="secondary" onClick={handleOpenCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Crear Usuario
        </Button>
      </div>

      {/* Tabla de Usuarios */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Planteles</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.campuses?.map(campus => campus.name).join(", ") || "Sin planteles"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditModal(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedUser(user);
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
              <TableCell colSpan={5} className="text-center">
                No se encontraron usuarios.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal de Creación/Edición */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Editar Usuario" : "Crear Usuario"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Modifica los datos del usuario"
                : "Introduce los datos del nuevo usuario"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Rol</Label>
              <Select
                name="role"
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: value as User["role"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="super_admin">
                    Super Administrador
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Planteles</Label>
              <MultiSelect
                options={campuses.map((campus) => ({
                  value: campus.id.toString(),
                  label: campus.name,
                }))}
                selectedValues={formData.campuses}
                onSelectedChange={handleCampusChange}
                title="Planteles"
                placeholder="Seleccionar planteles"
                searchPlaceholder="Buscar plantel..."
                emptyMessage="No se encontraron planteles"
              />
            </div>
            <div>
              <Label htmlFor="password">
                {!selectedUser ? "Contraseña" : "Nueva Contraseña"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={handleInputChange}
                required={!selectedUser}
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
                {selectedUser ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
