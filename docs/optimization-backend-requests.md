# Optimización de Solicitudes al Backend

## Problemas Identificados

1. **Múltiples inicializaciones**: `initializeApp()` se llamaba en múltiples layouts
2. **Doble verificación de auth**: Se ejecutaba tanto en `AuthProvider` como en `initializeApp()`
3. **Sin memoización**: Los datos se volvían a cargar innecesariamente
4. **Sin control de estado**: No había flags para evitar cargas duplicadas

## Soluciones Implementadas

### 1. Control de Estado en Auth Store

```typescript
interface AppState {
  // Nuevos flags de control
  isDataLoaded: boolean,
  isInitialized: boolean,
}
```

### 2. Hook Personalizado `useAppInit`

- Previene múltiples inicializaciones simultáneas
- Usa `useRef` para control de una sola ejecución
- Centraliza la lógica de inicialización

### 3. Optimización de `initializeApp()`

```typescript
initializeApp: async () => {
  // Evitar múltiples inicializaciones simultáneas
  if (get().isInitialized || get().loading) {
    return;
  }

  // Solo cargar datos si no están ya cargados
  if (!get().isDataLoaded) {
    await Promise.all([...fetchFunctions]);
    set({ isDataLoaded: true });
  }

  // Solo verificar auth si no hay usuario
  if (!get().user && storedToken) {
    await get().checkAuth();
  }
}
```

### 4. AuthProvider Mejorado

- Solo verifica auth si no hay usuario y hay token
- Evita verificaciones innecesarias

### 5. Sistema de Debug

#### Request Logger
- Monitorea todas las solicitudes HTTP
- Identifica solicitudes duplicadas
- Solo activo en modo desarrollo

#### Función Global de Debug
En la consola del navegador:
```javascript
debugRequests() // Muestra estadísticas de solicitudes
```

## Uso

### En Layouts
```typescript
export default function Layout({ children }) {
  useAppInit(); // Reemplaza initializeApp() manual
  return <>{children}</>;
}
```

### Para Debug
1. Asegúrate que `NEXT_PUBLIC_DEVELOPMENT=true`
2. Abre DevTools
3. Ejecuta `debugRequests()` en la consola
4. Revisa solicitudes duplicadas en la tabla

## Beneficios

- ✅ Reduce solicitudes duplicadas al backend
- ✅ Mejora performance de la aplicación
- ✅ Facilita debugging en desarrollo
- ✅ Código más mantenible y predecible
- ✅ Mejor experiencia de usuario (menos loading states)

## Monitoreo

El sistema ahora logea en consola:
- 📤 Nuevas solicitudes
- 🚨 Solicitudes duplicadas con contador
- 📊 Tabla de estadísticas con `debugRequests()`
