import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Cpu, Send, Sparkles } from "lucide-react";
import LoadingAnimation from "./LoadingAnimation";
import { DiagnosticResult } from "@/data/diagnosticData";
import { cn } from "@/lib/utils";

interface SymptomInputProps {
  onAnalyze: (symptom: string) => void;
  isProcessing: boolean;
  result: DiagnosticResult | null;
  className?: string;
}

const SymptomInput = ({ onAnalyze, isProcessing, result, className }: SymptomInputProps) => {
  const [symptom, setSymptom] = useState("");

  const handleSubmit = () => {
    if (symptom.trim()) {
      onAnalyze(symptom);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input Card */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Descreva o Sintoma
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex: Barulho de batida seca na frente ao passar em buracos, ou chiado ao frear, ou motor aquecendo demais..."
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[120px] bg-secondary/50 border-border/50 resize-none focus:border-primary focus:ring-primary/20"
            disabled={isProcessing}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!symptom.trim() || isProcessing}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan-sm transition-all duration-300 hover:glow-cyan"
          >
            <Send className="w-4 h-4 mr-2" />
            Analisar Sintoma
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Pressione Ctrl+Enter para enviar
          </p>
        </CardContent>
      </Card>

      {/* AI Processing Box */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Processamento IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isProcessing && !result && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                <Cpu className="w-6 h-6 text-primary/50" />
              </div>
              <p className="text-sm">Aguardando entrada...</p>
              <p className="text-xs mt-1 text-muted-foreground/70">
                Digite um sintoma para iniciar a análise
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-6">
              <LoadingAnimation size="md" />
              <p className="text-sm text-primary mt-4 animate-pulse">
                Analisando sintomas...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Processando dados do veículo
              </p>
            </div>
          )}

          {!isProcessing && result && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-sm text-success">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Análise Completa
              </div>
              
              <div className="bg-secondary/50 rounded-lg p-3 border border-border/30">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Prompt Estruturado:
                </p>
                <pre className="text-xs text-primary overflow-x-auto">
{JSON.stringify(result.promptEstruturado, null, 2)}
                </pre>
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Entrada:</span> "{symptom}"
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomInput;
