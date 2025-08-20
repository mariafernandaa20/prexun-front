'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChatAPI } from '@/lib/api/chat';
import { FileText, Send, Bot } from 'lucide-react';
import { toast } from 'sonner';

interface TestEvaluatorProps {
  testId?: number;
  testName?: string;
}

export default function TestEvaluator({
  testId,
  testName,
}: TestEvaluatorProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<string[]>([]);

  const startTestEvaluation = async (testContent: string) => {
    setIsLoading(true);
    try {
      // Crear nueva sesión para evaluación de examen
      const sessionResponse = await ChatAPI.createSession(
        'test_evaluation',
        testId
      );
      setSessionId(sessionResponse.session_id);

      // Enviar el contenido del examen para evaluación
      const evaluationMessage = `Por favor evalúa el siguiente examen y proporciona retroalimentación detallada:

EXAMEN: ${testName || 'Examen sin nombre'}
ID: ${testId || 'Sin ID'}

CONTENIDO DEL EXAMEN:
${testContent}

Por favor proporciona:
1. Calificación general (1-10)
2. Fortalezas identificadas
3. Áreas de mejora
4. Recomendaciones específicas
5. Comentarios detallados por sección`;

      const response = await ChatAPI.sendMessage({
        message: evaluationMessage,
        conversation_type: 'test_evaluation',
        related_id: testId,
        session_id: sessionResponse.session_id,
        include_history: false,
      });

      setEvaluationResults([response.response]);
      toast.success('Evaluación iniciada correctamente');
    } catch (error) {
      toast.error('Error al iniciar la evaluación');
    } finally {
      setIsLoading(false);
    }
  };

  const sendFollowUpQuestion = async () => {
    if (!currentMessage.trim() || !sessionId || isLoading) return;

    setIsLoading(true);
    try {
      const response = await ChatAPI.sendMessage({
        message: currentMessage,
        conversation_type: 'test_evaluation',
        related_id: testId,
        session_id: sessionId,
        include_history: true,
      });

      setEvaluationResults((prev) => [
        ...prev,
        `PREGUNTA: ${currentMessage}`,
        `RESPUESTA: ${response.response}`,
      ]);
      setCurrentMessage('');
      toast.success('Pregunta enviada');
    } catch (error) {
      toast.error('Error al enviar la pregunta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sección de inicio de evaluación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Evaluador de Exámenes con IA
            {testName && (
              <span className="text-sm font-normal text-gray-600">
                - {testName}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Pega aquí el contenido del examen que quieres evaluar..."
              rows={6}
              className="min-h-[150px]"
              id="test-content"
            />
            <Button
              onClick={() => {
                const content = (
                  document.getElementById('test-content') as HTMLTextAreaElement
                )?.value;
                if (content.trim()) {
                  startTestEvaluation(content);
                } else {
                  toast.error('Por favor ingresa el contenido del examen');
                }
              }}
              disabled={isLoading}
              className="w-full"
            >
              <Bot className="h-4 w-4 mr-2" />
              {isLoading ? 'Evaluando...' : 'Iniciar Evaluación con IA'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de evaluación */}
      {evaluationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Resultados de la Evaluación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {evaluationResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    result.startsWith('PREGUNTA:')
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : result.startsWith('RESPUESTA:')
                        ? 'bg-green-50 border-l-4 border-green-500'
                        : 'bg-gray-50 border-l-4 border-gray-500'
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    {result.replace(/^(PREGUNTA|RESPUESTA):\s*/, '')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sección de preguntas de seguimiento */}
      {sessionId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Preguntas de Seguimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Haz una pregunta específica sobre la evaluación..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && !isLoading && sendFollowUpQuestion()
                }
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendFollowUpQuestion}
                disabled={isLoading || !currentMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Puedes hacer preguntas específicas como: "¿Qué otros ejercicios
              recomendarías?", "¿Cómo podría mejorar en matemáticas?", etc.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
