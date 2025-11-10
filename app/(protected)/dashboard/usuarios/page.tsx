'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { User, UserFormData } from '@/lib/types';
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
} from '@/components/ui/alert-dialog';
import { MultiSelect } from '@/components/multi-select';
import {
  createUser,
  deleteUser,
  getCampuses,
  getUsers,
  updateUser,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/lib/api/axiosConfig';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { useAuthStore } from '@/lib/store/auth-store';

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
    name: '',
    email: '',
    role: 'admin',
    password: '',
    campuses: [],
    grupos: [],
    suspendido: false,
  });

  useEffect(() => {
    fetchUsers();
    fetchCampuses();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getUsers();
      const usersWithGroups = await Promise.all(
        response.map(async (user) => {
          if (user.role === 'maestro') {
            try {
              const gruposResponse = await axiosInstance.get(
                `/teacher/${user.id}/groups`
              );
              return {
                ...user,
                grupos: gruposResponse.data || [],
              };
            } catch (error) {
              console.error(
                `Error al cargar grupos para el maestro ${user.id}:`,
                error
              );
              return {
                ...user,
                grupos: [],
              };
            }
          }
          return user;
        })
      );
      setUsers(usersWithGroups);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast({
        title: 'Error al cargar usuarios',
        description: 'Por favor, verifica tu conexión e intenta nuevamente',
      });
      setIsLoading(false);
      setUsers([]); // Establecer un array vacío en caso de error
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
      toast({ title: 'Error al cargar planteles' });
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'user',
      password: '',
      campuses: [],
      grupos: [],
      suspendido: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (user: User) => {
    setSelectedUser(user);
    try {
      let gruposDelMaestro = [];
      if (user.role === 'maestro') {
        const response = await axiosInstance.get(`/teacher/${user.id}/groups`); // Removido el /api/ extra
        gruposDelMaestro = response.data.map((grupo: any) =>
          grupo.id.toString()
        );
      }

      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        campuses: user.campuses
          ? user.campuses.map((campus) => campus.id.toString())
          : [],
        grupos: gruposDelMaestro,
        suspendido: user.suspendido || false,
      });
      setShowGrupos(user.role === 'maestro');
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error al cargar los grupos del maestro:', error);
      toast({
        title: 'Error al cargar los grupos del maestro',
        description: 'Por favor, intente nuevamente',
      });
      // Aún mostramos el modal para permitir la edición
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        const response = await updateUser(formData as unknown as User);
        if (formData.role === 'maestro' && formData.grupos) {
          const groupAssignResponse = await axiosInstance.post(
            `/teacher/${formData.id}/groups/assign`,
            {
              grupo_ids: formData.grupos.map((id) => parseInt(id)),
            }
          );
        }
        await fetchUsers();
        toast({ title: 'Usuario actualizado correctamente' });
      } else {
        const response = await createUser(formData as unknown as User);
        if (formData.role === 'maestro' && formData.grupos) {
          // Corregir la URL para nuevos usuarios
          const groupAssignResponse = await axiosInstance.post(
            `/teacher/${response.data.data.id}/groups/assign`,
            {
              grupo_ids: formData.grupos,
            }
          );
        }
        await fetchUsers();
        toast({ title: 'Usuario creado correctamente' });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error completo:', error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar usuario',
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      await fetchUsers();
      toast({ title: 'Usuario eliminado correctamente' });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error al eliminar usuario' });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCampusChange = (selectedCampuses: string[]) => {
    setFormData((prev) => ({
      ...prev,
      campuses: selectedCampuses,
    }));
  };

  const { grupos } = useAuthStore();

  const [showGrupos, setShowGrupos] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCampuses();
  }, []);

  const handleRoleChange = (
    value:
      | 'admin'
      | 'user'
      | 'super_admin'
      | 'contador'
      | 'maestro'
      | 'proveedor'
      | 'chatbot'
      | 'otro'
  ) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      grupos: value === 'maestro' ? [] : [],
    }));
    setShowGrupos(value === 'maestro');
  };

  const handleGruposChange = (selectedGrupos: string[]) => {
    setFormData((prev) => ({
      ...prev,
      grupos: selectedGrupos,
    }));
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="p-4">
        <div className="flex justify-end items-center">
          <Button variant="secondary" onClick={handleOpenCreateModal}>
            <Plus className="mr-2 h-4 w-4" /> Crear Usuario
          </Button>
        </div>

        {/* Tabla de Usuarios */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Planteles</TableHead>
              <TableHead>Grupos</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users ? (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className={
                    user.suspendido ? 'bg-red-50 dark:bg-red-950/20' : ''
                  }
                >
                  <TableCell className="font-mono text-sm">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.suspendido
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}
                    >
                      {user.suspendido ? 'Suspendido' : 'Activo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.campuses
                      ? user.campuses.map((campus) => campus.name).join(', ')
                      : 'Sin planteles'}
                  </TableCell>
                  <TableCell>
                    {user.role === 'maestro' && user.grupos
                      ? user.grupos.map((grupo) => grupo.name).join(', ')
                      : '-'}
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
                <TableCell colSpan={8} className="text-center">
                  No se encontraron usuarios.
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
                {selectedUser ? 'Editar Usuario' : 'Crear Usuario'}
              </DialogTitle>
              <DialogDescription>
                {selectedUser
                  ? 'Modifica los datos del usuario'
                  : 'Introduce los datos del nuevo usuario'}
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
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="super_admin">
                      Super Administrador
                    </SelectItem>
                    <SelectItem value="contador">Contador</SelectItem>
                    <SelectItem value="maestro">Maestro</SelectItem>
                    <SelectItem value="proveedor">Proveedor</SelectItem>
                    <SelectItem value="chatbot">Chatbot</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {showGrupos && (
                <div>
                  <Label>Grupos</Label>
                  <MultiSelect
                    options={grupos.map((grupo) => ({
                      value: grupo.id.toString(),
                      label: grupo.name,
                    }))}
                    hiddeBadages={false}
                    selectedValues={formData.grupos || []}
                    onSelectedChange={handleGruposChange}
                    title="Grupos de Estudiantes"
                    placeholder="Seleccionar grupos"
                    searchPlaceholder="Buscar grupo..."
                    emptyMessage="No se encontraron grupos"
                  />
                </div>
              )}
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
              <div></div>
              <div>
                <Label htmlFor="password">
                  {!selectedUser ? 'Contraseña' : 'Nueva Contraseña'}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  required={!selectedUser}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="suspendido"
                  name="suspendido"
                  checked={formData.suspendido || false}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      suspendido: checked as boolean,
                    }));
                  }}
                />
                <Label
                  htmlFor="suspendido"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Usuario suspendido
                </Label>
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
                  {selectedUser ? 'Actualizar' : 'Crear'}
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
                Esta acción no se puede deshacer. Se eliminará permanentemente
                el usuario.
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
    </div>
  );
}
