import { useState } from "react";
import { Car, Activity, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import SymptomInput from "./SymptomInput";
import VehicleViewer from "./VehicleViewer";
import DiagnosisResult from "./DiagnosisResult";
import { DiagnosticResult, VehicleZone, analyzeSymptopm, diagnosticDatabase } from "@/data/diagnosticData";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DiagnosticDashboard = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [highlightedZone, setHighlightedZone] = useState<VehicleZone>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  const handleAnalyze = async (symptom: string) => {
    setIsProcessing(true);
    setResult(null);
    setHighlightedZone(null);
    setAiResponse(null);

    console.log('[DiagnosticDashboard] Iniciando análise para:', symptom);
    console.log('[DiagnosticDashboard] Thread ID existente:', threadId);

    try {
      // Chamar a Edge Function do Supabase
      console.log('[DiagnosticDashboard] Chamando Edge Function diagnose...');
      
      const { data, error } = await supabase.functions.invoke('diagnose', {
        body: { 
          message: symptom,
          threadId: threadId 
        }
      });

      console.log('[DiagnosticDashboard] Resposta da Edge Function:', { data, error });

      if (error) {
        console.error('[DiagnosticDashboard] Erro na Edge Function:', error);
        throw new Error(error.message || 'Erro ao chamar o serviço de diagnóstico');
      }

      if (data?.error) {
        console.error('[DiagnosticDashboard] Erro retornado pelo backend:', data.error);
        throw new Error(data.error);
      }

      // Salvar o threadId para conversas futuras
      if (data?.threadId) {
        setThreadId(data.threadId);
        console.log('[DiagnosticDashboard] Thread ID salvo:', data.threadId);
      }

      // Armazenar a resposta da IA
      const responseText = data?.response || '';
      setAiResponse(responseText);
      console.log('[DiagnosticDashboard] Resposta da IA:', responseText);

      // Usar a análise local para determinar a zona do veículo a destacar
      // (isso permite manter a visualização do carro funcionando)
      const localResult = analyzeSymptopm(symptom);
      
      if (localResult) {
        // Criar um resultado combinado: dados locais + descrição da IA
        const combinedResult: DiagnosticResult = {
          ...localResult,
          descricao: responseText || localResult.descricao
        };
        setResult(combinedResult);
        setHighlightedZone(localResult.zona);
        console.log('[DiagnosticDashboard] Resultado combinado:', combinedResult);
      } else {
        // Se não houver match local, criar um resultado genérico com a resposta da IA
        const genericResult: DiagnosticResult = {
          id: 'ai-response-' + Date.now(),
          zona: null,
          falha: 'Análise do Assistente',
          urgencia: 'media',
          descricao: responseText,
          peca: {
            nome: 'Análise Geral',
            imagem: '/placeholder.svg',
            funcao: 'O assistente analisou seu sintoma e forneceu orientações.',
            sintomas: []
          },
          acaoRecomendada: {
            passos: ['Consulte as orientações do assistente acima'],
            complexidade: 'moderada',
            ferramentas: [],
            tempoEstimado: 'Variável'
          },
          promptEstruturado: {
            sintoma: symptom,
            localizacao: 'geral',
            condicao: 'verificar',
            gravidade: 'media'
          }
        };
        setResult(genericResult);
        console.log('[DiagnosticDashboard] Resultado genérico da IA:', genericResult);
      }

      toast({
        title: "Diagnóstico concluído",
        description: "O assistente analisou seu sintoma com sucesso.",
      });

    } catch (error) {
      console.error('[DiagnosticDashboard] Erro durante análise:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        variant: "destructive",
        title: "Erro no Diagnóstico",
        description: `Falha ao consultar o assistente: ${errorMessage}`,
      });

      // Fallback para análise local em caso de erro
      console.log('[DiagnosticDashboard] Usando fallback local...');
      const localResult = analyzeSymptopm(symptom);
      if (localResult) {
        setResult(localResult);
        setHighlightedZone(localResult.zona);
        toast({
          title: "Diagnóstico Local",
          description: "Usando base de dados local como fallback.",
        });
      }
    } finally {
      setIsProcessing(false);
      console.log('[DiagnosticDashboard] Análise finalizada');
    }
  };

  const handleReset = () => {
    setResult(null);
    setHighlightedZone(null);
    setIsProcessing(false);
    setAiResponse(null);
    console.log('[DiagnosticDashboard] Estado resetado');
  };

  const handleZoneClick = (zone: VehicleZone) => {
    setHighlightedZone(zone);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-cyan-sm">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground text-glow-cyan">
                  AutoDiagnostic AI
                </h1>
                <p className="text-xs text-muted-foreground">
                  Sistema Inteligente de Diagnóstico Veicular
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Bug className="w-4 h-4 mr-1" />
                Debug
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-success animate-pulse" />
                <span className="text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Debug Panel */}
      {showDebug && (
        <div className="bg-slate-950 border-b border-border/50 py-2 px-4 animate-fade-in">
          <div className="container mx-auto flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Debug Mode: {result ? `Resultado ativo (${result.id})` : 'Nenhum resultado'} | Thread: {threadId || 'Nenhuma'}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleAnalyze("problema nos freios chiando")}>
                  Testar Freios
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAnalyze("motor superaquecendo")}>
                  Testar Motor
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAnalyze("barulho na suspensão")}>
                  Testar Suspensão
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAnalyze("fumaça no escapamento")}>
                  Testar Escapamento
                </Button>
                <Button size="sm" variant="destructive" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
            {aiResponse && (
              <div className="bg-slate-900 p-2 rounded border border-border/30 max-h-32 overflow-auto">
                <p className="text-muted-foreground">Resposta IA: {aiResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-120px)]">
          {/* Left Panel - Input */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <SymptomInput 
              onAnalyze={handleAnalyze}
              onReset={handleReset}
              isProcessing={isProcessing}
              result={result}
            />
          </div>

          {/* Center Panel - Vehicle Viewer */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="glass border-border/50 rounded-xl h-[400px] lg:h-full overflow-hidden">
              <VehicleViewer 
                highlightedZone={highlightedZone}
                onZoneClick={handleZoneClick}
                result={result}
              />
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-4 order-3">
            <div className="lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-2">
              <DiagnosisResult result={result} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-3">
        <div className="container mx-auto px-4">
          <p className="text-xs text-muted-foreground text-center">
            AutoDiagnostic AI • Powered by OpenAI Assistants • v1.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DiagnosticDashboard;
