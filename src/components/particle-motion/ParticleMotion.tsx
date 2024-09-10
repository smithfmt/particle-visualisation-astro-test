import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getSpherePositions, getCubePositions, getRandomPositions, generateSeed, getDodecahedronPositions } from "./utils";

import vertexShader from "./shaders/vertexShader.glsl";
import randomVertexShader from "./shaders/randomVertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";

type Props = {
    trackPointer: boolean,
    count?: number,
    radius?: number,
    color?: THREE.Color
    particleSpeed?: number,
};

const CustomGeometryParticles = ({ trackPointer, count=1000000, radius=10.0, color=new THREE.Color(0.34, 0.53, 0.96), particleSpeed=1.0  } : Props) => {
    const [particlePositions, setParticlePositions] = useState(getSpherePositions(count, radius));
    const randomParticlePositions = getRandomPositions(count/2, 2.0);
    const points = useRef<THREE.Points>(null!);
    const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);
    const seeds = useMemo(() => {
        const arr = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          arr[i] = generateSeed(i, count);
        }
        return arr;
      }, [count]);
    
    const uniforms = useMemo(() => ({
        uRadius: { value: radius },
        uTime: { value: 0.0 },
        uSizeMin: { value: 1.0 },
        uSizeMax: { value: 5.0 }, 
        uColor: { value: color },
        cameraDirection: { value: new THREE.Vector3(0.5,0.5,0.5)},
        mousePosition: { value: new THREE.Vector3(-150,-150,-150) },
        forceDistanceThreshold: { value: 0.1 },
        forceStrength: { value: 0.02 },
        uDecayRate: { value: 1.0 },
    }), [radius, seeds]);

    useFrame(({ clock, pointer, camera, }) => {
        uniforms.uTime.value = clock.elapsedTime;

        if (shaderMaterialRef.current) {
            if (trackPointer) {
                const mousePosition = new THREE.Vector3(pointer.x, pointer.y, 0.5);
                mousePosition.unproject(camera);
                const cameraDirection = new THREE.Vector3();
                camera.getWorldDirection(cameraDirection).normalize();
                shaderMaterialRef.current.uniforms.cameraDirection.value.set(cameraDirection.x,cameraDirection.y,cameraDirection.z,);  
                shaderMaterialRef.current.uniforms.mousePosition.value.set(mousePosition.x,mousePosition.y,mousePosition.z);
            } else {
                shaderMaterialRef.current.uniforms.cameraDirection.value.set(-150, -150, -150);
                shaderMaterialRef.current.uniforms.mousePosition.value.set(-150, -150, -150);
            };
        };
    });


    const cubePositions = getCubePositions(count, radius/4);
    const spherePositions = getSpherePositions(count, radius/30);
    const randPositions = getRandomPositions(count, radius/30);
    const doDecaPositons = getDodecahedronPositions(count,radius/20,2);

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
                <bufferAttribute
                    attach="attributes-aCube"
                    count={cubePositions.length / 3}
                    array={cubePositions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aSphere"
                    count={spherePositions.length / 3}
                    array={spherePositions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aRandom"
                    count={randPositions.length / 3}
                    array={randPositions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aDoDeca"
                    count={doDecaPositons.length / 3}
                    array={doDecaPositons}
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
