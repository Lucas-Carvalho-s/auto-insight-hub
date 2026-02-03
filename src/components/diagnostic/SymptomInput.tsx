import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Cpu, Send, Sparkles, RotateCcw, Loader2 } from "lucide-react";
import ProcessingStepper from "./ProcessingStepper";
import { DiagnosticResult } from "@/data/diagnosticData";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface SymptomInputProps {
  onAnalyze: (symptom: string) => void;
  onReset: () => void;
  isProcessing: boolean;
  result: DiagnosticResult | null;
  className?: string;
}

const SymptomInput = ({ onAnalyze, onReset, isProcessing, result, className }: SymptomInputProps) => {
  const [symptom, setSymptom] = useState("");
  const [hasError, setHasError] = useState(false);

  const handleSubmit = () => {
    if (!symptom.trim()) {
      setHasError(true);
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, descreva o sintoma do veículo antes de analisar.",
      });
      return;
    }
    setHasError(false);
    onAnalyze(symptom);
  };

  const handleReset = () => {
    setSymptom("");
    setHasError(false);
    onReset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSymptom(e.target.value);
    if (hasError && e.target.value.trim()) {
      setHasError(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input Card */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Descreva o Sintoma
            </CardTitle>
            {(result || symptom) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex: Barulho de batida seca na frente ao passar em buracos, ou chiado ao frear, ou motor aquecendo demais..."
            value={symptom}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[120px] bg-secondary/50 border-border/50 resize-none transition-all duration-200",
              "focus:border-primary focus:ring-primary/20",
              hasError && "border-destructive focus:border-destructive focus:ring-destructive/20"
            )}
            disabled={isProcessing}
          />
          {hasError && (
            <p className="text-xs text-destructive animate-fade-in">
              Descreva o sintoma antes de iniciar a análise
            </p>
          )}
          <Button 
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan-sm transition-all duration-300 hover:glow-cyan disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Diagnosticar
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Pressione Ctrl+Enter para enviar
          </p>
        </CardContent>
      </Card>

      {/* AI Processing Box with Stepper */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Pipeline de Processamento
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

          {(isProcessing || result) && (
            <ProcessingStepper 
              isProcessing={isProcessing}
              result={result}
              userInput={symptom}
            />
          )}
        </CardContent>
      </Card>

      {/* Debug Info - Discreto */}
      {result && (
        <div className="text-xs text-muted-foreground/50 text-center">
          ID: {result.id} • Zona: {result.zona}
        </div>
      )}
    </div>
  );
};

export default SymptomInput;
