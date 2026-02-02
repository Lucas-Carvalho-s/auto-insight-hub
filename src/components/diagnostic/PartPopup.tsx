import { X, ZoomIn, AlertTriangle, ImageOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DiagnosticResult } from "@/data/diagnosticData";
import { getPartImage, VisualContext } from "@/data/partImagesMap";
import { getPartImageUrl, hasPartImage, FALLBACK_PART_IMAGE } from "@/data/partImageRegistry";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface PartPopupProps {
  result: DiagnosticResult;
  onClose: () => void;
  isOpen: boolean;
  visualContext?: VisualContext | null;
}

const PartPopup = ({ result, onClose, isOpen, visualContext }: PartPopupProps) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error when part changes
  useEffect(() => {
    setImageError(false);
  }, [visualContext?.specific_part_name, result.peca?.nome]);

  if (!isOpen || !result) return null;

  // Get the part name from visual context or result
  const partName = visualContext?.specific_part_name || result.peca?.nome;
  
  // Priority: 1) New registry, 2) Old mapping, 3) Fallback
  const registryImageUrl = getPartImageUrl(partName);
  const hasRegistryImage = hasPartImage(partName);
  
  // Get legacy mapping info for category display
  const legacyPartInfo = getPartImage(partName);
  
  // Use registry if available, otherwise fall back to legacy
  const imageUrl = hasRegistryImage ? registryImageUrl : legacyPartInfo.url;
  const category = legacyPartInfo.category;

  // SVG fallback images for when network images fail
  const svgFallbacks: Record<string, string> = {
    freios: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%231e293b' stroke='%2306b6d4' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='35' fill='none' stroke='%2306b6d4' stroke-width='3'/%3E%3Ccircle cx='50' cy='50' r='20' fill='%230f172a' stroke='%2306b6d4' stroke-width='2'/%3E%3Crect x='15' y='45' width='70' height='10' rx='2' fill='%23f59e0b' opacity='0.8'/%3E%3Ctext x='50' y='90' text-anchor='middle' fill='%2394a3b8' font-size='8'%3EPastilha de Freio%3C/text%3E%3C/svg%3E",
    motor: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='10' y='20' width='80' height='60' rx='5' fill='%231e293b' stroke='%2306b6d4' stroke-width='2'/%3E%3Crect x='20' y='30' width='25' height='20' rx='2' fill='%230f172a' stroke='%2306b6d4'/%3E%3Crect x='55' y='30' width='25' height='20' rx='2' fill='%230f172a' stroke='%2306b6d4'/%3E%3Ccircle cx='32' cy='65' r='8' fill='%23f59e0b' opacity='0.8'/%3E%3Ccircle cx='68' cy='65' r='8' fill='%23f59e0b' opacity='0.8'/%3E%3Cpath d='M50 10 L50 20' stroke='%2306b6d4' stroke-width='3'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2394a3b8' font-size='8'%3EMotor%3C/text%3E%3C/svg%3E",
    suspensao: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20 20 L50 80 L80 20' fill='none' stroke='%2306b6d4' stroke-width='3'/%3E%3Ccircle cx='20' cy='20' r='8' fill='%231e293b' stroke='%23f59e0b' stroke-width='2'/%3E%3Ccircle cx='80' cy='20' r='8' fill='%231e293b' stroke='%23f59e0b' stroke-width='2'/%3E%3Ccircle cx='50' cy='80' r='10' fill='%231e293b' stroke='%2306b6d4' stroke-width='2'/%3E%3Cpath d='M35 45 Q50 35 65 45' fill='none' stroke='%2306b6d4' stroke-width='2'/%3E%3Ctext x='50' y='98' text-anchor='middle' fill='%2394a3b8' font-size='8'%3ESuspensão%3C/text%3E%3C/svg%3E",
    escapamento: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M10 50 L30 50 Q40 50 45 40 L55 40 Q60 40 65 50 L90 50' fill='none' stroke='%2306b6d4' stroke-width='4'/%3E%3Crect x='30' y='35' width='40' height='30' rx='5' fill='%231e293b' stroke='%23f59e0b' stroke-width='2'/%3E%3Cpath d='M85 45 Q95 35 90 25' fill='none' stroke='%2394a3b8' stroke-width='2' opacity='0.5'/%3E%3Cpath d='M88 48 Q100 38 95 28' fill='none' stroke='%2394a3b8' stroke-width='2' opacity='0.3'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2394a3b8' font-size='8'%3EEscapamento%3C/text%3E%3C/svg%3E",
    generic: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%231e293b' stroke='%2306b6d4' stroke-width='2'/%3E%3Cpath d='M50 25 L50 50 L70 60' fill='none' stroke='%2306b6d4' stroke-width='3' stroke-linecap='round'/%3E%3Ccircle cx='50' cy='50' r='5' fill='%23f59e0b'/%3E%3Ctext x='50' y='90' text-anchor='middle' fill='%2394a3b8' font-size='8'%3EPeça%3C/text%3E%3C/svg%3E"
  };

  const getSvgFallback = () => {
    if (result.zona === 'freios') return svgFallbacks.freios;
    if (result.zona === 'motor') return svgFallbacks.motor;
    if (result.zona?.includes('suspensao')) return svgFallbacks.suspensao;
    if (result.zona === 'escapamento') return svgFallbacks.escapamento;
    return svgFallbacks.generic;
  };

  const displayImage = imageError ? getSvgFallback() : imageUrl;

  return (
    <AnimatePresence>
      <motion.div 
        className="absolute top-4 right-4 z-20"
        initial={{ opacity: 0, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="w-72 glass border-primary/30 glow-cyan-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">Peça Identificada</CardTitle>
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
            <motion.div 
              className="relative aspect-video rounded-lg bg-slate-950 border border-border/50 overflow-hidden flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {imageError ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageOff className="w-8 h-8" />
                  <span className="text-xs">Imagem não disponível</span>
                </div>
              ) : (
                <img 
                  src={displayImage} 
                  alt={legacyPartInfo.alt || result.peca?.nome || 'Peça'}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              )}
              <div className="absolute top-2 right-2">
                <Badge 
                  className={cn(
                    "text-[10px] border",
                    result.urgencia === 'alta' 
                      ? 'bg-destructive/20 text-destructive border-destructive/30'
                      : result.urgencia === 'media'
                      ? 'bg-warning/20 text-warning border-warning/30'
                      : 'bg-success/20 text-success border-success/30'
                  )}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {result.urgencia === 'alta' ? 'Crítico' : result.urgencia === 'media' ? 'Atenção' : 'Baixo'}
                </Badge>
              </div>
              {/* Category badge */}
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-[10px] bg-secondary/80">
                  {category}
                </Badge>
              </div>
            </motion.div>

            {/* Part Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-semibold text-sm text-foreground">
                {visualContext?.specific_part_name || result.peca?.nome || 'Componente'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                {result.peca?.funcao || 'Análise em andamento...'}
              </p>
            </motion.div>

            {/* Symptoms Preview */}
            {result.peca?.sintomas && result.peca.sintomas.length > 0 && (
              <motion.div 
                className="space-y-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs font-medium text-muted-foreground">Sintomas típicos:</p>
                <ul className="text-xs text-foreground space-y-0.5">
                  {result.peca.sintomas.slice(0, 3).map((sintoma, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-primary">•</span>
                      <span className="line-clamp-1">{sintoma}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Visual Context Indicator */}
            {visualContext?.highlight_zone_id && (
              <motion.div 
                className="pt-2 border-t border-border/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-[10px] text-muted-foreground">
                  Zona: <span className="text-primary font-medium">
                    {visualContext.highlight_zone_id.replace('zone_', '').replace(/_/g, ' ')}
                  </span>
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default PartPopup;
