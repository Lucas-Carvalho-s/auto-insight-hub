import { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  Stage, 
  useGLTF, 
  Html, 
  useProgress,
  Center,
  Loader as DreiLoader
} from "@react-three/drei";
import * as THREE from "three";
import { CarView, HighlightZoneId, VisualContext } from "@/data/partImagesMap";
import { DiagnosticResult, VehicleZone } from "@/data/diagnosticData";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";

// Camera positions for different views
const CAMERA_POSITIONS: Record<string, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  lateral: { 
    position: new THREE.Vector3(5, 2, 0), 
    target: new THREE.Vector3(0, 0.5, 0) 
  },
  motor: { 
    position: new THREE.Vector3(2, 3, 2), 
    target: new THREE.Vector3(0, 0.8, 1) 
  },
  inferior: { 
    position: new THREE.Vector3(3, -1, 3), 
    target: new THREE.Vector3(0, 0, 0) 
  },
  engine_bay: { 
    position: new THREE.Vector3(1.5, 2.5, 2), 
    target: new THREE.Vector3(0, 0.5, 1) 
  },
  undercarriage: { 
    position: new THREE.Vector3(3, 0.5, 3), 
    target: new THREE.Vector3(0, 0, 0) 
  },
  exterior_side: { 
    position: new THREE.Vector3(5, 2, 0), 
    target: new THREE.Vector3(0, 0.5, 0) 
  },
  interior_dashboard: { 
    position: new THREE.Vector3(0.3, 1.5, 0.5), 
    target: new THREE.Vector3(0, 1, -0.5) 
  },
  frontal: { 
    position: new THREE.Vector3(0, 2, 5), 
    target: new THREE.Vector3(0, 0.5, 0) 
  },
  traseira: { 
    position: new THREE.Vector3(0, 2, -5), 
    target: new THREE.Vector3(0, 0.5, 0) 
  },
};

// Zone mesh name patterns for highlighting
const ZONE_MESH_PATTERNS: Record<string, string[]> = {
  zone_engine_block: ['engine', 'motor', 'block', 'cylinder'],
  zone_radiator: ['radiator', 'radiador', 'cooling', 'grille'],
  zone_battery: ['battery', 'bateria'],
  zone_alternator: ['alternator', 'alternador'],
  zone_air_filter: ['air_filter', 'filtro', 'intake'],
  zone_spark_plugs: ['spark', 'vela', 'plug'],
  zone_wheel_front_left: ['wheel_fl', 'wheel_front_left', 'tire_fl', 'rim_fl'],
  zone_wheel_front_right: ['wheel_fr', 'wheel_front_right', 'tire_fr', 'rim_fr'],
  zone_wheel_rear_left: ['wheel_rl', 'wheel_rear_left', 'tire_rl', 'rim_rl'],
  zone_wheel_rear_right: ['wheel_rr', 'wheel_rear_right', 'tire_rr', 'rim_rr'],
  zone_brake_front: ['brake', 'caliper', 'disc', 'rotor'],
  zone_brake_rear: ['brake_rear', 'caliper_r'],
  zone_suspension_front: ['suspension', 'spring', 'shock', 'strut'],
  zone_suspension_rear: ['suspension_r', 'spring_r', 'shock_r'],
  zone_exhaust: ['exhaust', 'pipe', 'muffler'],
  zone_catalytic: ['catalytic', 'converter', 'cat'],
  zone_muffler: ['muffler', 'silencer'],
  zone_oil_pan: ['oil', 'pan', 'sump'],
  zone_transmission: ['transmission', 'gearbox', 'trans'],
  zone_fuel_tank: ['fuel', 'tank', 'gas'],
  zone_headlight: ['headlight', 'head_light', 'front_light', 'lamp_f'],
  zone_taillight: ['taillight', 'tail_light', 'rear_light', 'lamp_r'],
};

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 p-4 bg-background/80 backdrop-blur-sm rounded-lg border border-border">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Carregando modelo 3D</p>
          <p className="text-xs text-muted-foreground">{progress.toFixed(0)}%</p>
        </div>
        <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Html>
  );
}

// Error fallback component
function ModelError({ error }: { error: string }) {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 p-4 bg-destructive/10 backdrop-blur-sm rounded-lg border border-destructive/30 max-w-xs">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Erro ao carregar modelo</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    </Html>
  );
}

