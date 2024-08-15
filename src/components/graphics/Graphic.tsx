import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { AdditiveBlending, Vector3, Group, BufferGeometry, BufferAttribute, Color, ShaderMaterial } from 'three';

import fragmentShader from './shaders/fragmentShader.glsl';
import vertexShader from './shaders/vertexShader.glsl';

interface ParticleData {
    velocity: Vector3;
    numConnections: number;
}

const NeuralNetwork: React.FC = () => {
    const groupRef = useRef<Group>(null);
    const particlesRef = useRef<BufferGeometry>(null);
    const linesGeometryRef = useRef<BufferGeometry>(null);
    const shaderMaterialRef = useRef<ShaderMaterial>(null);

    const maxParticleCount = 10000;
    const r = 10; // Radius of the large sphere
    const smallSphereRadius = 5; // Radius of the smaller sphere where particles respawn
    const centerSphereRadius = 2; // Radius of the center sphere

    const particlePositions = useMemo(() => new Float32Array(maxParticleCount * 3), [maxParticleCount]);
    const particleColors = useMemo(() => new Float32Array(maxParticleCount * 3), [maxParticleCount]);
    const particleVelocities = useMemo(() => new Float32Array(maxParticleCount * 3), [maxParticleCount]);

    const segments = maxParticleCount * maxParticleCount;
    const positions = useMemo(() => new Float32Array(segments * 3), [segments]);
    const colors = useMemo(() => new Float32Array(segments * 3), [segments]);

    const baseParticleColor = new Color(0x3de0c2);

    useEffect(() => {
        for (let i = 0; i < maxParticleCount; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = smallSphereRadius * Math.sin(phi) * Math.cos(theta);
            const y = smallSphereRadius * Math.sin(phi) * Math.sin(theta);
            const z = smallSphereRadius * Math.cos(phi);

            particlePositions[i * 3] = x;
            particlePositions[i * 3 + 1] = y;
            particlePositions[i * 3 + 2] = z;

            const particleColor = baseParticleColor.clone();
            particleColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);

            particleColors[i * 3] = particleColor.r;
            particleColors[i * 3 + 1] = particleColor.g;
            particleColors[i * 3 + 2] = particleColor.b;

            // Random initial velocity
            const velocity = new Vector3(
                -1 + Math.random() * 2,
                -1 + Math.random() * 2,
                -1 + Math.random() * 2
            ).normalize().multiplyScalar(2); // Adjust scalar for desired speed

            particleVelocities[i * 3] = velocity.x;
            particleVelocities[i * 3 + 1] = velocity.y;
            particleVelocities[i * 3 + 2] = velocity.z;
        }

        if (particlesRef.current) {
            particlesRef.current.setAttribute('position', new BufferAttribute(particlePositions, 3));
            particlesRef.current.setAttribute('color', new BufferAttribute(particleColors, 3));
            particlesRef.current.setAttribute('velocity', new BufferAttribute(particleVelocities, 3));
        }
    }, [maxParticleCount, particlePositions, particleColors, particleVelocities, baseParticleColor, smallSphereRadius]);

    useFrame(({ clock }) => {
        if (shaderMaterialRef.current) {
            shaderMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <group ref={groupRef} dispose={null}>
            <points>
                <bufferGeometry ref={particlesRef} />
                <shaderMaterial
                    ref={shaderMaterialRef}
                    vertexColors={true}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    blending={AdditiveBlending}
                    transparent={true}
                    uniforms={{
                        uTime: { value: 0 },
                        uR: { value: r },
                        uSmallSphereRadius: { value: smallSphereRadius },
                        uCenterSphereRadius: { value: centerSphereRadius },
                    }}
                />
            </points>
            {/* <lineSegments>
                <bufferGeometry ref={linesGeometryRef}>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={colors.length / 3}
                        array={colors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    vertexColors={true}
                    blending={AdditiveBlending}
                    transparent={true}
                />
            </lineSegments> */}
        </group>
    );
};

const Graphic: React.FC = () => {
    return (
        <Canvas camera={{ position: [0, 0, 17.5] }}>
            <NeuralNetwork />
            <OrbitControls />
        </Canvas>
    );
};

export default Graphic;
