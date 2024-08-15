import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { AdditiveBlending, Vector3, Group, BufferGeometry, BufferAttribute, Color, ShaderMaterial } from 'three';
import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';

interface ParticleData {
    velocity: Vector3;
    numConnections: number;
}

const NeuralNetwork: React.FC = () => {
    const groupRef = useRef<Group>(null);
    const particlesRef = useRef<BufferGeometry>(null);
    const linesGeometryRef = useRef<BufferGeometry>(null);

    const maxParticleCount = 1000;
    const particleCount = 1000;
    const r = 10;
    const smallSphereRadius = 5;
    const centerSphereRadius = 2;
    const maxConnections = 5;
    const minDistance = 1.5;
    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    const segments = maxParticleCount * maxParticleCount;
    const positions = useMemo(() => new Float32Array(segments * 3), [segments]);
    const colors = useMemo(() => new Float32Array(segments * 3), [segments]);

    const particlePositions = useMemo(() => new Float32Array(maxParticleCount * 3), []);
    const particleColors = useMemo(() => new Float32Array(maxParticleCount * 3), []);

    const particlesData = useMemo<ParticleData[]>(() => [], []);

    const v = useMemo(() => new Vector3(), []);
    const tempVector = useMemo(() => new Vector3(), []);

    const baseParticleColor = new Color(0x3de0c2);
    const baseLineColor = new Color(0xcff7f0);

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

            const v = new Vector3(
                -1 + Math.random() * 2,
                -1 + Math.random() * 2,
                -1 + Math.random() * 2
            );
            particlesData.push({ velocity: v.normalize().divideScalar(50), numConnections: 0 });
        }

        particlesRef.current!.setDrawRange(0, particleCount);
        particlesRef.current!.setAttribute(
            'color',
            new BufferAttribute(particleColors, 3)
        );
    }, [maxParticleCount, particleCount, particlePositions, particlesData, particleColors, baseParticleColor, smallSphereRadius]);

    useFrame((_, delta) => {
        vertexpos = 0;
        colorpos = 0;
        numConnected = 0;

        for (let i = 0; i < particleCount; i++) particlesData[i].numConnections = 0;

        for (let i = 0; i < particleCount; i++) {
            const particleData = particlesData[i];

            v.set(
                particlePositions[i * 3],
                particlePositions[i * 3 + 1],
                particlePositions[i * 3 + 2]
            ).add(particleData.velocity);

            if (v.length() > r) {
                const reflectDirection = v.clone().normalize().multiplyScalar(-1);
                v.copy(reflectDirection).multiplyScalar(r - 0.01);
                v.normalize().multiplyScalar(smallSphereRadius);
            }

            const distanceToCenter = v.length();
            if (distanceToCenter < centerSphereRadius) {
                const directionToCenter = v.clone().normalize();
                const reflection = directionToCenter.multiplyScalar(-1);
                v.copy(reflection).multiplyScalar(centerSphereRadius);
            }

            particlePositions[i * 3] = v.x;
            particlePositions[i * 3 + 1] = v.y;
            particlePositions[i * 3 + 2] = v.z;

            if (particleData.numConnections >= maxConnections) continue;

            for (let j = i + 1; j < particleCount; j++) {
                const particleDataB = particlesData[j];
                if (particleDataB.numConnections >= maxConnections) continue;

                const dx = particlePositions[i * 3] - particlePositions[j * 3];
                const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
                const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < minDistance) {
                    particleData.numConnections++;
                    particleDataB.numConnections++;

                    const alpha = 1.0 - dist / minDistance;

                    positions[vertexpos++] = particlePositions[i * 3];
                    positions[vertexpos++] = particlePositions[i * 3 + 1];
                    positions[vertexpos++] = particlePositions[i * 3 + 2];

                    positions[vertexpos++] = particlePositions[j * 3];
                    positions[vertexpos++] = particlePositions[j * 3 + 1];
                    positions[vertexpos++] = particlePositions[j * 3 + 2];

                    const lineColor = baseLineColor.clone();
                    lineColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);

                    colors[colorpos++] = lineColor.r * alpha;
                    colors[colorpos++] = lineColor.g * alpha;
                    colors[colorpos++] = lineColor.b * alpha;

                    colors[colorpos++] = lineColor.r * alpha;
                    colors[colorpos++] = lineColor.g * alpha;
                    colors[colorpos++] = lineColor.b * alpha;

                    numConnected++;
                }
            }
        }

        linesGeometryRef.current!.setDrawRange(0, numConnected * 2);
        linesGeometryRef.current!.attributes.position.needsUpdate = true;
        linesGeometryRef.current!.attributes.color.needsUpdate = true;

        particlesRef.current!.attributes.position.needsUpdate = true;

        if (groupRef.current) {
            groupRef.current.rotation.y += delta / 5;
        }
    });

    return (
        <group ref={groupRef} dispose={null}>
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[centerSphereRadius, 32, 32]} />
                <meshBasicMaterial
                    color={0x262626}
                    transparent={true}
                    opacity={0}
                    blending={AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
            <points>
                <bufferGeometry ref={particlesRef}>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleCount}
                        array={particlePositions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={particleColors.length / 3}
                        array={particleColors}
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
            </points>
            <lineSegments>
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
            </lineSegments>
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
