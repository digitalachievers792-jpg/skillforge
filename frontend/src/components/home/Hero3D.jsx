import { Component, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei';

const HeroShape = () => {
  const group = useRef();

  useFrame((state, delta) => {
    const { pointer } = state;
    if (!group.current) return;
    const targetX = pointer.x * 0.35;
    const targetY = pointer.y * 0.25;
    group.current.rotation.y += (targetX - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (targetY + 0.4 - group.current.rotation.x) * 0.05;
  });

  return (
    <group ref={group}>
      <Float speed={1.6} rotationIntensity={0.6} floatIntensity={1.2}>
        <mesh castShadow>
          <torusKnotGeometry args={[1.15, 0.34, 200, 32]} />
          <MeshDistortMaterial
            color="#7c3aed"
            roughness={0.15}
            metalness={0.65}
            distort={0.28}
            speed={1.6}
          />
        </mesh>
      </Float>

      <Float speed={2.2} rotationIntensity={1.4} floatIntensity={2}>
        <mesh position={[2.6, 1.1, -1]}>
          <icosahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color="#14b8a6" roughness={0.25} metalness={0.5} flatShading />
        </mesh>
      </Float>

      <Float speed={1.9} rotationIntensity={1.2} floatIntensity={1.8}>
        <mesh position={[-2.5, 1.3, -0.8]}>
          <octahedronGeometry args={[0.34, 0]} />
          <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.6} flatShading />
        </mesh>
      </Float>

      <Float speed={1.4} rotationIntensity={0.8} floatIntensity={1.5}>
        <mesh position={[2.1, -1.4, -1.2]}>
          <torusGeometry args={[0.5, 0.16, 24, 48]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.2} metalness={0.7} />
        </mesh>
      </Float>

      <Float speed={2.6} rotationIntensity={1.6} floatIntensity={2.2}>
        <mesh position={[-2.2, -1.2, -0.6]}>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.1} metalness={0.8} />
        </mesh>
      </Float>
    </group>
  );
};

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return this.props.fallback || null;
    return this.props.children;
  }
}

const Hero3D = ({ className }) => (
  <SceneErrorBoundary
    fallback={
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative h-64 w-64">
          <div className="absolute inset-0 animate-blob rounded-full bg-gradient-to-br from-brand-300 to-violet-300 opacity-50 blur-2xl" />
          <div className="absolute inset-8 animate-float rounded-full bg-gradient-to-br from-violet-500 to-teal-400 shadow-glow" />
          <span className="absolute inset-0 flex items-center justify-center text-6xl">⚒️</span>
        </div>
      </div>
    }
  >
    <Canvas
      className={className}
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 4]} intensity={1.4} color="#ffffff" />
        <pointLight position={[-4, -2, 3]} intensity={1.2} color="#14b8a6" />
        <pointLight position={[3, 2, -3]} intensity={1.4} color="#818cf8" />
        <Stars radius={70} depth={40} count={1200} factor={3} saturation={0} fade speed={0.6} />
        <Sparkles count={90} scale={[9, 6, 5]} size={2.4} speed={0.35} color="#a5b4fc" />
        <HeroShape />
      </Suspense>
    </Canvas>
  </SceneErrorBoundary>
);

export default Hero3D;
