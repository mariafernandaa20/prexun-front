import { useEffect, useState } from 'react';
import { getUIConfig } from '@/lib/api';

interface UIConfig {
  default_period_id: string | null;
  default_items_per_page: number;
  default_theme: string;
  payment_methods_enabled: string[];
  default_payment_method: string;
}

// Cache global para evitar múltiples llamadas
let configCache: UIConfig | null = null;
let isLoading = false;
let loadPromise: Promise<UIConfig> | null = null;

const loadConfig = async (): Promise<UIConfig> => {
  if (configCache) {
    return configCache;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const response = await getUIConfig();
      configCache = response.data;
      return configCache!;
    } catch (err) {
      console.error('Error loading UI config:', err);
      // Configuraciones por defecto en caso de error
      const defaultConfig: UIConfig = {
        default_period_id: null,
        default_items_per_page: 10,
        default_theme: 'light',
        payment_methods_enabled: ['cash'],
        default_payment_method: 'cash'
      };
      configCache = defaultConfig;
      return defaultConfig;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
};

export const useUIConfig = () => {
  const [config, setConfig] = useState<UIConfig | null>(configCache);
  const [loading, setLoading] = useState(!configCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (configCache) {
      setConfig(configCache);
      setLoading(false);
      return;
    }

    setLoading(true);
    loadConfig()
      .then((loadedConfig) => {
        setConfig(loadedConfig);
        setError(null);
      })
      .catch((err) => {
        setError('Error al cargar configuraciones');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Función para invalidar cache (útil cuando el admin cambia configuraciones)
  const refreshConfig = async () => {
    configCache = null;
    setLoading(true);
    try {
      const newConfig = await loadConfig();
      setConfig(newConfig);
    } catch (err) {
      setError('Error al refrescar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, error, refreshConfig };
};
