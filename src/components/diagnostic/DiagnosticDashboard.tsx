import { useState } from "react";
import { Car, Activity, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import SymptomInput from "./SymptomInput";
import VehicleViewer from "./VehicleViewer";
import DiagnosisResult from "./DiagnosisResult";
import { DiagnosticResult, VehicleZone, analyzeSymptopm } from "@/data/diagnosticData";
import { Toaster } from "@/components/ui/toaster";

const DiagnosticDashboard = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [highlightedZone, setHighlightedZone] = useState<VehicleZone>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleAnalyze = async (symptom: string) => {
    setIsProcessing(true);
    setResult(null);
    setHighlightedZone(null);

    // Simulate AI processing delay with stepped timing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const diagnosticResult = analyzeSymptopm(symptom);
    
    if (diagnosticResult) {
      setResult(diagnosticResult);
      setHighlightedZone(diagnosticResult.zona);
    }
    
    setIsProcessing(false);
  };

  const handleReset = () => {
    setResult(null);
    setHighlightedZone(null);
    setIsProcessing(false);
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
          <div className="container mx-auto flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Debug Mode: {result ? `Resultado ativo (${result.id})` : 'Nenhum resultado'}
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
            AutoDiagnostic AI • Demonstração com dados simulados • v1.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DiagnosticDashboard;
