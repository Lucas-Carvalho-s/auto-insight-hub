import { AlertTriangle, Car, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Viewer3DErrorFallbackProps {
  onRetry?: () => void;
}

const Viewer3DErrorFallback = ({ onRetry }: Viewer3DErrorFallbackProps) => {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-xl border border-border/50">
      {/* Technical Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="errorGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#errorGrid)" />
        </svg>
      </div>

      {/* Fallback Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Icon Container */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/30">
            <Car className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
          </div>
        </div>

        {/* Message */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Visualizador 3D Indisponível
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Não foi possível carregar o modelo 3D. Isso pode ocorrer devido a limitações do navegador ou WebGL.
        </p>

        {/* Technical Info */}
        <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-border/30">
          <p className="text-xs font-mono text-muted-foreground">
            Fallback: Vista 2D Blueprint Ativa
          </p>
        </div>

        {/* Retry Button */}
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        )}
      </div>
    </div>
  );
};

export default Viewer3DErrorFallback;
