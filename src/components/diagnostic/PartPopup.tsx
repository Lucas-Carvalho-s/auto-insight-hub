import { X, ZoomIn, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DiagnosticResult } from "@/data/diagnosticData";
import { cn } from "@/lib/utils";

interface PartPopupProps {
  result: DiagnosticResult;
  onClose: () => void;
  isOpen: boolean;
}

const PartPopup = ({ result, onClose, isOpen }: PartPopupProps) => {
  if (!isOpen || !result) return null;

  const partImages: Record<string, string> = {
    freios: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%231e293b' stroke='%2306b6d4' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='35' fill='none' stroke='%2306b6d4' stroke-width='3'/%3E%3Ccircle cx='50' cy='50' r='20' fill='%230f172a' stroke='%2306b6d4' stroke-width='2'/%3E%3Crect x='15' y='45' width='70' height='10' rx='2' fill='%23f59e0b' opacity='0.8'/%3E%3Ctext x='50' y='90' text-anchor='middle' fill='%2394a3b8' font-size='8'%3EPastilha de Freio%3C/text%3E%3C/svg%3E",
    motor: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='10' y='20' width='80' height='60' rx='5' fill='%231e293b' stroke='%2306b6d4' stroke-width='2'/%3E%3Crect x='20' y='30' width='25' height='20' rx='2' fill='%230f172a' stroke='%2306b6d4'/%3E%3Crect x='55' y='30' width='25' height='20' rx='2' fill='%230f172a' stroke='%2306b6d4'/%3E%3Ccircle cx='32' cy='65' r='8' fill='%23f59e0b' opacity='0.8'/%3E%3Ccircle cx='68' cy='65' r='8' fill='%23f59e0b' opacity='0.8'/%3E%3Cpath d='M50 10 L50 20' stroke='%2306b6d4' stroke-width='3'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2394a3b8' font-size='8'%3ERadiador%3C/text%3E%3C/svg%3E",
    suspensao: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20 20 L50 80 L80 20' fill='none' stroke='%2306b6d4' stroke-width='3'/%3E%3Ccircle cx='20' cy='20' r='8' fill='%231e293b' stroke='%23f59e0b' stroke-width='2'/%3E%3Ccircle cx='80' cy='20' r='8' fill='%231e293b' stroke='%23f59e0b' stroke-width='2'/%3E%3Ccircle cx='50' cy='80' r='10' fill='%231e293b' stroke='%2306b6d4' stroke-width='2'/%3E%3Cpath d='M35 45 Q50 35 65 45' fill='none' stroke='%2306b6d4' stroke-width='2'/%3E%3Ctext x='50' y='98' text-anchor='middle' fill='%2394a3b8' font-size='8'%3EBieleta%3C/text%3E%3C/svg%3E",
    escapamento: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M10 50 L30 50 Q40 50 45 40 L55 40 Q60 40 65 50 L90 50' fill='none' stroke='%2306b6d4' stroke-width='4'/%3E%3Crect x='30' y='35' width='40' height='30' rx='5' fill='%231e293b' stroke='%23f59e0b' stroke-width='2'/%3E%3Cpath d='M85 45 Q95 35 90 25' fill='none' stroke='%2394a3b8' stroke-width='2' opacity='0.5'/%3E%3Cpath d='M88 48 Q100 38 95 28' fill='none' stroke='%2394a3b8' stroke-width='2' opacity='0.3'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2394a3b8' font-size='8'%3ECatalisador%3C/text%3E%3C/svg%3E",
  };

  const getPartImage = () => {
    if (result.zona === 'freios') return partImages.freios;
    if (result.zona === 'motor') return partImages.motor;
    if (result.zona?.includes('suspensao')) return partImages.suspensao;
    if (result.zona === 'escapamento') return partImages.escapamento;
    return partImages.motor;
  };

  return (
    <div className="absolute top-4 right-4 z-20 animate-scale-in">
      <Card className="w-64 glass border-primary/30 glow-cyan-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Peça Sob Suspeita</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Part Image */}
          <div className="relative aspect-square rounded-lg bg-slate-950 border border-border/50 overflow-hidden flex items-center justify-center">
            <img 
              src={getPartImage()} 
              alt={result.peca.nome}
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute top-2 right-2">
              <Badge 
                className={cn(
                  "text-[10px] border",
                  result.urgencia === 'alta' 
                    ? 'bg-destructive/20 text-destructive border-destructive/30'
                    : 'bg-warning/20 text-warning border-warning/30'
                )}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                {result.urgencia === 'alta' ? 'Crítico' : 'Atenção'}
              </Badge>
            </div>
          </div>

          {/* Part Info */}
          <div>
            <h4 className="font-semibold text-sm text-foreground">
              {result.peca.nome}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
              {result.peca.funcao}
            </p>
          </div>

          {/* Symptoms Preview */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Sintomas típicos:</p>
            <ul className="text-xs text-foreground space-y-0.5">
              {result.peca.sintomas.slice(0, 2).map((sintoma, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-primary">•</span>
                  <span className="line-clamp-1">{sintoma}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartPopup;
