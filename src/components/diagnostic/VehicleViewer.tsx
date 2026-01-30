import { VehicleZone } from "@/data/diagnosticData";
import { cn } from "@/lib/utils";

interface VehicleViewerProps {
  highlightedZone: VehicleZone;
  onZoneClick?: (zone: VehicleZone) => void;
  className?: string;
}

const VehicleViewer = ({ highlightedZone, onZoneClick, className }: VehicleViewerProps) => {
  const getZoneClasses = (zone: VehicleZone) => {
    const isHighlighted = highlightedZone === zone;
    return cn(
      "transition-all duration-300 cursor-pointer",
      isHighlighted 
        ? "fill-warning stroke-warning pulse-glow" 
        : "fill-primary/20 stroke-primary/60 hover:fill-primary/40 hover:stroke-primary"
    );
  };

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      {/* Background grid effect */}
      <div className="absolute inset-0 tech-grid opacity-30" />
      
      {/* Radial glow effect */}
      <div className="absolute inset-0 gradient-radial-cyan" />
      
      {/* SVG Vehicle - X-Ray Style */}
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full max-w-4xl"
        style={{ filter: 'drop-shadow(0 0 20px hsl(187 92% 44% / 0.2))' }}
      >
        {/* Definitions */}
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Warning glow filter */}
          <filter id="warningGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Grid pattern */}
          <pattern id="innerGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(187 92% 44% / 0.1)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Car body outline */}
        <g filter="url(#glow)">
          {/* Main body */}
          <path
            d="M 120 280 
               L 120 220 
               Q 130 180 180 170
               L 280 160
               Q 320 120 380 110
               L 480 110
               Q 540 115 580 150
               L 650 170
               Q 700 175 710 220
               L 710 280
               Q 700 290 680 290
               L 640 290
               Q 620 290 610 280
               L 230 280
               Q 220 290 200 290
               L 160 290
               Q 140 290 120 280
               Z"
            className="fill-secondary/30 stroke-primary"
            strokeWidth="2"
          />
          
          {/* Roof line */}
          <path
            d="M 280 160 Q 320 120 380 110 L 480 110 Q 540 115 580 150"
            className="fill-none stroke-primary"
            strokeWidth="1.5"
          />
          
          {/* Windows */}
          <path
            d="M 290 158 Q 325 125 380 118 L 420 118 L 420 155 L 290 158 Z"
            className="fill-primary/10 stroke-primary/60"
            strokeWidth="1"
          />
          <path
            d="M 430 118 L 475 118 Q 530 122 565 152 L 430 155 Z"
            className="fill-primary/10 stroke-primary/60"
            strokeWidth="1"
          />
          
          {/* Door lines */}
          <line x1="420" y1="155" x2="420" y2="270" className="stroke-primary/40" strokeWidth="1" />
          
          {/* Hood lines */}
          <path
            d="M 650 170 L 690 180 Q 700 185 705 200"
            className="fill-none stroke-primary/60"
            strokeWidth="1"
          />
          
          {/* Trunk lines */}
          <path
            d="M 180 170 L 140 185 Q 125 195 125 210"
            className="fill-none stroke-primary/60"
            strokeWidth="1"
          />
        </g>

        {/* Headlights */}
        <ellipse cx="700" cy="215" rx="12" ry="18" className="fill-primary/40 stroke-primary" strokeWidth="1" />
        <ellipse cx="130" cy="215" rx="10" ry="15" className="fill-destructive/30 stroke-destructive/60" strokeWidth="1" />

        {/* Clickable Zones */}
        
        {/* Motor Zone */}
        <g 
          onClick={() => onZoneClick?.('motor')}
          className={getZoneClasses('motor')}
          filter={highlightedZone === 'motor' ? 'url(#warningGlow)' : undefined}
        >
          <rect x="600" y="165" width="100" height="80" rx="8" strokeWidth="2" fillOpacity="0.3" />
          <text x="650" y="210" textAnchor="middle" className="fill-current text-xs font-medium" fontSize="12">MOTOR</text>
        </g>

        {/* Front Suspension Zone */}
        <g 
          onClick={() => onZoneClick?.('suspensao_dianteira')}
          className={getZoneClasses('suspensao_dianteira')}
          filter={highlightedZone === 'suspensao_dianteira' ? 'url(#warningGlow)' : undefined}
        >
          <circle cx="620" cy="290" r="45" strokeWidth="2" fillOpacity="0.3" />
          {/* Wheel detail */}
          <circle cx="620" cy="290" r="35" className="fill-none stroke-current" strokeWidth="1" />
          <circle cx="620" cy="290" r="15" className="fill-none stroke-current" strokeWidth="1" />
          {/* Spokes */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <line 
              key={angle}
              x1={620 + 15 * Math.cos(angle * Math.PI / 180)} 
              y1={290 + 15 * Math.sin(angle * Math.PI / 180)}
              x2={620 + 35 * Math.cos(angle * Math.PI / 180)} 
              y2={290 + 35 * Math.sin(angle * Math.PI / 180)}
              className="stroke-current"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Brake Zone (Front) */}
        <g 
          onClick={() => onZoneClick?.('freios')}
          className={getZoneClasses('freios')}
          filter={highlightedZone === 'freios' ? 'url(#warningGlow)' : undefined}
        >
          {/* Brake disc representation */}
          <circle cx="620" cy="290" r="25" strokeWidth="3" fillOpacity="0.2" strokeDasharray="5 3" />
        </g>

        {/* Rear Suspension Zone */}
        <g 
          onClick={() => onZoneClick?.('suspensao_traseira')}
          className={getZoneClasses('suspensao_traseira')}
          filter={highlightedZone === 'suspensao_traseira' ? 'url(#warningGlow)' : undefined}
        >
          <circle cx="210" cy="290" r="45" strokeWidth="2" fillOpacity="0.3" />
          {/* Wheel detail */}
          <circle cx="210" cy="290" r="35" className="fill-none stroke-current" strokeWidth="1" />
          <circle cx="210" cy="290" r="15" className="fill-none stroke-current" strokeWidth="1" />
          {/* Spokes */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <line 
              key={angle}
              x1={210 + 15 * Math.cos(angle * Math.PI / 180)} 
              y1={290 + 15 * Math.sin(angle * Math.PI / 180)}
              x2={210 + 35 * Math.cos(angle * Math.PI / 180)} 
              y2={290 + 35 * Math.sin(angle * Math.PI / 180)}
              className="stroke-current"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Exhaust Zone */}
        <g 
          onClick={() => onZoneClick?.('escapamento')}
          className={getZoneClasses('escapamento')}
          filter={highlightedZone === 'escapamento' ? 'url(#warningGlow)' : undefined}
        >
          <rect x="100" y="255" width="60" height="25" rx="4" strokeWidth="2" fillOpacity="0.3" />
          {/* Exhaust pipe detail */}
          <rect x="90" y="262" width="15" height="10" rx="2" className="fill-current" fillOpacity="0.5" />
          <text x="130" y="272" textAnchor="middle" className="fill-current text-xs" fontSize="10">ESCAPE</text>
        </g>

        {/* Internal structure lines (X-Ray effect) */}
        <g className="stroke-primary/20" strokeWidth="0.5">
          {/* Engine block outline */}
          <rect x="610" y="175" width="80" height="55" rx="4" className="fill-none" />
          
          {/* Transmission */}
          <rect x="530" y="220" width="70" height="35" rx="4" className="fill-none" />
          
          {/* Drive shaft */}
          <line x1="530" y1="240" x2="280" y2="260" />
          
          {/* Suspension arms */}
          <line x1="620" y1="260" x2="620" y2="245" />
          <line x1="590" y1="260" x2="570" y2="240" />
          <line x1="210" y1="260" x2="210" y2="245" />
          <line x1="240" y1="260" x2="280" y2="240" />
          
          {/* Exhaust system */}
          <path d="M 600 265 L 400 270 Q 300 272 200 270 L 105 267" className="fill-none" />
        </g>

        {/* Zone Labels */}
        <g className="fill-muted-foreground text-xs">
          <text x="650" y="145" textAnchor="middle" className={highlightedZone === 'motor' ? 'fill-warning font-bold' : ''}>
            Motor
          </text>
          <text x="620" y="355" textAnchor="middle" className={highlightedZone === 'suspensao_dianteira' || highlightedZone === 'freios' ? 'fill-warning font-bold' : ''}>
            Suspensão/Freios
          </text>
          <text x="210" y="355" textAnchor="middle" className={highlightedZone === 'suspensao_traseira' ? 'fill-warning font-bold' : ''}>
            Suspensão Traseira
          </text>
          <text x="130" y="300" textAnchor="middle" className={highlightedZone === 'escapamento' ? 'fill-warning font-bold' : ''}>
            Escapamento
          </text>
        </g>

        {/* Diagnostic connection lines when highlighted */}
        {highlightedZone && (
          <g className="stroke-warning" strokeWidth="2" strokeDasharray="5 5">
            {highlightedZone === 'motor' && (
              <line x1="650" y1="165" x2="650" y2="80" className="animate-pulse" />
            )}
            {highlightedZone === 'suspensao_dianteira' && (
              <line x1="620" y1="245" x2="620" y2="80" className="animate-pulse" />
            )}
            {highlightedZone === 'freios' && (
              <line x1="620" y1="265" x2="700" y2="80" className="animate-pulse" />
            )}
            {highlightedZone === 'escapamento' && (
              <line x1="130" y1="255" x2="130" y2="80" className="animate-pulse" />
            )}
            {highlightedZone === 'suspensao_traseira' && (
              <line x1="210" y1="245" x2="210" y2="80" className="animate-pulse" />
            )}
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/40 border border-primary" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning border border-warning animate-pulse" />
          <span>Problema Detectado</span>
        </div>
      </div>
    </div>
  );
};

export default VehicleViewer;
