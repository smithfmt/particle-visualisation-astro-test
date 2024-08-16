import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getSpherePositions, getCubePositions, getRandomPositions } from "./shapes";

import vertexShader from "./shaders/vertexShader.glsl";
import randomVertexShader from "./shaders/randomVertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";

const generateSeed = (index:number, count:number) => {
    return Math.sin(index) * count;
}

const CustomGeometryParticles = () => {
    const count = 10000;
    const radius = 10.0;
    const particleSpeed = 1; 

    const [particlePositions, setParticlePositions] = useState(getSpherePositions(count, radius));
    const randomParticlePositions = getRandomPositions(count, 2.0);


    const points = useRef<THREE.Points>(null!);
    const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);
    
    const seeds = useMemo(() => {
        const arr = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          arr[i] = generateSeed(i, count);
        }
        return arr;
      }, [count]);
    
      const mouseDirection = new THREE.Vector3(-150,-150,-150);

      const uniforms = useMemo(() => ({
        uRadius: { value: radius },
        uTime: { value: 0.0 },
        uSeed: { value: seeds },
        uSizeMin: { value: 1.0 },
        uSizeMax: { value: 5.0 }, 
        mouseDirection: { value: mouseDirection },
        forceDistanceThreshold: { value: 0.5 },
      }), [radius, seeds]);

    useFrame(({ clock, pointer, camera }) => {
        const elapsedTime = clock.elapsedTime;
        uniforms.uTime.value = elapsedTime;

        if (shaderMaterialRef.current) {
            const vector = new THREE.Vector3(pointer.x, pointer.y, 0.5); // z = 0.5 is the midpoint
            
            // Unproject the vector from NDC to world space
            vector.unproject(camera);

            // Calculate the direction vector from the camera
            const direction = vector.sub(camera.position).normalize();
            // You can use this direction vector in your shader or for other calculations
            // For example, pass it to the shader uniform if needed
            const distance = new THREE.Vector3(...points.current.position).sub(mouseDirection);
            if (distance.length()<0.6) {
                console.log("I AM CLOSE")
            }
            shaderMaterialRef.current.uniforms.mouseDirection.value.set(direction.x, direction.y, direction.z);
        }
    });


    return (
        <group>
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
                ref={shaderMaterialRef}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fragmentShader={fragmentShader}
                vertexShader={vertexShader}
                uniforms={uniforms}
            />
        </points>
        <points ref={points}>
        <bufferGeometry>
            <bufferAttribute
                attach="attributes-position"
                count={randomParticlePositions.length / 3}
                array={randomParticlePositions}
                itemSize={3}
            />
        </bufferGeometry>
        <shaderMaterial
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fragmentShader={fragmentShader}
            vertexShader={randomVertexShader}
            uniforms={uniforms}
        />
        </points>
        </group>
        
    );
};

const Scene = () => {
    return (
        <Canvas camera={{ position: [0.5, 0.5, 0.5] }}>
            <ambientLight intensity={0.5} />
            <CustomGeometryParticles />
            <OrbitControls />
        </Canvas>
    );
};

export default Scene;
