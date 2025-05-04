'use client';
import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
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
import {Card as CardType} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/lib/api/axiosConfig';
import { Checkbox } from '@/components/ui/checkbox';

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
        campus_id: ''
    };

    const [formData, setFormData] = useState(addForm);

    useEffect(() => {
        // Fetch cards and campuses when component mounts
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [cardsResponse, campusesResponse] = await Promise.all([
                    axiosInstance.get('/cards'),
                    axiosInstance.get('/campuses')
                ]);
                setCards(cardsResponse.data);
                setCampuses(campusesResponse.data);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load data. Please try again.",
                    variant: "destructive"
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
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSelectChange = (value, name) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked, name) => {
        setFormData(prev => ({ ...prev, [name]: Boolean(checked) }));
    };

    const handleAddCard = async () => {
        try {
            const response = await axiosInstance.post('/cards', formData);
            setCards(prev => [...prev, response.data.data]);
            setIsAddDialogOpen(false);
            setFormData(addForm);
            toast({
                title: "Success",
                description: "Card created successfully!",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.errors?.number || "Failed to create card. Please try again.",
                variant: "destructive"
            });
            console.error('Error adding card:', error);
        }
    };

    const handleEditCard = async () => {
        try {
            const response = await axiosInstance.put(`/cards/${currentCard.id}`, formData);
            setCards(prev =>
                prev.map(card => card.id === currentCard.id ? response.data.data : card)
            );
            setIsEditDialogOpen(false);
            toast({
                title: "Success",
                description: "Card updated successfully!",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.errors?.number || "Failed to update card. Please try again.",
                variant: "destructive"
            });
            console.error('Error editing card:', error);
        }
    };

    const handleDeleteCard = async () => {
        try {
            await axiosInstance.delete(`/cards/${currentCard.id}`);
            setCards(prev => prev.filter(card => card.id !== currentCard.id));
            setIsDeleteDialogOpen(false);
            toast({
                title: "Success",
                description: "Card deleted successfully!",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete card. Please try again.",
                variant: "destructive"
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
            campus_id: card.campus_id.toString()
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (card) => {
        setCurrentCard(card);
        setIsDeleteDialogOpen(true);
    };

    const getCampusName = (campusId) => {
        const campus = campuses.find(c => c.id === campusId);
        return campus ? campus.name : 'Unknown Campus';
    };

    return (
        <div className='p-4'>
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Card Management</CardTitle>
                        <CardDescription>Manage all campus access cards</CardDescription>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-1">
                                <Plus size={16} /> Add Card
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Card</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-2 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="number">Numero de tarjeta</Label>
                                    <Input
                                        id="number"
                                        name="number"
                                        value={formData.number}
                                        onChange={handleInputChange}
                                        placeholder="Enter card number"
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
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="sat">SAT</Label>
                                    <Checkbox 
                                        id="sat" 
                                        checked={formData.sat} 
                                        onCheckedChange={(checked) => handleCheckboxChange(checked, 'sat')} 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="campus">Campus</Label>
                                    <Select
                                        value={formData.campus_id}
                                        onValueChange={(value) => handleSelectChange(value, 'campus_id')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select campus" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {campuses.map(campus => (
                                                <SelectItem key={campus.id} value={campus.id.toString()}>
                                                    {campus.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleAddCard}>Add Card</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">Loading cards...</div>
                    ) : (
                        <Table>
                            <TableCaption>List of all registered access cards</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Card Number</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Campus</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cards.length > 0 ? (
                                    cards.map(card => (
                                        <TableRow key={card.id}>
                                            <TableCell className="font-medium">{card.number}</TableCell>
                                            <TableCell>{card.name}</TableCell>
                                            <TableCell>{getCampusName(card.campus_id)}</TableCell>
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
                                            No cards found. Add one to get started.
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
                                <DialogTitle>Edit Card</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-2 py-4">
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
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="edit-sat">SAT</Label>
                                    <Checkbox 
                                        id="edit-sat" 
                                        checked={formData.sat} 
                                        onCheckedChange={(checked) => handleCheckboxChange(checked, 'sat')} 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-campus">Campus</Label>
                                    <Select
                                        value={formData.campus_id}
                                        onValueChange={(value) => handleSelectChange(value, 'campus_id')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select campus" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {campuses.map(campus => (
                                                <SelectItem key={campus.id} value={campus.id.toString()}>
                                                    {campus.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleEditCard}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                            </DialogHeader>
                            <p className="py-4">
                                Are you sure you want to delete the card for {currentCard?.name}? This action cannot be undone.
                            </p>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button variant="destructive" onClick={handleDeleteCard}>
                                    Delete Card
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