// Animated camera controller with smooth transitions
function CameraController({ 
  targetView, 
  controlsRef 
}: { 
  targetView: string;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(5, 2, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.5, 0));
  const isAnimating = useRef(false);

  useEffect(() => {
    const viewConfig = CAMERA_POSITIONS[targetView] || CAMERA_POSITIONS.lateral;
    targetPosition.current.copy(viewConfig.position);
    targetLookAt.current.copy(viewConfig.target);
    isAnimating.current = true;
  }, [targetView]);

  useFrame(() => {
    if (isAnimating.current) {
      // Smooth camera position interpolation
      camera.position.lerp(targetPosition.current, 0.03);
      
      // Update OrbitControls target
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, 0.03);
        controlsRef.current.update();
      }

      // Check if animation is complete
      const distanceToTarget = camera.position.distanceTo(targetPosition.current);
      if (distanceToTarget < 0.01) {
        isAnimating.current = false;
      }
    }
  });

  return null;
}

// Car model component with GLTF loading
function CarModel({ 
  highlightZoneId,
  onModelLoaded
}: { 
  highlightZoneId: HighlightZoneId;
  onModelLoaded?: (nodes: Record<string, any>) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  
  // Using Lamborghini Urus model from pmndrs CDN
  const modelUrl = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/lamborghini-urus/model.gltf";
  
  let gltf: any = null;
  let loadError: Error | null = null;
  
  try {
    gltf = useGLTF(modelUrl);
  } catch (e) {
    loadError = e as Error;
  }

  // Log model nodes for debugging mesh names
  useEffect(() => {
    if (gltf?.nodes) {
      console.log('[CarViewer3D] Modelo carregado. Nodes disponíveis:', Object.keys(gltf.nodes));
      console.log('[CarViewer3D] Estrutura completa do modelo:', gltf.nodes);
      onModelLoaded?.(gltf.nodes);
    }
  }, [gltf, onModelLoaded]);

  // Create highlight material
  const highlightMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xff2222),
    emissive: new THREE.Color(0xff0000),
    emissiveIntensity: 1.2,
    metalness: 0.4,
    roughness: 0.3,
  }), []);

  // Check if a mesh should be highlighted
  const shouldHighlight = (meshName: string): boolean => {
    if (!highlightZoneId || !ZONE_MESH_PATTERNS[highlightZoneId]) return false;
    
    const patterns = ZONE_MESH_PATTERNS[highlightZoneId];
    const lowerName = meshName.toLowerCase();
    
    return patterns.some(pattern => lowerName.includes(pattern.toLowerCase()));
  };

  // Apply highlight to matching meshes
  useEffect(() => {
    if (!gltf?.scene || !highlightZoneId) return;

    const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

    gltf.scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        if (shouldHighlight(child.name)) {
          originalMaterials.set(child, child.material);
          child.material = highlightMaterial;
          console.log('[CarViewer3D] Destacando mesh:', child.name);
        }
      }
    });

    // Cleanup: restore original materials
    return () => {
      originalMaterials.forEach((material, mesh) => {
        mesh.material = material;
      });
    };
  }, [gltf, highlightZoneId, highlightMaterial]);

  if (loadError || modelError) {
    return <FallbackCar highlightZoneId={highlightZoneId} />;
  }

  if (!gltf) {
    return <FallbackCar highlightZoneId={highlightZoneId} />;
  }

  return (
    <group ref={groupRef}>
      <Center>
        <primitive 
          object={gltf.scene.clone()} 
          scale={0.01}
          position={[0, 0, 0]}
        />
      </Center>
    </group>
  );
}

