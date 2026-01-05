// Debug utility para monitorear solicitudes al backend
export const createRequestLogger = () => {
  const requests = new Map();
  
  return {
    logRequest: (url: string, method: string = 'GET') => {
      const key = `${method}:${url}`;
      const count = requests.get(key) || 0;
      requests.set(key, count + 1);
      
      if (count > 0) {
        console.warn(`🚨 Solicitud duplicada #${count + 1}: ${key}`);
      } else {
      }
    },
    
    getStats: () => {
      const stats = Array.from(requests.entries()).map(([key, count]) => ({
        endpoint: key,
        count
      }));
      
      console.table(stats.filter(s => s.count > 1));
      return stats;
    },
    
    reset: () => {
      requests.clear();
    }
  };
};

// Instancia global para uso en desarrollo
export const requestLogger = createRequestLogger();
