import { useState } from "react";
import { Car, Activity, Bug, Box, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import SymptomInput from "./SymptomInput";
import SmartVehicleViewer from "./SmartVehicleViewer";
import CarViewer3D from "./CarViewer3D";
import DiagnosisResult from "./DiagnosisResult";
import { DiagnosticResult, VehicleZone, analyzeSymptopm } from "@/data/diagnosticData";
import { CarView, HighlightZoneId, VisualContext } from "@/data/partImagesMap";
import { parseAIResponse, mapHighlightZoneToLegacy } from "@/utils/aiResponseParser";
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
  
  // New state for visual context
  const [visualContext, setVisualContext] = useState<VisualContext | null>(null);
  const [currentCarView, setCurrentCarView] = useState<CarView>('lateral');
  const [highlightZoneId, setHighlightZoneId] = useState<HighlightZoneId>(null);
  const [use3DViewer, setUse3DViewer] = useState(true); // Toggle between 2D/3D

  const handleAnalyze = async (symptom: string) => {
    setIsProcessing(true);
    setResult(null);
    setHighlightedZone(null);
    setAiResponse(null);
    setVisualContext(null);
    setHighlightZoneId(null);

    console.log('[DiagnosticDashboard] Iniciando análise para:', symptom);
    console.log('[DiagnosticDashboard] Thread ID existente:', threadId);

    try {
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

      // Save threadId for future conversations
      if (data?.threadId) {
        setThreadId(data.threadId);
        console.log('[DiagnosticDashboard] Thread ID salvo:', data.threadId);
      }

      // Parse the AI response (handles mixed text/JSON)
      const responseText = data?.response || '';
      const parsedResponse = parseAIResponse(responseText);
      
      console.log('[DiagnosticDashboard] Resposta parseada:', parsedResponse);
      
      setAiResponse(parsedResponse.response);

      // Handle visual context if present
      if (parsedResponse.visual_context) {
        const vc = parsedResponse.visual_context;
        setVisualContext(vc);
        
        // Update car view if specified
        if (vc.car_view_needed) {
          setCurrentCarView(vc.car_view_needed);
          console.log('[DiagnosticDashboard] Mudando vista para:', vc.car_view_needed);
        }
        
        // Update highlight zone
        if (vc.highlight_zone_id) {
          setHighlightZoneId(vc.highlight_zone_id);
          
          // Also set legacy zone for backward compatibility
          const legacyZone = mapHighlightZoneToLegacy(vc.highlight_zone_id) as VehicleZone;
          if (legacyZone) {
            setHighlightedZone(legacyZone);
          }
          
          console.log('[DiagnosticDashboard] Zona destacada:', vc.highlight_zone_id);
        }
      }

      // Use local analysis to determine vehicle zone for fallback
      const localResult = analyzeSymptopm(symptom);
      
      if (localResult) {
        // Combined result: local data + AI description
        const combinedResult: DiagnosticResult = {
          ...localResult,
          descricao: parsedResponse.response || localResult.descricao
        };
        setResult(combinedResult);
        
        // If no visual context, use local zone
        if (!parsedResponse.visual_context) {
          setHighlightedZone(localResult.zona);
        }
        
        console.log('[DiagnosticDashboard] Resultado combinado:', combinedResult);
      } else {
        // Generic result with AI response
        const genericResult: DiagnosticResult = {
          id: 'ai-response-' + Date.now(),
          zona: highlightedZone,
          falha: 'Análise do Assistente',
          urgencia: 'media',
          descricao: parsedResponse.response,
          peca: {
            nome: visualContext?.specific_part_name || 'Análise Geral',
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

      // Fallback to local analysis
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
    setVisualContext(null);
    setCurrentCarView('lateral');
    setHighlightZoneId(null);
    console.log('[DiagnosticDashboard] Estado resetado');
  };

  const handleZoneClick = (zone: VehicleZone) => {
    setHighlightedZone(zone);
  };

  const handleZoneIdClick = (zoneId: HighlightZoneId) => {
    setHighlightZoneId(zoneId);
    const legacyZone = mapHighlightZoneToLegacy(zoneId) as VehicleZone;
    if (legacyZone) {
      setHighlightedZone(legacyZone);
    }
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
              {/* 2D/3D Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUse3DViewer(!use3DViewer)}
                className="text-muted-foreground hover:text-foreground"
              >
                {use3DViewer ? <Layers className="w-4 h-4 mr-1" /> : <Box className="w-4 h-4 mr-1" />}
                {use3DViewer ? '2D' : '3D'}
              </Button>
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
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-muted-foreground">
                Debug Mode: {result ? `Resultado ativo (${result.id})` : 'Nenhum resultado'} | Thread: {threadId || 'Nenhuma'} | Vista: {currentCarView}
              </span>
              <div className="flex gap-2 flex-wrap">
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
            {visualContext && (
              <div className="bg-slate-900 p-2 rounded border border-border/30">
                <p className="text-muted-foreground">
                  Visual Context: {JSON.stringify(visualContext)}
                </p>
              </div>
            )}
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

          {/* Center Panel - Vehicle Viewer (3D or 2D) */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="glass border-border/50 rounded-xl h-[400px] lg:h-full overflow-hidden">
              {use3DViewer ? (
                <CarViewer3D 
                  highlightedZone={highlightedZone}
                  highlightZoneId={highlightZoneId}
                  carView={currentCarView}
                  onZoneClick={handleZoneClick}
                  onZoneIdClick={handleZoneIdClick}
                  result={result}
                  visualContext={visualContext}
                />
              ) : (
                <SmartVehicleViewer 
                  highlightedZone={highlightedZone}
                  highlightZoneId={highlightZoneId}
                  carView={currentCarView}
                  onZoneClick={handleZoneClick}
                  onZoneIdClick={handleZoneIdClick}
                  result={result}
                  visualContext={visualContext}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-4 order-3">
            <div className="lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-2">
              <DiagnosisResult result={result} visualContext={visualContext} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-3">
        <div className="container mx-auto px-4">
          <p className="text-xs text-muted-foreground text-center">
            AutoDiagnostic AI • Powered by OpenAI Assistants • v2.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DiagnosticDashboard;