// Fallback low-poly car if GLTF fails to load
function FallbackCar({ highlightZoneId }: { highlightZoneId: HighlightZoneId }) {
  const groupRef = useRef<THREE.Group>(null);

  // Determine which parts to highlight
  const isHighlighted = (partType: string): boolean => {
    if (!highlightZoneId) return false;
    const zoneKey = highlightZoneId.toLowerCase();
    return zoneKey.includes(partType);
  };

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1a1a2e),
    metalness: 0.9,
    roughness: 0.1,
  });

  const highlightMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xff3333),
    emissive: new THREE.Color(0xff0000),
    emissiveIntensity: 0.8,
    metalness: 0.3,
    roughness: 0.4,
  });

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x0a0a0a),
    metalness: 0.6,
    roughness: 0.5,
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x88ccff),
    metalness: 0.95,
    roughness: 0.05,
    transparent: true,
    opacity: 0.4,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x06b6d4),
    emissive: new THREE.Color(0x06b6d4),
    emissiveIntensity: 0.3,
    metalness: 0.8,
    roughness: 0.2,
  });

  return (
    <group ref={groupRef} scale={0.8}>
      {/* Main Body */}
      <mesh position={[0, 0.35, 0]} material={bodyMaterial}>
        <boxGeometry args={[1.8, 0.4, 4.2]} />
      </mesh>

      {/* Cabin */}
      <mesh position={[0, 0.7, -0.2]} material={bodyMaterial}>
        <boxGeometry args={[1.6, 0.4, 2.2]} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.72, 0.9]} rotation={[0.4, 0, 0]} material={glassMaterial}>
        <boxGeometry args={[1.5, 0.6, 0.05]} />
      </mesh>

      {/* Rear Window */}
      <mesh position={[0, 0.72, -1.3]} rotation={[-0.4, 0, 0]} material={glassMaterial}>
        <boxGeometry args={[1.5, 0.5, 0.05]} />
      </mesh>

      {/* Hood accent line */}
      <mesh position={[0, 0.56, 1.2]} material={accentMaterial}>
        <boxGeometry args={[0.1, 0.02, 1.5]} />
      </mesh>

      {/* Engine area */}
      <mesh 
        position={[0, 0.45, 1.6]} 
        material={isHighlighted('engine') ? highlightMaterial : bodyMaterial}
      >
        <boxGeometry args={[1.4, 0.3, 0.8]} />
      </mesh>

      {/* Wheels */}
      {[
        { name: 'wheel_fl', pos: [0.85, 0.18, 1.3] as [number, number, number], highlight: 'wheel_front' },
        { name: 'wheel_fr', pos: [-0.85, 0.18, 1.3] as [number, number, number], highlight: 'wheel_front' },
        { name: 'wheel_rl', pos: [0.85, 0.18, -1.3] as [number, number, number], highlight: 'wheel_rear' },
        { name: 'wheel_rr', pos: [-0.85, 0.18, -1.3] as [number, number, number], highlight: 'wheel_rear' },
      ].map((wheel) => (
        <group key={wheel.name} position={wheel.pos}>
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={isHighlighted(wheel.highlight) || isHighlighted('wheel') ? highlightMaterial : wheelMaterial}>
            <cylinderGeometry args={[0.28, 0.28, 0.18, 24]} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={accentMaterial}>
            <cylinderGeometry args={[0.15, 0.15, 0.19, 12]} />
          </mesh>
        </group>
      ))}

      {/* Brake discs */}
      {[
        { pos: [0.72, 0.18, 1.3] as [number, number, number] },
        { pos: [-0.72, 0.18, 1.3] as [number, number, number] },
        { pos: [0.72, 0.18, -1.3] as [number, number, number] },
        { pos: [-0.72, 0.18, -1.3] as [number, number, number] },
      ].map((brake, i) => (
        <mesh 
          key={i}
          position={brake.pos}
          rotation={[0, 0, Math.PI / 2]}
          material={isHighlighted('brake') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 })}
        >
          <cylinderGeometry args={[0.18, 0.18, 0.03, 16]} />
        </mesh>
      ))}

      {/* Exhaust */}
      {[
        { pos: [-0.4, 0.12, -2.1] as [number, number, number] },
        { pos: [0.4, 0.12, -2.1] as [number, number, number] },
      ].map((exhaust, i) => (
        <mesh
          key={i}
          position={exhaust.pos}
          rotation={[Math.PI / 2, 0, 0]}
          material={isHighlighted('exhaust') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 })}
        >
          <cylinderGeometry args={[0.06, 0.08, 0.15, 12]} />
        </mesh>
      ))}

      {/* Headlights */}
      {[
        { pos: [0.6, 0.4, 2.08] as [number, number, number] },
        { pos: [-0.6, 0.4, 2.08] as [number, number, number] },
      ].map((light, i) => (
        <mesh
          key={i}
          position={light.pos}
          material={isHighlighted('headlight') ? highlightMaterial : new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffee,
            emissiveIntensity: 0.5
          })}
        >
          <boxGeometry args={[0.3, 0.12, 0.02]} />
        </mesh>
      ))}

      {/* Taillights */}
      {[
        { pos: [0.65, 0.4, -2.08] as [number, number, number] },
        { pos: [-0.65, 0.4, -2.08] as [number, number, number] },
      ].map((light, i) => (
        <mesh
          key={i}
          position={light.pos}
          material={isHighlighted('taillight') ? highlightMaterial : new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.4
          })}
        >
          <boxGeometry args={[0.25, 0.1, 0.02]} />
        </mesh>
      ))}

      {/* Suspension springs (visible) */}
      {[
        { pos: [0.7, 0.28, 1.3] as [number, number, number], type: 'front' },
        { pos: [-0.7, 0.28, 1.3] as [number, number, number], type: 'front' },
        { pos: [0.7, 0.28, -1.3] as [number, number, number], type: 'rear' },
        { pos: [-0.7, 0.28, -1.3] as [number, number, number], type: 'rear' },
      ].map((susp, i) => (
        <mesh
          key={i}
          position={susp.pos}
          material={isHighlighted('suspension') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0xf59e0b })}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        </mesh>
      ))}
    </group>
  );
}

