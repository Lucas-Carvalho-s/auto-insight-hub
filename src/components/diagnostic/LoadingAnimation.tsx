import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingAnimation = ({ className, size = 'md' }: LoadingAnimationProps) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />
      
      {/* Middle ring */}
      <div 
        className="absolute inset-2 rounded-full border-2 border-primary/50 animate-pulse-ring"
        style={{ animationDelay: '0.3s' }}
      />
      
      {/* Inner ring */}
      <div 
        className="absolute inset-4 rounded-full border-2 border-primary animate-pulse-ring"
        style={{ animationDelay: '0.6s' }}
      />
      
      {/* Center dot */}
      <div className="w-3 h-3 rounded-full bg-primary glow-cyan-sm animate-pulse" />
      
      {/* Scanning line effect */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-primary/20 to-transparent scan-line" />
      </div>
    </div>
  );
};

export default LoadingAnimation;
