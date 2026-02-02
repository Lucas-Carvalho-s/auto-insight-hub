import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";
import { CarView, HighlightZoneId, VisualContext } from "@/data/partImagesMap";
import { DiagnosticResult, VehicleZone } from "@/data/diagnosticData";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// Camera positions for different views
const CAMERA_POSITIONS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  lateral: { position: [4, 1.5, 0], target: [0, 0.5, 0] },
  motor: { position: [0, 3, 2], target: [0, 0.5, 0] },
  inferior: { position: [0, -2, 3], target: [0, 0, 0] },
  engine_bay: { position: [0, 3, 1.5], target: [0, 0.8, 0] },
  undercarriage: { position: [0, -1.5, 3], target: [0, 0, 0] },
  exterior_side: { position: [4, 1.5, 0], target: [0, 0.5, 0] },
  interior_dashboard: { position: [0.5, 1.2, 0.3], target: [0, 1, -0.5] },
  frontal: { position: [0, 1.5, 4], target: [0, 0.5, 0] },
  traseira: { position: [0, 1.5, -4], target: [0, 0.5, 0] },
};

// Zone mesh mappings - which parts to highlight
const ZONE_MESH_MAPPING: Record<string, string[]> = {
  zone_engine_block: ['engine', 'motor', 'block'],
  zone_radiator: ['radiator', 'radiador', 'cooling'],
  zone_battery: ['battery', 'bateria'],
  zone_alternator: ['alternator', 'alternador'],
  zone_air_filter: ['air_filter', 'filtro'],
  zone_spark_plugs: ['spark', 'vela'],
  zone_wheel_front_left: ['wheel_fl', 'wheel_front_left', 'roda_de'],
  zone_wheel_front_right: ['wheel_fr', 'wheel_front_right', 'roda_dd'],
  zone_wheel_rear_left: ['wheel_rl', 'wheel_rear_left', 'roda_te'],
  zone_wheel_rear_right: ['wheel_rr', 'wheel_rear_right', 'roda_td'],
  zone_brake_front: ['brake_front', 'freio_d', 'disco_d'],
  zone_brake_rear: ['brake_rear', 'freio_t', 'disco_t'],
  zone_suspension_front: ['suspension_f', 'suspensao_d', 'amortecedor_d'],
  zone_suspension_rear: ['suspension_r', 'suspensao_t', 'amortecedor_t'],
  zone_exhaust: ['exhaust', 'escapamento'],
  zone_catalytic: ['catalytic', 'catalisador'],
  zone_muffler: ['muffler', 'silenciador'],
  zone_oil_pan: ['oil_pan', 'carter'],
  zone_transmission: ['transmission', 'cambio', 'gearbox'],
  zone_fuel_tank: ['fuel_tank', 'tanque'],
  zone_headlight: ['headlight', 'farol_d'],
  zone_taillight: ['taillight', 'lanterna'],
};

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs">{progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
}

