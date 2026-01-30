import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Wrench, Clock, CheckCircle2, ZoomIn } from "lucide-react";
import { DiagnosticResult } from "@/data/diagnosticData";
import { cn } from "@/lib/utils";

interface PartDetailCardProps {
  peca: DiagnosticResult['peca'];
  acaoRecomendada: DiagnosticResult['acaoRecomendada'];
  className?: string;
}

const PartDetailCard = ({ peca, acaoRecomendada, className }: PartDetailCardProps) => {
  const complexidadeColors = {
    simples: 'bg-success/20 text-success border-success/30',
    moderada: 'bg-warning/20 text-warning border-warning/30',
    complexa: 'bg-destructive/20 text-destructive border-destructive/30'
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Card da Peça */}
      <Card className="glass border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ZoomIn className="w-5 h-5 text-primary" />
              Peça em Detalhe
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Imagem da peça com efeito de zoom */}
          <div className="relative group">
            <div className="aspect-video bg-secondary/50 rounded-lg overflow-hidden border border-border/50 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Wrench className="w-12 h-12 text-primary/60" />
              </div>
              {/* Overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded">
                Clique para ampliar
              </p>
            </div>
          </div>

          {/* Nome e função */}
          <div>
            <h4 className="font-semibold text-foreground">{peca.nome}</h4>
            <p className="text-sm text-muted-foreground mt-1">{peca.funcao}</p>
          </div>

          <Separator className="bg-border/50" />

          {/* Sintomas associados */}
          <div>
            <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Sintomas Associados
            </h5>
            <ul className="space-y-1">
              {peca.sintomas.map((sintoma, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                  {sintoma}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Card de Ação Recomendada */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Ação Recomendada
            </CardTitle>
            <Badge className={cn("border", complexidadeColors[acaoRecomendada.complexidade])}>
              {acaoRecomendada.complexidade.charAt(0).toUpperCase() + acaoRecomendada.complexidade.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tempo estimado */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Tempo estimado:</span>
            <span className="text-foreground font-medium">{acaoRecomendada.tempoEstimado}</span>
          </div>

          <Separator className="bg-border/50" />

          {/* Passos */}
          <div>
            <h5 className="text-sm font-medium text-foreground mb-3">Passos para o Reparo</h5>
            <ol className="space-y-2">
              {acaoRecomendada.passos.map((passo, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground pt-0.5">{passo}</span>
                </li>
              ))}
            </ol>
          </div>

          <Separator className="bg-border/50" />

          {/* Ferramentas */}
          <div>
            <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              Ferramentas Necessárias
            </h5>
            <div className="flex flex-wrap gap-2">
              {acaoRecomendada.ferramentas.map((ferramenta, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {ferramenta}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartDetailCard;
