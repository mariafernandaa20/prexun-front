'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  getSiteSettings,
  createSiteSetting,
  updateSiteSetting,
  updateMultipleSiteSettings,
  deleteSiteSetting
} from '@/lib/api';
import { SiteSetting, SiteSettingGroup, SiteSettingFormData } from '@/lib/types';

export default function AjustesPage() {
  const [settings, setSettings] = useState<SiteSettingGroup>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SiteSetting | null>(null);
  const [newSetting, setNewSetting] = useState<SiteSettingFormData>({
    key: '',
    label: '',
    value: '',
    type: 'text',
    description: '',
    group: 'general',
    sort_order: 0
  });
  const { toast } = useToast();

  const settingTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'boolean', label: 'Verdadero/Falso' },
    { value: 'select', label: 'Selección' },
    { value: 'textarea', label: 'Texto Largo' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' },
    { value: 'json', label: 'JSON' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSiteSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (groupSettings: SiteSetting[]) => {
    try {
      setSaving(true);
      const settingsToUpdate = groupSettings.map(setting => ({
        id: setting.id,
        value: setting.value
      }));

      await updateMultipleSiteSettings(settingsToUpdate);
      
      toast({
        title: 'Configuraciones guardadas',
        description: 'Las configuraciones se han actualizado correctamente'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las configuraciones',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSetting = async () => {
    try {
      await createSiteSetting(newSetting);
      setIsDialogOpen(false);
      setNewSetting({
        key: '',
        label: '',
        value: '',
        type: 'text',
        description: '',
        group: 'general',
        sort_order: 0
      });
      fetchSettings();
      toast({
        title: 'Configuración creada',
        description: 'La nueva configuración se ha creado correctamente'
      });
    } catch (error) {
      console.error('Error creating setting:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la configuración',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateSetting = async (setting: SiteSetting) => {
    try {
      await updateSiteSetting(setting.id!, setting);
      fetchSettings();
      toast({
        title: 'Configuración actualizada',
        description: 'La configuración se ha actualizado correctamente'
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la configuración',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSetting = async (settingId: number) => {
    try {
      await deleteSiteSetting(settingId);
      fetchSettings();
      toast({
        title: 'Configuración eliminada',
        description: 'La configuración se ha eliminado correctamente'
      });
    } catch (error) {
      console.error('Error deleting setting:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la configuración',
        variant: 'destructive'
      });
    }
  };

  const updateSettingValue = (groupKey: string, settingId: number, newValue: string) => {
    setSettings(prev => ({
      ...prev,
      [groupKey]: prev[groupKey].map(setting =>
        setting.id === settingId ? { ...setting, value: newValue } : setting
      )
    }));
  };

  const renderSettingInput = (setting: SiteSetting, groupKey: string) => {
    const onChange = (value: string) => updateSettingValue(groupKey, setting.id!, value);

    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value === 'true' || setting.value === '1'}
            onCheckedChange={(checked) => onChange(checked.toString())}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={setting.value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={setting.value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
          />
        );
      case 'select':
        return (
          <Select value={setting.value || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar opción" />
            </SelectTrigger>
            <SelectContent>
              {setting.options && Object.entries(setting.options).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'email':
        return (
          <Input
            type="email"
            value={setting.value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'url':
        return (
          <Input
            type="url"
            value={setting.value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'json':
        return (
          <Textarea
            value={setting.value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ingrese JSON válido"
            rows={4}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={setting.value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  const getGroupDisplayName = (groupKey: string) => {
    const displayNames: Record<string, string> = {
      general: 'General',
      academic: 'Académico',
      payments: 'Pagos',
      notifications: 'Notificaciones',
      interface: 'Interfaz',
      security: 'Seguridad'
    };
    return displayNames[groupKey] || groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ajustes del Sitio</h1>
          <p className="text-muted-foreground">
            Configura las opciones globales del sistema
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Configuración
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nueva Configuración</DialogTitle>
              <DialogDescription>
                Agrega una nueva configuración al sistema
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="key">Clave</Label>
                <Input
                  id="key"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                  placeholder="config_key"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="label">Etiqueta</Label>
                <Input
                  id="label"
                  value={newSetting.label}
                  onChange={(e) => setNewSetting({...newSetting, label: e.target.value})}
                  placeholder="Nombre visible"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newSetting.type}
                  onValueChange={(value: any) => setNewSetting({...newSetting, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {settingTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="group">Grupo</Label>
                <Input
                  id="group"
                  value={newSetting.group}
                  onChange={(e) => setNewSetting({...newSetting, group: e.target.value})}
                  placeholder="general"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newSetting.description}
                  onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                  placeholder="Descripción de la configuración"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSetting}>
                Crear
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={Object.keys(settings)[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {Object.keys(settings).map((groupKey) => (
            <TabsTrigger key={groupKey} value={groupKey}>
              {getGroupDisplayName(groupKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(settings).map(([groupKey, groupSettings]) => (
          <TabsContent key={groupKey} value={groupKey}>
            <Card>
              <CardHeader>
                <CardTitle>{getGroupDisplayName(groupKey)}</CardTitle>
                <CardDescription>
                  Configuraciones del grupo {getGroupDisplayName(groupKey).toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {groupSettings.map((setting) => (
                  <div key={setting.id} className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor={`setting-${setting.id}`}>
                          {setting.label}
                        </Label>
                        {setting.description && (
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSetting(setting.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div id={`setting-${setting.id}`}>
                      {renderSettingInput(setting, groupKey)}
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => handleSaveSettings(groupSettings)}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Configuraciones
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
