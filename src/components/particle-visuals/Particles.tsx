import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getSpherePositions, getCubePositions, getRandomPositions } from "./shapes";

import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";

const createTextureFromArray = (array:any, width:number, height:number) => {
    const texture = new THREE.DataTexture(array, width, height, THREE.RGBFormat, THREE.FloatType);
    texture.needsUpdate = true;
    return texture;
};

const CustomGeometryParticles = () => {
    const count = 10000;
    const radius = 10.0;
    const transitionDuration = 6; // Duration of the transition in seconds
    const particleSpeed = 0.01; // Reduced speed for debugging

    const sequence = ["sphere", "cube", "random"];
    const [shapeIndex, setShapeIndex] = useState(0);
    const [targetShape, setTargetShape] = useState(sequence[shapeIndex]);
    const [targetPositions, setTargetPositions] = useState(getRandomPositions(count, radius));
    const [particlePositions, setParticlePositions] = useState(getRandomPositions(count, radius));
    const [velocities, setVelocities] = useState(new Float32Array(count * 3));
    const [lastSwitchTime, setLastSwitchTime] = useState(0);

    const points = useRef();
    
    const uniforms = {
        uTargetPositions: { value: targetPositions },
        uShapeType: { value: 0.0 },
        uRadius: { value: radius },
    };

    const updateTargetPositions = () => {
        let newPositions;
        switch(targetShape) {
            case "sphere":
                newPositions = getSpherePositions(count, radius);
                break;
            case "cube":
                newPositions = getCubePositions(count, radius);
                break;
            case "random":
                newPositions = getRandomPositions(count, radius);
                break;
            default:
                newPositions = getRandomPositions(count, radius);
                break;
        };

        const targetPositionsTexture = createTextureFromArray(new Float32Array(newPositions), count, 1);
        uniforms.uTargetPositions.value = targetPositionsTexture;

        return newPositions;
    };

    useEffect(() => {
        setTargetPositions(updateTargetPositions());
        const newVelocities = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const currentPos = new THREE.Vector3().fromArray(particlePositions, i * 3);
            const targetPos = new THREE.Vector3().fromArray(targetPositions, i * 3);
            const velocity = targetPos.clone().sub(currentPos).normalize().multiplyScalar(particleSpeed);
            newVelocities.set(velocity.toArray(), i * 3);
        }
        setVelocities(newVelocities);
    }, [targetShape, particlePositions]);

    useFrame(({ clock }) => {
        const elapsedTime = clock.elapsedTime;
        const deltaTime = elapsedTime - lastSwitchTime;

        if (deltaTime >= transitionDuration) {
            const newShapeIndex = (shapeIndex + 1) % sequence.length;
            setShapeIndex(newShapeIndex);
            setTargetShape(sequence[newShapeIndex]);
            setLastSwitchTime(elapsedTime);
            setParticlePositions(updateTargetPositions());
        }

        const newPositions = new Float32Array(count * 3);
        const positionsArray = points.current.geometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            const currentPos = new THREE.Vector3().fromArray(positionsArray, i * 3);
            const velocity = new THREE.Vector3().fromArray(velocities, i * 3);
            const targetPos = new THREE.Vector3().fromArray(targetPositions, i * 3);

            // Move particle towards the target
            const newPos = currentPos.clone().add(velocity);

            // Ensure the particle stays within the bounds of the target shape
            if (targetShape === "sphere") {
                // Clamp position within a sphere
                const directionToCenter = new THREE.Vector3().subVectors(newPos, new THREE.Vector3());
                if (directionToCenter.length() > radius) {
                    newPos.copy(directionToCenter.normalize().multiplyScalar(radius));
                }
            } else if (targetShape === "cube") {
                // Clamp position within a cube
                newPos.x = Math.max(-radius, Math.min(radius, newPos.x));
                newPos.y = Math.max(-radius, Math.min(radius, newPos.y));
                newPos.z = Math.max(-radius, Math.min(radius, newPos.z));
            }

            // Snap particle to target if close enough
            if (newPos.distanceTo(targetPos) < particleSpeed) {
                newPositions.set(targetPos.toArray(), i * 3); // Snap to target
            } else {
                newPositions.set(newPos.toArray(), i * 3);
            }
        }

        // Update particle positions
        points.current.geometry.attributes.position.array.set(newPositions);
        points.current.geometry.attributes.position.needsUpdate = true;
    });


    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlePositions.length / 3}
                    array={particlePositions}
                    itemSize={3}
                />
            </bufferGeometry>
            <shaderMaterial
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fragmentShader={fragmentShader}
                vertexShader={vertexShader}
                uniforms={uniforms}
            />
        </points>
    );
};

const Scene = () => {
    return (
        <Canvas camera={{ position: [2.0, 2.0, 2.0] }}>
            <ambientLight intensity={0.5} />
            <CustomGeometryParticles />
            <OrbitControls />
        </Canvas>
    );
};

export default Scene;
