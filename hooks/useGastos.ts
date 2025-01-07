import { useState, useEffect } from 'react';
import { createGasto, deleteGasto, getGastos } from '@/lib/api';
import { Gasto } from '@/lib/types';


interface UseGastosProps {
  campusId: number;
}

interface UseGastosReturn {
  gastos: Gasto[];
  filteredGastos: Gasto[];
  isLoading: boolean;
  error: Error | null;
  handleCreateGasto: (data: Gasto) => Promise<void>;
  handleDeleteGasto: (id: number) => Promise<void>;
  handleFilter: (startDate: string, endDate: string, category: string) => void;
  refreshGastos: () => Promise<void>;
}

export const useGastos = ({ campusId }: UseGastosProps): UseGastosReturn => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [filteredGastos, setFilteredGastos] = useState<Gasto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGastos = async () => {
    try {
      setIsLoading(true);
      const response = await getGastos(campusId);
      setGastos(response);
      setFilteredGastos(response);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGasto = async (data: Gasto) => {
    try {
      setIsLoading(true);
      await createGasto(data as Gasto & { image?: File });
      await fetchGastos();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGasto = async (id: number) => {
    try {
      setIsLoading(true);
      await deleteGasto(id.toString());
      await fetchGastos();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (startDate: string, endDate: string, category: string) => {
    let filtered = [...gastos];

    if (startDate && endDate) {
      filtered = filtered.filter(gasto => {
        const gastoDate = new Date(gasto.date);
        return gastoDate >= new Date(startDate) && gastoDate <= new Date(endDate);
      });
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(gasto => gasto.category === category);
    }

    setFilteredGastos(filtered);
  };

  useEffect(() => {
    fetchGastos();
  }, [campusId]);

  return {
    gastos,
    filteredGastos,
    isLoading,
    error,
    handleCreateGasto,
    handleDeleteGasto,
    handleFilter,
    refreshGastos: fetchGastos,
  };
};
