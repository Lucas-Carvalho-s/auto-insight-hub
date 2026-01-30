import { useEffect, useState } from "react";
import { Check, Loader2, Radio, FileJson, Database, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiagnosticResult } from "@/data/diagnosticData";

interface ProcessingStepperProps {
  isProcessing: boolean;
  result: DiagnosticResult | null;
  userInput: string;
}

interface Step {
  id: number;
  label: string;
  description: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  {
    id: 1,
    label: "Recebendo entrada",
    description: "Capturando áudio/texto natural...",
    icon: Radio,
  },
  {
    id: 2,
    label: "Refinando prompt",
    description: "Agente estrutura o input em JSON...",
    icon: FileJson,
  },
  {
    id: 3,
    label: "Consultando RAG",
    description: "Base de conhecimento técnico...",
    icon: Database,
  },
  {
    id: 4,
    label: "Gerando diagnóstico",
    description: "Análise e recomendações...",
    icon: Sparkles,
  },
];

const ProcessingStepper = ({ isProcessing, result, userInput }: ProcessingStepperProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (isProcessing) {
      setCurrentStep(1);
      setCompletedSteps([]);
      
      const timers = [
        setTimeout(() => {
          setCompletedSteps([1]);
          setCurrentStep(2);
        }, 500),
        setTimeout(() => {
          setCompletedSteps([1, 2]);
          setCurrentStep(3);
        }, 1000),
        setTimeout(() => {
          setCompletedSteps([1, 2, 3]);
          setCurrentStep(4);
        }, 1500),
      ];

      return () => timers.forEach(clearTimeout);
    } else if (result) {
      setCompletedSteps([1, 2, 3, 4]);
      setCurrentStep(0);
    }
  }, [isProcessing, result]);

  if (!isProcessing && !result) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Timeline Steps */}
      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Vertical Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-4 top-8 w-0.5 h-full -translate-x-1/2 transition-colors duration-500",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}

              {/* Step Icon */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-primary border-primary"
                    : isCurrent
                    ? "bg-primary/20 border-primary animate-pulse"
                    : "bg-secondary border-border"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-primary-foreground" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <StepIcon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>

                {/* JSON Transform Animation - Step 2 */}
                {step.id === 2 && (isCurrent || isCompleted) && result && (
                  <div className="mt-3 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        "{userInput}"
                      </div>
                      <div className="text-primary">→</div>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-3 border border-primary/30 glow-cyan-sm">
                      <pre className="text-xs text-primary overflow-x-auto">
{`{
  "sintoma": "${result.promptEstruturado.sintoma}",
  "sistema": "${result.promptEstruturado.localizacao}",
  "contexto": "${result.promptEstruturado.condicao}"
}`}
                      </pre>
                    </div>
                  </div>
                )}

                {/* RAG Query Animation - Step 3 */}
                {step.id === 3 && isCurrent && (
                  <div className="mt-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Database className="w-3 h-3 text-primary animate-pulse" />
                      <span>Buscando em base técnica automotiva...</span>
                    </div>
                    <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-pulse w-3/4" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {!isProcessing && result && (
        <div className="flex items-center gap-2 text-sm text-success animate-fade-in">
          <Check className="w-4 h-4" />
          <span>Análise completa</span>
        </div>
      )}
    </div>
  );
};

export default ProcessingStepper;
