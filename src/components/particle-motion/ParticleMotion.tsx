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

const CustomGeometryParticles = ({ trackPointer } : { trackPointer: boolean}) => {
    const count = 10000;
    const radius = 10.0;
    const color = new THREE.Color(0.34, 0.53, 0.96)
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
    
    const cameraDirection = new THREE.Vector3(0.5,0.5,0.5);


    // Create a Velocities Texture which stores a time stamp of the frame when the force is applied
    const velocitiesAndTime = new Float32Array(count * 4 * 2);

    for (let i = 0; i < velocitiesAndTime.length; i += 4) {
        velocitiesAndTime[i] = 0.0;
        velocitiesAndTime[i + 1] = 0.0;
        velocitiesAndTime[i + 2] = 0.0;
        velocitiesAndTime[i + 3] = 0.0;
    }
    const [usingTexture1, setUsingTexture1] = useState(true); // Ping-Pong between the two textures every frame
    const velocityTexture1 = new THREE.DataTexture(velocitiesAndTime, count, 1, THREE.RGBAFormat, THREE.FloatType);
    const velocityTexture2 = velocityTexture1.clone();

    const uniforms = useMemo(() => ({
        uRadius: { value: radius },
        uTime: { value: 0.0 },
        uSizeMin: { value: 1.0 },
        uSizeMax: { value: 5.0 }, 
        uColor: { value: color },
        cameraDirection: { value: cameraDirection },
        mousePosition: { value: new THREE.Vector3(-150,-150,-150) },
        forceDistanceThreshold: { value: 0.1 },
        forceStrength: { value: 0.02 },
        uVelocityTexture: { value: velocityTexture1 },
        uDecayRate: { value: 1.0 }

    }), [radius, seeds]);

    useFrame(({ clock, pointer, camera, }) => {
        
        const elapsedTime = clock.elapsedTime;
        uniforms.uTime.value = elapsedTime;

        // Update the Velocity Texture
        const currentVelocityTexture = usingTexture1 ? velocityTexture1 : velocityTexture2;
        const nextVelocityTexture = usingTexture1 ? velocityTexture2 : velocityTexture1;

        uniforms.uVelocityTexture.value = currentVelocityTexture

        if (shaderMaterialRef.current) {
            if (trackPointer) {
                // Convert the pointer's NDC position (x, y) into a 3D point on the screen plane
                const mousePosition = new THREE.Vector3(pointer.x, pointer.y, 0.5); // z = 0.5 positions on screen plane
                mousePosition.unproject(camera); // Convert from NDC to world space
                
                // Get the camera's viewing direction (perpendicular to the screen plane)
                const cameraDirection = new THREE.Vector3();
                camera.getWorldDirection(cameraDirection).normalize(); // Camera's view direction

                
                shaderMaterialRef.current.uniforms.cameraDirection.value.set(
                    cameraDirection.x,
                    cameraDirection.y,
                    cameraDirection.z
                );  
                shaderMaterialRef.current.uniforms.mousePosition.value.set(
                    mousePosition.x,
                    mousePosition.y,
                    mousePosition.z
                );
            } else {
                shaderMaterialRef.current.uniforms.cameraDirection.value.set(-150, -150, -150);
                shaderMaterialRef.current.uniforms.mousePosition.value.set(-150, -150, -150);
            }
        }
    });


    return (
        <group >
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
             <bufferAttribute
                attach="attributes-aSeed"
                count={count}
                array={seeds}
                itemSize={1}
            />
        </bufferGeometry>
        <shaderMaterial
            ref={shaderMaterialRef}
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
    const [trackPointer, setTrackPointer] = useState(false);
    return (
        <Canvas camera={{ position: [0.5, 0.5, 0.5] }} onPointerLeave={() => setTrackPointer(false)} onPointerEnter={() => setTrackPointer(true)}>
            <ambientLight intensity={0.5} />
            <CustomGeometryParticles trackPointer={trackPointer}/>
            <OrbitControls />
        </Canvas>
    );
};

export default Scene;
