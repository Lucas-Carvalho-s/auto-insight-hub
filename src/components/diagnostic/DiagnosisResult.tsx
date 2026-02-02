import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { DiagnosticResult } from "@/data/diagnosticData";
import PartDetailCard from "./PartDetailCard";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface DiagnosisResultProps {
  result: DiagnosticResult | null;
  className?: string;
}

const DiagnosisResult = ({ result, className }: DiagnosisResultProps) => {
  if (!result) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-muted-foreground py-12", className)}>
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
          <Info className="w-8 h-8 text-primary/50" />
        </div>
        <p className="text-lg font-medium">Nenhum Diagnóstico</p>
        <p className="text-sm text-center mt-2 max-w-xs">
          Digite um sintoma no painel à esquerda para receber o diagnóstico do veículo
        </p>
      </div>
    );
  }

  const urgenciaConfig = {
    alta: {
      color: 'bg-destructive/20 text-destructive border-destructive/30',
      icon: AlertTriangle,
      label: 'Urgência Alta'
    },
    media: {
      color: 'bg-warning/20 text-warning border-warning/30',
      icon: AlertCircle,
      label: 'Urgência Média'
    },
    baixa: {
      color: 'bg-success/20 text-success border-success/30',
      icon: Info,
      label: 'Urgência Baixa'
    }
  };

  const config = urgenciaConfig[result.urgencia];
  const UrgenciaIcon = config.icon;

  return (
    <div className={cn("space-y-4 animate-slide-up", className)}>
      {/* Main Diagnosis Card */}
      <Card className="glass border-border/50 overflow-hidden">
        <div className={cn(
          "h-1",
          result.urgencia === 'alta' ? 'bg-destructive' :
          result.urgencia === 'media' ? 'bg-warning' : 'bg-success'
        )} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                result.urgencia === 'alta' ? 'bg-destructive/20' :
                result.urgencia === 'media' ? 'bg-warning/20' : 'bg-success/20'
              )}>
                <UrgenciaIcon className={cn(
                  "w-5 h-5",
                  result.urgencia === 'alta' ? 'text-destructive' :
                  result.urgencia === 'media' ? 'text-warning' : 'text-success'
                )} />
              </div>
              <div>
                <CardTitle className="text-lg">Diagnóstico</CardTitle>
                <p className="text-xs text-muted-foreground">ID: {result.id}</p>
              </div>
            </div>
            <Badge className={cn("border", config.color)}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fault Name */}
          <div>
            <h3 className="text-xl font-bold text-foreground text-glow-cyan">
              {result.falha}
            </h3>
          </div>

          {/* Technical Description with Markdown */}
          <div className="bg-secondary/30 rounded-lg p-3 border border-border/30">
            <div className="prose prose-sm prose-invert max-w-none prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-em:text-primary/90 prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:marker:text-primary prose-headings:text-foreground prose-headings:font-semibold">
              <ReactMarkdown>
                {result.descricao}
              </ReactMarkdown>
            </div>
          </div>

          {/* Zone indicator */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-muted-foreground">Zona afetada:</span>
            <span className="text-foreground font-medium capitalize">
              {result.zona?.replace(/_/g, ' ')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Part Detail and Action Cards */}
      <PartDetailCard 
        peca={result.peca} 
        acaoRecomendada={result.acaoRecomendada} 
      />
    </div>
  );
};

export default DiagnosisResult;
