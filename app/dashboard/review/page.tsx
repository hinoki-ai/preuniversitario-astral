'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, BookOpen, Clock } from 'lucide-react';
import { PaymentGate } from '@/components/PaymentGate';

export default function ReviewPage() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Repaso Inteligente</h1>
      </div>
      
      <PaymentGate 
        feature="Repaso Inteligente"
        description="Sistema de repetición espaciada que optimiza tu retención de conocimientos"
        premiumFeatures={[
          "Algoritmo adaptativo de repetición espaciada",
          "Identificación automática de temas débiles",
          "Programación inteligente de repasos",
          "Seguimiento de curva de olvido personal",
          "Notificaciones de repaso optimizadas",
          "Análisis de efectividad del repaso"
        ]}
        showPreview={false}
      >
        <ReviewContent />
      </PaymentGate>
    </div>
  );
}

function ReviewContent() {
  const reviewItems = useQuery(api.spacedRepetition.getReviewItems);

  if (!reviewItems) {
    return <div className="animate-pulse">Loading review items...</div>;
  }

  if (reviewItems.length === 0) {
    return (
      <Card className="p-6 text-center">
        <BookOpen className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">¡Excelente trabajo!</h3>
        <p className="text-muted-foreground">
          No tienes elementos para repasar ahora. Continúa tomando práctica PAES para mantener tu progreso.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-blue-600">
          {reviewItems.length} elementos listos
        </Badge>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">¿Cómo funciona el repaso inteligente?</span>
        </div>
        <p className="text-sm text-blue-800">
          Utilizamos algoritmos de repetición espaciada para mostrar preguntas cuando es óptimo repasarlas. 
          Los temas donde obtuviste menor puntaje aparecen con mayor frecuencia.
        </p>
      </div>

      <div className="grid gap-4">
        {reviewItems.map((item, index) => (
          <Card key={`${item.quizId}-${index}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.quizTitle}</CardTitle>
                <Badge 
                  variant={item.priority === 'high' ? 'destructive' : 'secondary'}
                >
                  {item.priority === 'high' ? 'Alta prioridad' : 'Prioridad media'}
                </Badge>
              </div>
              <CardDescription>{item.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Hace {item.daysSince} días
                  </div>
                  <div>
                    Último puntaje: {item.lastScore}%
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    // Navigate to the specific quiz
                    window.location.href = `/dashboard/paes?quiz=${item.quizId}`;
                  }}
                >
                  Repasar ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-gray-50">
        <div className="text-sm text-muted-foreground text-center">
          💡 <strong>Tip:</strong> El repaso regular es clave para el éxito en PAES. 
          Dedica 15-20 minutos diarios a repasar estos elementos.
        </div>
      </Card>
    </div>
  );
}