// Animated camera controller
function CameraController({ targetView }: { targetView: string }) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3(0, 0.5, 0));

  useEffect(() => {
    const viewConfig = CAMERA_POSITIONS[targetView] || CAMERA_POSITIONS.lateral;
    targetPosition.current.set(...viewConfig.position);
    targetLookAt.current.set(...viewConfig.target);
  }, [targetView]);

  useFrame(() => {
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.05);
    currentLookAt.current.lerp(targetLookAt.current, 0.05);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

// Low-poly placeholder car model
function PlaceholderCar({ highlightZoneId }: { highlightZoneId: HighlightZoneId }) {
  const groupRef = useRef<THREE.Group>(null);
  const [highlightedMeshes, setHighlightedMeshes] = useState<string[]>([]);

  // Determine which meshes to highlight based on zone ID
  useEffect(() => {
    if (highlightZoneId && ZONE_MESH_MAPPING[highlightZoneId]) {
      setHighlightedMeshes(ZONE_MESH_MAPPING[highlightZoneId]);
    } else {
      setHighlightedMeshes([]);
    }
  }, [highlightZoneId]);

  const isHighlighted = (meshName: string) => {
    return highlightedMeshes.some(h => meshName.toLowerCase().includes(h.toLowerCase()));
  };

  // Create highlight material
  const highlightMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xff3333),
    emissive: new THREE.Color(0xff0000),
    emissiveIntensity: 0.8,
    metalness: 0.3,
    roughness: 0.4,
  });

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1e293b),
    metalness: 0.8,
    roughness: 0.2,
  });

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x0f172a),
    metalness: 0.5,
    roughness: 0.6,
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x06b6d4),
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.6,
  });

  const engineMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x374151),
    metalness: 0.7,
    roughness: 0.4,
  });

  return (
    <group ref={groupRef}>
      {/* Car Body - Main */}
      <mesh name="body" position={[0, 0.4, 0]} material={bodyMaterial}>
        <boxGeometry args={[1.8, 0.5, 4]} />
      </mesh>

      {/* Car Body - Cabin */}
      <mesh name="cabin" position={[0, 0.85, -0.3]} material={bodyMaterial}>
        <boxGeometry args={[1.6, 0.5, 2]} />
      </mesh>

      {/* Windshield */}
      <mesh name="windshield" position={[0, 0.85, 0.8]} rotation={[0.3, 0, 0]} material={glassMaterial}>
        <boxGeometry args={[1.4, 0.5, 0.05]} />
      </mesh>

      {/* Rear Window */}
      <mesh name="rear_window" position={[0, 0.85, -1.4]} rotation={[-0.3, 0, 0]} material={glassMaterial}>
        <boxGeometry args={[1.4, 0.4, 0.05]} />
      </mesh>

      {/* Engine Block */}
      <mesh 
        name="engine" 
        position={[0, 0.5, 1.5]} 
        material={isHighlighted('engine') ? highlightMaterial : engineMaterial}
      >
        <boxGeometry args={[1.2, 0.4, 0.8]} />
      </mesh>

      {/* Radiator */}
      <mesh 
        name="radiator" 
        position={[0, 0.4, 1.95]} 
        material={isHighlighted('radiator') ? highlightMaterial : engineMaterial}
      >
        <boxGeometry args={[1.4, 0.5, 0.1]} />
      </mesh>

      {/* Battery */}
      <mesh 
        name="battery" 
        position={[0.5, 0.65, 1.3]} 
        material={isHighlighted('battery') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0x1e40af })}
      >
        <boxGeometry args={[0.3, 0.25, 0.4]} />
      </mesh>

      {/* Wheels */}
      {[
        { name: 'wheel_fl', pos: [0.9, 0.2, 1.2] as [number, number, number] },
        { name: 'wheel_fr', pos: [-0.9, 0.2, 1.2] as [number, number, number] },
        { name: 'wheel_rl', pos: [0.9, 0.2, -1.2] as [number, number, number] },
        { name: 'wheel_rr', pos: [-0.9, 0.2, -1.2] as [number, number, number] },
      ].map((wheel) => (
        <mesh 
          key={wheel.name}
          name={wheel.name}
          position={wheel.pos}
          rotation={[0, 0, Math.PI / 2]}
          material={isHighlighted(wheel.name) ? highlightMaterial : wheelMaterial}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        </mesh>
      ))}

      {/* Brake Discs */}
      {[
        { name: 'brake_front_l', pos: [0.75, 0.2, 1.2] as [number, number, number] },
        { name: 'brake_front_r', pos: [-0.75, 0.2, 1.2] as [number, number, number] },
        { name: 'brake_rear_l', pos: [0.75, 0.2, -1.2] as [number, number, number] },
        { name: 'brake_rear_r', pos: [-0.75, 0.2, -1.2] as [number, number, number] },
      ].map((brake) => (
        <mesh 
          key={brake.name}
          name={brake.name}
          position={brake.pos}
          rotation={[0, 0, Math.PI / 2]}
          material={isHighlighted('brake') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0x6b7280 })}
        >
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        </mesh>
      ))}

      {/* Suspension Front */}
      {[
        { name: 'suspension_f_l', pos: [0.7, 0.35, 1.2] as [number, number, number] },
        { name: 'suspension_f_r', pos: [-0.7, 0.35, 1.2] as [number, number, number] },
      ].map((susp) => (
        <mesh 
          key={susp.name}
          name={susp.name}
          position={susp.pos}
          material={isHighlighted('suspension_f') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0xf59e0b })}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        </mesh>
      ))}

      {/* Suspension Rear */}
      {[
        { name: 'suspension_r_l', pos: [0.7, 0.35, -1.2] as [number, number, number] },
        { name: 'suspension_r_r', pos: [-0.7, 0.35, -1.2] as [number, number, number] },
      ].map((susp) => (
        <mesh 
          key={susp.name}
          name={susp.name}
          position={susp.pos}
          material={isHighlighted('suspension_r') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0xf59e0b })}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        </mesh>
      ))}

      {/* Exhaust System */}
      <mesh 
        name="exhaust" 
        position={[-0.5, 0.1, -1.8]} 
        rotation={[Math.PI / 2, 0, 0]}
        material={isHighlighted('exhaust') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0x4b5563 })}
      >
        <cylinderGeometry args={[0.08, 0.1, 0.4, 8]} />
      </mesh>

      {/* Muffler */}
      <mesh 
        name="muffler" 
        position={[0, 0.1, -1.5]} 
        rotation={[Math.PI / 2, 0, 0]}
        material={isHighlighted('muffler') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0x374151 })}
      >
        <cylinderGeometry args={[0.12, 0.12, 0.5, 8]} />
      </mesh>

      {/* Catalytic Converter */}
      <mesh 
        name="catalytic" 
        position={[0, 0.15, -0.5]} 
        rotation={[Math.PI / 2, 0, 0]}
        material={isHighlighted('catalytic') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0x6b7280 })}
      >
        <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
      </mesh>

      {/* Fuel Tank */}
      <mesh 
        name="fuel_tank" 
        position={[0.5, 0.2, -0.8]} 
        material={isHighlighted('fuel_tank') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0x1f2937 })}
      >
        <boxGeometry args={[0.6, 0.2, 0.8]} />
      </mesh>

      {/* Transmission */}
      <mesh 
        name="transmission" 
        position={[0, 0.25, 0.5]} 
        material={isHighlighted('transmission') ? highlightMaterial : new THREE.MeshStandardMaterial({ color: 0x4b5563 })}
      >
        <boxGeometry args={[0.5, 0.3, 0.8]} />
      </mesh>

      {/* Headlights */}
      {[
        { name: 'headlight_l', pos: [0.6, 0.45, 1.98] as [number, number, number] },
        { name: 'headlight_r', pos: [-0.6, 0.45, 1.98] as [number, number, number] },
      ].map((light) => (
        <mesh 
          key={light.name}
          name={light.name}
          position={light.pos}
          material={isHighlighted('headlight') ? highlightMaterial : new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            emissive: 0xffffcc,
            emissiveIntensity: 0.3 
          })}
        >
          <sphereGeometry args={[0.12, 16, 16]} />
        </mesh>
      ))}

      {/* Taillights */}
      {[
        { name: 'taillight_l', pos: [0.7, 0.45, -1.98] as [number, number, number] },
        { name: 'taillight_r', pos: [-0.7, 0.45, -1.98] as [number, number, number] },
      ].map((light) => (
        <mesh 
          key={light.name}
          name={light.name}
          position={light.pos}
          material={isHighlighted('taillight') ? highlightMaterial : new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.2 
          })}
        >
          <boxGeometry args={[0.2, 0.1, 0.02]} />
        </mesh>
      ))}
    </group>
  );
}

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
  // Determine target camera view
  const targetView = carView || 'lateral';

  return (
    <div className="relative w-full h-full">
      {/* View Badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="secondary" className="bg-secondary/80 backdrop-blur-sm">
          Vista 3D: {targetView}
        </Badge>
      </div>

      {/* Zone indicator */}
      {highlightZoneId && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-destructive/80 text-destructive-foreground backdrop-blur-sm animate-pulse">
            {highlightZoneId.replace('zone_', '').replace(/_/g, ' ')}
          </Badge>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas shadows className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-950">
        <Suspense fallback={<Loader />}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={[4, 2, 4]} fov={50} />
          <CameraController targetView={targetView} />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-5, 3, -5]} intensity={0.5} />
          <spotLight 
            position={[0, 10, 0]} 
            angle={0.3} 
            penumbra={1} 
            intensity={0.5} 
            castShadow 
          />

          {/* Environment for reflections */}
          <Environment preset="city" />

          {/* Ground shadow */}
          <ContactShadows 
            position={[0, -0.01, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={10} 
          />

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.8} />
          </mesh>

          {/* Grid helper */}
          <gridHelper args={[20, 40, "#1e293b", "#1e293b"]} position={[0, 0, 0]} />

          {/* Car Model */}
          <PlaceholderCar highlightZoneId={highlightZoneId} />

          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={15}
            maxPolarAngle={Math.PI * 0.85}
            target={[0, 0.5, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="text-xs text-muted-foreground bg-background/60 backdrop-blur-sm px-2 py-1 rounded">
          🖱️ Arraste para rotacionar • Scroll para zoom
        </div>
      </div>
    </div>
  );
};

export default CarViewer3D;