// Preload the model
useGLTF.preload("https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/lamborghini-urus/model.gltf");

interface CarViewer3DProps {
  highlightedZone?: VehicleZone;
  highlightZoneId?: HighlightZoneId;
  carView?: CarView;
  onZoneClick?: (zone: VehicleZone) => void;
  onZoneIdClick?: (zoneId: HighlightZoneId) => void;
  result?: DiagnosticResult | null;
  visualContext?: VisualContext | null;
}

const CarViewer3D = ({
  highlightedZone,
  highlightZoneId,
  carView = 'lateral',
  onZoneClick,
  onZoneIdClick,
  result,
  visualContext,
}: CarViewer3DProps) => {
  const controlsRef = useRef<any>(null);
  const [modelNodes, setModelNodes] = useState<Record<string, any> | null>(null);
  
  // Determine target camera view
  const targetView = carView || 'lateral';

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-black">
      {/* View Badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="secondary" className="bg-secondary/80 backdrop-blur-sm border border-primary/20">
          <span className="text-primary mr-1">●</span>
          Vista 3D: {targetView}
        </Badge>
      </div>

      {/* Zone indicator */}
      {highlightZoneId && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-destructive/90 text-destructive-foreground backdrop-blur-sm animate-pulse border border-destructive">
            ⚠️ {highlightZoneId.replace('zone_', '').replace(/_/g, ' ')}
          </Badge>
        </div>
      )}

      {/* 3D Canvas with improved settings */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ fov: 45, position: [4, 2, 5], near: 0.1, far: 100 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <Suspense fallback={<Loader />}>
          {/* Camera controller for smooth transitions */}
          <CameraController targetView={targetView} controlsRef={controlsRef} />

          {/* Stage provides studio lighting and environment */}
          <Stage
            intensity={0.6}
            environment="city"
            shadows={{ type: 'contact', opacity: 0.5, blur: 2 }}
            adjustCamera={false}
          >
            <CarModel 
              highlightZoneId={highlightZoneId}
              onModelLoaded={setModelNodes}
            />
          </Stage>

          {/* Ground reflection plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial 
              color="#0a0a0f" 
              metalness={0.95} 
              roughness={0.1}
              envMapIntensity={0.5}
            />
          </mesh>

          {/* Orbit Controls with proper constraints */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 1.9}
            minDistance={3}
            maxDistance={10}
            target={[0, 0.5, 0]}
            dampingFactor={0.05}
            enableDamping={true}
          />
        </Suspense>
      </Canvas>

      {/* External loader bar from drei */}
      <DreiLoader />

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="flex items-center gap-4 text-xs text-muted-foreground bg-background/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
          <span>🖱️ Arrastar: Rotacionar</span>
          <span className="text-border">|</span>
          <span>🔍 Scroll: Zoom</span>
        </div>
      </div>

      {/* Model info (debug) */}
      {modelNodes && Object.keys(modelNodes).length > 0 && (
        <div className="absolute bottom-4 right-4 z-10">
          <Badge variant="outline" className="text-[10px] bg-background/60 backdrop-blur-sm">
            {Object.keys(modelNodes).length} meshes carregadas
          </Badge>
        </div>
      )}
    </div>
  );
};

export default CarViewer3D;
