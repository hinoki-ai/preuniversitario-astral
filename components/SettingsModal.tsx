'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useTheme } from 'next-themes';

import {
  Settings,
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Monitor,
  Volume2,
  Smartphone,
  Mail,
  Shield,
  Download,
  Trash2,
  Save,
  RefreshCw,
  Zap,
  BookOpen,
  Target,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

interface SettingsModalProps {
  trigger?: React.ReactNode;
}

export function SettingsModal({ trigger }: SettingsModalProps) {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Settings state
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    studyReminders: true,
    progressUpdates: true,
    classAlerts: true,
  });
  
  const [preferences, setPreferences] = useState({
    language: 'es',
    timeFormat: '24h',
    studySessionLength: 25,
    breakLength: 5,
    autoPlay: false,
    soundEffects: true,
    volume: 80,
    autoSave: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    dataCollection: true,
    analytics: true,
    thirdPartySharing: false,
  });

  const [performance, setPerformance] = useState({
    reducedMotion: false,
    autoDownload: false,
    cacheSize: 'medium',
    offlineMode: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSaveSettings = () => {
    // In a real app, save to backend
    // Settings saved
    setIsOpen(false);
  };

  const handleResetSettings = () => {
    // Reset to defaults
    setNotifications({
      email: true,
      push: true,
      sms: false,
      studyReminders: true,
      progressUpdates: true,
      classAlerts: true,
    });
    setPreferences({
      language: 'es',
      timeFormat: '24h',
      studySessionLength: 25,
      breakLength: 5,
      autoPlay: false,
      soundEffects: true,
      volume: 80,
      autoSave: true,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuración
          </DialogTitle>
          <DialogDescription>
            Personaliza tu experiencia de aprendizaje con Preuniversitario Astral
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              <span className="hidden sm:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              <span className="hidden sm:inline">Apariencia</span>
            </TabsTrigger>
            <TabsTrigger value="study" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span className="hidden sm:inline">Estudio</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline">Privacidad</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">Avanzado</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6 overflow-y-auto max-h-[60vh]">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Información Personal
                  </CardTitle>
                  <CardDescription>
                    Administra tu información personal y preferencias de cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nombre de Usuario</Label>
                      <Input
                        id="displayName"
                        defaultValue={user?.fullName || ''}
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={user?.primaryEmailAddress?.emailAddress || ''}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      placeholder="Cuéntanos sobre tus objetivos académicos..."
                      className="min-h-20"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nivel de Estudio</Label>
                      <Select defaultValue="4medio">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3medio">3° Medio</SelectItem>
                          <SelectItem value="4medio">4° Medio</SelectItem>
                          <SelectItem value="egresado">Egresado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Universidad Objetivo</Label>
                      <Select defaultValue="">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una universidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uchile">Universidad de Chile</SelectItem>
                          <SelectItem value="puc">Pontificia Universidad Católica</SelectItem>
                          <SelectItem value="usach">Universidad de Santiago</SelectItem>
                          <SelectItem value="udec">Universidad de Concepción</SelectItem>
                          <SelectItem value="other">Otra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Preferencias de Notificaciones
                  </CardTitle>
                  <CardDescription>
                    Configura cómo y cuándo quieres recibir notificaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Canales de Notificación
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                          <p className="text-sm text-muted-foreground">Recibe actualizaciones importantes por email</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notifications.email}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, email: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifications">Notificaciones Push</Label>
                          <p className="text-sm text-muted-foreground">Recibe notificaciones en tu navegador</p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={notifications.push}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, push: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-notifications">Notificaciones SMS</Label>
                          <p className="text-sm text-muted-foreground">Recibe alertas importantes por SMS</p>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={notifications.sms}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, sms: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Tipos de Notificaciones
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="study-reminders">Recordatorios de Estudio</Label>
                          <p className="text-sm text-muted-foreground">Te recordamos cuando es hora de estudiar</p>
                        </div>
                        <Switch
                          id="study-reminders"
                          checked={notifications.studyReminders}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, studyReminders: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="progress-updates">Actualizaciones de Progreso</Label>
                          <p className="text-sm text-muted-foreground">Resúmenes semanales de tu avance</p>
                        </div>
                        <Switch
                          id="progress-updates"
                          checked={notifications.progressUpdates}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, progressUpdates: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="class-alerts">Alertas de Clases</Label>
                          <p className="text-sm text-muted-foreground">Notificaciones sobre clases en vivo</p>
                        </div>
                        <Switch
                          id="class-alerts"
                          checked={notifications.classAlerts}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, classAlerts: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Tema y Apariencia
                  </CardTitle>
                  <CardDescription>
                    Personaliza el aspecto visual de la aplicación
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Tema</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Selecciona el tema que prefieras para tu experiencia
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setTheme('light')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            theme === 'light' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="w-full h-16 bg-white rounded mb-2 border border-gray-200"></div>
                          <span className="text-xs font-medium">Claro</span>
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            theme === 'dark' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="w-full h-16 bg-gray-900 rounded mb-2"></div>
                          <span className="text-xs font-medium">Oscuro</span>
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            theme === 'system' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="w-full h-16 bg-gradient-to-r from-white to-gray-900 rounded mb-2"></div>
                          <span className="text-xs font-medium">Sistema</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Idioma y Región
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select value={preferences.language} onValueChange={(value) => 
                          setPreferences(prev => ({ ...prev, language: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">Español (Chile)</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeFormat">Formato de Hora</Label>
                        <Select value={preferences.timeFormat} onValueChange={(value) => 
                          setPreferences(prev => ({ ...prev, timeFormat: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                            <SelectItem value="24h">24 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Study Tab */}
            <TabsContent value="study" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Preferencias de Estudio
                  </CardTitle>
                  <CardDescription>
                    Configura tu experiencia de aprendizaje personalizada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Técnica Pomodoro</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="study-session">Duración de Sesión de Estudio</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[preferences.studySessionLength]}
                            onValueChange={([value]) => 
                              setPreferences(prev => ({ ...prev, studySessionLength: value }))
                            }
                            max={60}
                            min={10}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>10 min</span>
                            <Badge variant="secondary">{preferences.studySessionLength} min</Badge>
                            <span>60 min</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="break-length">Duración de Descanso</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[preferences.breakLength]}
                            onValueChange={([value]) => 
                              setPreferences(prev => ({ ...prev, breakLength: value }))
                            }
                            max={30}
                            min={5}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>5 min</span>
                            <Badge variant="secondary">{preferences.breakLength} min</Badge>
                            <span>30 min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Audio y Multimedia
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-play">Reproducir Automáticamente</Label>
                          <p className="text-sm text-muted-foreground">Videos y audios inician automáticamente</p>
                        </div>
                        <Switch
                          id="auto-play"
                          checked={preferences.autoPlay}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, autoPlay: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sound-effects">Efectos de Sonido</Label>
                          <p className="text-sm text-muted-foreground">Sonidos de notificaciones y logros</p>
                        </div>
                        <Switch
                          id="sound-effects"
                          checked={preferences.soundEffects}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, soundEffects: checked }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Volumen General</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[preferences.volume]}
                            onValueChange={([value]) => 
                              setPreferences(prev => ({ ...prev, volume: value }))
                            }
                            max={100}
                            min={0}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Silencio</span>
                            <Badge variant="secondary">{preferences.volume}%</Badge>
                            <span>Máximo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Guardado y Progreso
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-save">Guardado Automático</Label>
                        <p className="text-sm text-muted-foreground">Guarda tu progreso automáticamente</p>
                      </div>
                      <Switch
                        id="auto-save"
                        checked={preferences.autoSave}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, autoSave: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacidad y Datos
                  </CardTitle>
                  <CardDescription>
                    Controla cómo se usan y comparten tus datos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Visibilidad del Perfil
                    </h4>
                    <Select value={privacy.profileVisibility} onValueChange={(value) => 
                      setPrivacy(prev => ({ ...prev, profileVisibility: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="private">Privado</SelectItem>
                        <SelectItem value="friends">Solo Compañeros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Recopilación de Datos
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="data-collection">Recopilación de Datos de Aprendizaje</Label>
                          <p className="text-sm text-muted-foreground">Ayúdanos a mejorar con datos anónimos</p>
                        </div>
                        <Switch
                          id="data-collection"
                          checked={privacy.dataCollection}
                          onCheckedChange={(checked) => 
                            setPrivacy(prev => ({ ...prev, dataCollection: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="analytics">Análisis y Métricas</Label>
                          <p className="text-sm text-muted-foreground">Datos para mejorar la experiencia</p>
                        </div>
                        <Switch
                          id="analytics"
                          checked={privacy.analytics}
                          onCheckedChange={(checked) => 
                            setPrivacy(prev => ({ ...prev, analytics: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="third-party">Compartir con Terceros</Label>
                          <p className="text-sm text-muted-foreground">Compartir datos con partners educativos</p>
                        </div>
                        <Switch
                          id="third-party"
                          checked={privacy.thirdPartySharing}
                          onCheckedChange={(checked) => 
                            setPrivacy(prev => ({ ...prev, thirdPartySharing: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Configuraciones Avanzadas
                  </CardTitle>
                  <CardDescription>
                    Ajustes técnicos y experimentales para usuarios avanzados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Rendimiento
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="reduced-motion">Movimiento Reducido</Label>
                          <p className="text-sm text-muted-foreground">Reduce animaciones para mejor rendimiento</p>
                        </div>
                        <Switch
                          id="reduced-motion"
                          checked={performance.reducedMotion}
                          onCheckedChange={(checked) => 
                            setPerformance(prev => ({ ...prev, reducedMotion: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-download">Descarga Automática</Label>
                          <p className="text-sm text-muted-foreground">Descargar contenido para uso offline</p>
                        </div>
                        <Switch
                          id="auto-download"
                          checked={performance.autoDownload}
                          onCheckedChange={(checked) => 
                            setPerformance(prev => ({ ...prev, autoDownload: checked }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cache-size">Tamaño de Caché</Label>
                        <Select value={performance.cacheSize} onValueChange={(value) => 
                          setPerformance(prev => ({ ...prev, cacheSize: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Pequeño (100MB)</SelectItem>
                            <SelectItem value="medium">Medio (500MB)</SelectItem>
                            <SelectItem value="large">Grande (1GB)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-orange-600">
                      <Trash2 className="h-4 w-4" />
                      Zona de Peligro
                    </h4>
                    <div className="space-y-3 p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-orange-800">
                          Borrar Datos de Progreso
                        </Label>
                        <p className="text-sm text-orange-700">
                          Esta acción eliminará permanentemente todo tu progreso de aprendizaje
                        </p>
                        <Button variant="outline" size="sm" className="text-orange-600 border-orange-200">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Borrar Progreso
                        </Button>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-red-800">
                          Eliminar Cuenta
                        </Label>
                        <p className="text-sm text-red-700">
                          Eliminar permanentemente tu cuenta y todos los datos asociados
                        </p>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar Cuenta
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleResetSettings}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Restablecer
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="flex items-center gap-2"
            >
              <Save className="h-3 w-3" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}