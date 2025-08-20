'use client';

import React, { useState, useEffect } from 'react';
import { Producto } from '@/lib/types';
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function ProductsPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [newProducto, setNewProducto] = useState<Producto>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    const data = await getProductos();
    setProductos(data);
  };

  const handleCreate = async () => {
    await createProducto(newProducto);
    setNewProducto({ name: '', description: '', price: 0, stock: 0 });
    loadProductos();
  };

  const handleUpdate = async (producto: Producto) => {
    await updateProducto(producto);
    setEditingId(null);
    loadProductos();
  };

  const handleDelete = async (id: number) => {
    await deleteProducto(id);
    loadProductos();
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="p-4">
        <Card>
          <CardHeader className="sticky top-0 z-8 bg-card">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold mt-6">Productos</h1>
              <div className="flex gap-2">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    placeholder="Nombre"
                    value={newProducto.name}
                    onChange={(e) =>
                      setNewProducto({ ...newProducto, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input
                    placeholder="Descripción"
                    value={newProducto.description}
                    onChange={(e) =>
                      setNewProducto({
                        ...newProducto,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Precio</Label>
                  <Input
                    placeholder="Precio"
                    type="number"
                    value={newProducto.price}
                    onChange={(e) =>
                      setNewProducto({
                        ...newProducto,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Stock Inicial</Label>
                  <Input
                    placeholder="Stock"
                    type="number"
                    value={newProducto.stock}
                    onChange={(e) =>
                      setNewProducto({
                        ...newProducto,
                        stock: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <Button className="mt-6" onClick={handleCreate}>
                  <PlusIcon className="mr-2 h-4 w-4" /> Agregar Producto
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell>{producto.id}</TableCell>
                    <TableCell>
                      {editingId === producto.id ? (
                        <Input
                          value={producto.name}
                          onChange={(e) =>
                            setProductos(
                              productos.map((p) =>
                                p.id === producto.id
                                  ? { ...p, name: e.target.value }
                                  : p
                              )
                            )
                          }
                        />
                      ) : (
                        producto.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === producto.id ? (
                        <Input
                          value={producto.description}
                          onChange={(e) =>
                            setProductos(
                              productos.map((p) =>
                                p.id === producto.id
                                  ? { ...p, description: e.target.value }
                                  : p
                              )
                            )
                          }
                        />
                      ) : (
                        producto.description
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === producto.id ? (
                        <Input
                          type="number"
                          value={producto.price}
                          onChange={(e) =>
                            setProductos(
                              productos.map((p) =>
                                p.id === producto.id
                                  ? { ...p, price: Number(e.target.value) }
                                  : p
                              )
                            )
                          }
                        />
                      ) : (
                        `$${producto.price}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === producto.id ? (
                        <Input
                          type="number"
                          value={producto.stock}
                          onChange={(e) =>
                            setProductos(
                              productos.map((p) =>
                                p.id === producto.id
                                  ? { ...p, stock: Number(e.target.value) }
                                  : p
                              )
                            )
                          }
                        />
                      ) : (
                        producto.stock
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === producto.id ? (
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdate(producto)}>
                            Guardar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditingId(producto.id)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(producto.id!)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
