# Modal de Envío de Mensajes WhatsApp para Estudiantes

## Descripción
Se ha implementado un modal personalizado que permite enviar mensajes de WhatsApp a estudiantes específicos directamente desde la tabla de estudiantes.

## Características

### 1. **Ubicación del Modal**
- **Archivo**: `components/students/WhatsAppMessageModal.tsx`
- **Integrado en**: Página de estudiantes (`app/(protected)/planteles/estudiantes/page.tsx`)

### 2. **Funcionalidades Principales**

#### **Información del Estudiante**
- Muestra nombre completo del estudiante
- Formateo automático del número de teléfono
- Visualización del email si está disponible

#### **Envío de Mensajes**
- Área de texto para escribir mensajes personalizados
- Vista previa en tiempo real del mensaje
- Validación de número de teléfono y contenido del mensaje
- Integración con la API de WhatsApp Business

#### **Estados de Carga**
- Indicador visual durante el envío
- Mensajes de éxito/error con toast notifications
- Deshabilitación de botones durante el proceso

### 3. **Integración en la Tabla de Estudiantes**

#### **Nuevo Botón de Acción**
Se agregó un botón con icono `MessageSquare` en la columna de acciones que:
- Abre el modal de WhatsApp
- Pasa la información del estudiante seleccionado
- Se muestra junto a los botones existentes (WhatsApp Web, Editar, Ver, Eliminar)

#### **Actualización de Componentes**
- **`columns.tsx`**: Agregado nuevo parámetro `handleOpenWhatsAppModal`
- **`StudentsTable.tsx`**: Actualizado para recibir y pasar la función del modal
- **`page.tsx`**: Implementada la lógica de estado y handlers del modal

### 4. **Flujo de Funcionamiento**

1. **Activación**: Usuario hace clic en el botón `MessageSquare` de cualquier estudiante
2. **Apertura**: Se abre el modal con la información del estudiante precargada
3. **Composición**: Usuario escribe el mensaje personalizado
4. **Vista Previa**: Se muestra una vista previa del mensaje en tiempo real
5. **Envío**: Al hacer clic en "Enviar Mensaje" se ejecuta la llamada a la API
6. **Confirmación**: Se muestra notificación de éxito/error y se cierra el modal

### 5. **API Backend**

#### **Endpoint Utilizado**
```
POST /whatsapp/send-message
```

#### **Parámetros Enviados**
```json
{
  "phone_number": "52XXXXXXXXXX",
  "message": "Mensaje personalizado del usuario"
}
```

#### **Integración con Chat**
- Los mensajes enviados se registran automáticamente en el sistema de chat
- Se pueden ver en el historial de WhatsApp del módulo de chat
- Mantiene trazabilidad completa de las comunicaciones

### 6. **Características de UX/UI**

#### **Diseño Responsivo**
- Modal adaptable a diferentes tamaños de pantalla
- Interfaz limpia y fácil de usar

#### **Validaciones**
- Verificación de número de teléfono válido
- Validación de mensaje no vacío
- Prevención de envíos duplicados

#### **Feedback Visual**
- Loading spinner durante el envío
- Toast notifications para éxito/error
- Vista previa estilizada como mensaje de WhatsApp

### 7. **Instalación y Configuración**

#### **Dependencias Utilizadas**
- `react-icons/fa6` - Para el icono de WhatsApp
- `lucide-react` - Para iconos de UI
- `sonner` - Para toast notifications
- `@/components/ui/*` - Componentes de UI del sistema

#### **Variables de Entorno Requeridas (Backend)**
```env
WHATSAPP_TOKEN=tu_token_de_whatsapp_business
PHONE_NUMBER_ID=tu_phone_number_id
```

### 8. **Casos de Uso**

1. **Recordatorios de Pago**: Enviar recordatorios personalizados sobre pagos pendientes
2. **Confirmaciones**: Confirmar inscripciones, cambios de horario, etc.
3. **Comunicación Urgente**: Contactar estudiantes para situaciones específicas
4. **Seguimiento Académico**: Enviar mensajes sobre desempeño o asistencia

### 9. **Beneficios**

- **Comunicación Directa**: Contacto inmediato con estudiantes
- **Trazabilidad**: Registro automático en el sistema de chat
- **Eficiencia**: No necesidad de abrir WhatsApp Web por separado
- **Personalización**: Mensajes adaptados a cada estudiante
- **Integración**: Funciona dentro del flujo de trabajo existente

### 10. **Extensiones Futuras**

- **Plantillas Predefinidas**: Mensajes comunes reutilizables
- **Envío Masivo**: Seleccionar múltiples estudiantes
- **Programación**: Agendar mensajes para envío posterior
- **Archivos Adjuntos**: Envío de documentos o imágenes
- **Respuestas Automáticas**: Manejo de respuestas de estudiantes

## Uso

1. Navegar a la página de estudiantes
2. Buscar el estudiante deseado en la tabla
3. Hacer clic en el botón del icono `MessageSquare` en la columna de acciones
4. Escribir el mensaje personalizado en el modal
5. Revisar la vista previa
6. Hacer clic en "Enviar Mensaje"
7. Confirmar el envío con la notificación de éxito

El sistema es intuitivo y mantiene la consistencia con el resto de la interfaz del sistema educativo.
