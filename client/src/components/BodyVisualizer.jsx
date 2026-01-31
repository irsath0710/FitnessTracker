/**
 * 3D BODY VISUALIZER - Using Real GLB Models
 * Loads male or female 3D character model based on user gender
 */

import React, { useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html, Center } from '@react-three/drei';
import * as THREE from 'three';

// Preload models for faster loading
useGLTF.preload('/models/male_character.glb');
useGLTF.preload('/models/femal_character.glb');

function HumanModel({ gender = 'male', weight = 70, bodyFat = 20, height = 170 }) {
    const groupRef = useRef();

    // Load the appropriate model based on gender
    const modelPath = gender === 'female'
        ? '/models/femal_character.glb'
        : '/models/male_character.glb';

    const { scene } = useGLTF(modelPath);

    // Clone the scene to avoid issues with reusing the same geometry
    const clonedScene = React.useMemo(() => {
        const clone = scene.clone();

        // Apply skin-like material to the model
        clone.traverse((child) => {
            if (child.isMesh) {
                // Create realistic skin material with double-sided rendering
                child.material = new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color('#c9956c'),
                    roughness: 0.55,
                    metalness: 0,
                    clearcoat: 0.05,
                    sheen: 0.2,
                    sheenColor: new THREE.Color('#ffe4cc'),
                    side: THREE.DoubleSide, // Render both sides to fix holes
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        return clone;
    }, [scene]);

    // Calculate scale based on height, weight, and body fat
    const { scaleX, scaleY, scaleZ } = React.useMemo(() => {
        // Height affects vertical scale (base 170cm = 1.0)
        const heightScale = height / 170;

        // Weight affects overall mass (base 70kg = 1.0)
        const weightScale = 0.85 + (weight / 70) * 0.2;

        // Body fat affects width/depth (higher fat = wider)
        const fatScale = 1 + (bodyFat - 15) * 0.012;

        return {
            scaleX: 0.9 * weightScale * fatScale,       // Width (weight + fat)
            scaleY: 0.9 * heightScale,                   // Height
            scaleZ: 0.9 * weightScale * fatScale * 0.95, // Depth
        };
    }, [height, weight, bodyFat]);

    // Gentle rotation animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.35;
        }
    });

    return (
        <group ref={groupRef}>
            <Center>
                <primitive
                    object={clonedScene}
                    scale={[scaleX, scaleY, scaleZ]}
                    position={[0, -1, 0]}
                />
            </Center>
        </group>
    );
}

function ScanLine() {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 1.2;
            ref.current.material.opacity = 0.35 - Math.abs(ref.current.position.y) * 0.15;
        }
    });

    return (
        <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 0.008]} />
            <meshBasicMaterial color="#00ddff" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
    );
}

function LoadingFallback() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-cyan-400 text-xs">Loading Model...</div>
            </div>
        </Html>
    );
}

function ErrorFallback({ error }) {
    return (
        <Html center>
            <div className="text-red-400 text-xs text-center max-w-[200px]">
                Failed to load 3D model.<br />
                <span className="text-zinc-500">{error?.message || 'Unknown error'}</span>
            </div>
        </Html>
    );
}

// Error boundary component
class ModelErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }
        return this.props.children;
    }
}

export default function BodyVisualizer({ weight = 70, bodyFat = 20, gender = 'male', height = 170 }) {
    return (
        <div className="relative w-full h-full min-h-[400px] bg-gradient-to-b from-zinc-900 via-zinc-900 to-black rounded-xl overflow-hidden">
            {/* Stats Overlay */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                <div className="bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400 border-l-2 border-cyan-500">
                    HEIGHT: {height}cm
                </div>
                <div className="bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400 border-l-2 border-cyan-500">
                    WEIGHT: {weight}kg
                </div>
                <div className="bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400 border-l-2 border-cyan-500">
                    BODY FAT: {bodyFat}%
                </div>
            </div>

            <Canvas
                camera={{ position: [0, 0.5, 2.5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                shadows
            >
                <Suspense fallback={<LoadingFallback />}>
                    <ModelErrorBoundary>
                        {/* Lighting */}
                        <ambientLight intensity={0.5} />
                        <directionalLight
                            position={[3, 5, 4]}
                            intensity={1.2}
                            color="#fff8f0"
                            castShadow
                        />
                        <directionalLight position={[-2, 3, -2]} intensity={0.4} color="#ddeeff" />
                        <pointLight position={[0, 2, 3]} intensity={0.5} color="#ffeedd" />
                        <spotLight
                            position={[-2, 1, -2]}
                            intensity={0.7}
                            color="#4488ff"
                            angle={0.5}
                        />

                        {/* The 3D Human Model */}
                        <HumanModel gender={gender} weight={weight} bodyFat={bodyFat} height={height} />

                        {/* Scanner effect */}
                        <ScanLine />

                        {/* Controls */}
                        <OrbitControls
                            enableZoom={true}
                            enablePan={false}
                            minDistance={1.5}
                            maxDistance={4}
                            minPolarAngle={0.3}
                            maxPolarAngle={2.8}
                            autoRotate
                            autoRotateSpeed={0.5}
                        />

                        <Environment preset="studio" />
                    </ModelErrorBoundary>
                </Suspense>
            </Canvas>

            {/* Labels */}
            <div className="absolute top-3 left-3 z-10">
                <div className="bg-black/60 backdrop-blur px-2.5 py-1 rounded text-[9px] tracking-widest uppercase text-zinc-400">
                    3D Body Scan
                </div>
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[9px] text-zinc-500">
                👆 Drag to rotate • Scroll to zoom
            </div>
        </div>
    );
}
