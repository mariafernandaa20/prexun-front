'use client';

import { useState, useCallback } from 'react';
import { AlertTriangle, X, Settings2, Save, Loader2, WrenchIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { setMaintenanceMode } from '@/lib/api';

// Cache global compartida con useUIConfig
let configCache: any = null;

interface MaintenanceBannerProps {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  onRefresh?: () => void;
}

export function MaintenanceBanner({
  maintenanceMode,
  maintenanceMessage,
  onRefresh,
}: MaintenanceBannerProps) {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';

  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(maintenanceMessage);
  const [saving, setSaving] = useState(false);

  const handleToggle = useCallback(async () => {
    setSaving(true);
    try {
      await setMaintenanceMode(!maintenanceMode);
      onRefresh?.();
    } catch (err) {
      console.error('Error al cambiar modo mantenimiento:', err);
    } finally {
      setSaving(false);
    }
  }, [maintenanceMode, onRefresh]);

  const handleSaveMessage = useCallback(async () => {
    setSaving(true);
    try {
      await setMaintenanceMode(maintenanceMode, editMessage);
      setIsEditing(false);
      onRefresh?.();
    } catch (err) {
      console.error('Error al guardar mensaje:', err);
    } finally {
      setSaving(false);
    }
  }, [maintenanceMode, editMessage, onRefresh]);

  // Si no está en modo mantenimiento y no es super_admin, no mostrar nada
  if (!maintenanceMode && !isSuperAdmin) return null;

  // Si no está en modo mantenimiento pero es super_admin, mostrar control apagado
  if (!maintenanceMode && isSuperAdmin) {
    return (
      <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/50 border-b border-border text-xs text-muted-foreground">
        <WrenchIcon className="h-3.5 w-3.5 shrink-0" />
        <span>Modo mantenimiento: <strong>inactivo</strong></span>
        <button
          onClick={handleToggle}
          disabled={saving}
          className="ml-auto flex items-center gap-1.5 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Settings2 className="h-3 w-3" />}
          Activar modo mantenimiento
        </button>
      </div>
    );
  }

  // Modo mantenimiento ACTIVO
  return (
    <div className="relative overflow-hidden border-b border-amber-500/30">
      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(245,158,11,0.03)_10px,rgba(245,158,11,0.03)_20px)]" />

      <div className="relative flex items-center gap-3 px-4 py-2.5">
        {/* Ícono y pulso */}
        <div className="relative flex shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40 animate-ping" />
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 ring-1 ring-amber-500/40">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
        </div>

        {/* Mensaje */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                className="flex-1 rounded-md border border-amber-400/50 bg-amber-500/10 px-2.5 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Mensaje de mantenimiento..."
              />
              <button
                onClick={handleSaveMessage}
                disabled={saving}
                className="flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Guardar
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditMessage(maintenanceMessage); }}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-amber-500/20 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                🛠 Modo Mantenimiento
              </span>
              <span className="hidden sm:block text-sm text-foreground/80">—</span>
              <span className="hidden sm:block text-sm text-foreground/80 truncate">
                {maintenanceMessage}
              </span>
            </div>
          )}
        </div>

        {/* Controles solo para super_admin */}
        {isSuperAdmin && !isEditing && (
          <div className="flex shrink-0 items-center gap-2 ml-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <Settings2 className="h-3 w-3" />
              <span className="hidden sm:inline">Editar mensaje</span>
            </button>
            <button
              onClick={handleToggle}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
            >
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">Desactivar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
