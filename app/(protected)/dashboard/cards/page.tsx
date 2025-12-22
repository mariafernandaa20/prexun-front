'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card as CardType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/lib/api/axiosConfig';
import { Checkbox } from '@/components/ui/checkbox';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const CardManagement = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [campuses, setCampuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const { toast } = useToast();

  // Form setup
  const addForm = {
    number: '',
    name: '',
    clabe: '',
    sat: true,
    campus_id: '',
    is_hidden: false,
  };

  const [formData, setFormData] = useState(addForm);
  const { SAT } = useFeatureFlags();
  useEffect(() => {
    // Fetch cards and campuses when component mounts
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [cardsResponse, campusesResponse] = await Promise.all([
          axiosInstance.get('/cards?all=true'),
          axiosInstance.get('/campuses'),
        ]);
        setCards(cardsResponse.data);
        setCampuses(campusesResponse.data);
      } catch (error) {
        toast({
          title: 'Error',
          description:
            'Error al cargar los datos. Por favor, inténtalo de nuevo.',
          variant: 'destructive',
        });
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked, name) => {
    setFormData((prev) => ({ ...prev, [name]: Boolean(checked) }));
  };

  const handleAddCard = async () => {
    try {
      const response = await axiosInstance.post('/cards', formData);
      setCards((prev) => [...prev, response.data.data]);
      setIsAddDialogOpen(false);
      setFormData(addForm);
      toast({
        title: 'Éxito',
        description: '¡Tarjeta creada exitosamente!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.errors?.number ||
          'Error al crear la tarjeta. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
      console.error('Error adding card:', error);
    }
  };

  const handleEditCard = async () => {
    try {
      const response = await axiosInstance.put(
        `/cards/${currentCard.id}`,
        formData
      );
      setCards((prev) =>
        prev.map((card) =>
          card.id === currentCard.id ? response.data.data : card
        )
      );
      setIsEditDialogOpen(false);
      toast({
        title: 'Éxito',
        description: '¡Tarjeta actualizada exitosamente!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.errors?.number ||
          'Error al actualizar la tarjeta. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
      console.error('Error editing card:', error);
    }
  };

  const handleDeleteCard = async () => {
    try {
      await axiosInstance.delete(`/cards/${currentCard.id}`);
      setCards((prev) => prev.filter((card) => card.id !== currentCard.id));
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Éxito',
        description: '¡Tarjeta eliminada exitosamente!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          'Error al eliminar la tarjeta. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
      console.error('Error deleting card:', error);
    }
  };

  const openEditDialog = (card) => {
    setCurrentCard(card);
    setFormData({
      number: card.number,
      name: card.name,
      clabe: card.clabe || '',
      sat: Boolean(card.sat),
      campus_id: card.campus_id.toString(),
      is_hidden: Boolean(card.is_hidden),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (card) => {
    setCurrentCard(card);
    setIsDeleteDialogOpen(true);
  };

  const getCampusName = (campusId) => {
    const campus = campuses.find((c) => c.id === campusId);
    return campus ? campus.name : 'Campus Desconocido';
  };

  return (
    <div className="p-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestión de Tarjetas</CardTitle>
            <CardDescription>
              Administrar todas las tarjetas de acceso del campus
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus size={16} /> Agregar Tarjeta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nueva Tarjeta</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ingrese el nombre"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="number">Numero de tarjeta</Label>
                  <Input
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="Ingrese el número de tarjeta"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clabe">Clabe Interbancaria</Label>
                  <Input
                    id="clabe"
                    name="clabe"
                    value={formData.clabe}
                    onChange={handleInputChange}
                    placeholder="Clabe interbancaria"
                  />
                </div>

                {!SAT && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sat">SAT</Label>
                    <Checkbox
                      id="sat"
                      checked={formData.sat}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(checked, 'sat')
                      }
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="campus">Campus</Label>
                  <Select
                    value={formData.campus_id}
                    onValueChange={(value) =>
                      handleSelectChange(value, 'campus_id')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar campus" />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses.map((campus) => (
                        <SelectItem
                          key={campus.id}
                          value={campus.id.toString()}
                        >
                          {campus.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleAddCard}>Agregar Tarjeta</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">Cargando tarjetas...</div>
          ) : (
            <Table>
              <TableCaption>
                Lista de todas las tarjetas de acceso registradas
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Número de Tarjeta</TableHead>
                  {!SAT && <TableHead>SAT</TableHead>}
                  <TableHead>Clabe Interbancaria</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.length > 0 ? (
                  cards
                    .filter((card) => !SAT || card.sat)
                    .map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">
                          {card.number}
                        </TableCell>
                        {!SAT && <TableCell>{card.sat}</TableCell>}
                        <TableCell>{card.clabe}</TableCell>
                        <TableCell>{card.name}</TableCell>

                        <TableCell>{getCampusName(card.campus_id)}</TableCell>
                        <TableCell>{card.is_hidden ? 'Oculto' : 'Visible'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(card)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500"
                              onClick={() => openDeleteDialog(card)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No se encontraron tarjetas. Agrega una para comenzar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Tarjeta</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nombre</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-number">Numero de tarjeta</Label>
                  <Input
                    id="edit-number"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-clabe">Clabe Interbancaria</Label>
                  <Input
                    id="edit-clabe"
                    name="clabe"
                    value={formData.clabe}
                    onChange={handleInputChange}
                    placeholder="Clabe interbancaria"
                  />
                </div>
                {!SAT && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="edit-sat">SAT</Label>
                    <Checkbox
                      id="edit-sat"
                      checked={formData.sat}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(checked, 'sat')
                      }
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="edit-campus">Campus</Label>
                  <Select
                    value={formData.campus_id}
                    onValueChange={(value) =>
                      handleSelectChange(value, 'campus_id')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar campus" />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses.map((campus) => (
                        <SelectItem
                          key={campus.id}
                          value={campus.id.toString()}
                        >
                          {campus.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <div className="flex justify-between w-full items-center">
                  <Label>
                  <Checkbox
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_hidden: Boolean(checked),
                      }))
                    }
                    checked={formData.is_hidden}
                  />Ocultar la tarjeta
                </Label>
                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleEditCard}>Guardar Cambios</Button>
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
              </DialogHeader>
              <p className="py-4">
                ¿Estás seguro de que quieres eliminar la tarjeta de{' '}
                {currentCard?.name}? Esta acción no se puede deshacer.
              </p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDeleteCard}>
                  Eliminar Tarjeta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardManagement;
