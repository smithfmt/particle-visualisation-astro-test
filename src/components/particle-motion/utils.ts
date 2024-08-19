import * as THREE from "three";

export const getSpherePositions = (count:number, radius: number) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const distance = Math.sqrt(Math.random()) * radius;
      const theta = Math.acos(Math.random() * 2 - 1);
      const phi = Math.random() * 2 * Math.PI;

      let x = distance * Math.sin(theta) * Math.cos(phi);
      let y = distance * Math.sin(theta) * Math.sin(phi);
      let z = distance * Math.cos(theta);

      positions.set([x, y, z], i * 3);
    }
    return positions;
  };

  // Function to generate cube positions
export const getCubePositions = (count:number, radius: number) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * radius * 1/4;
        const y = (Math.random() - 0.5) * radius * 1/4;
        const z = (Math.random() - 0.5) * radius * 1/4;

        positions.set([x, y, z], i * 3);
    }
    return positions;
};

export const getRandomPositions = (count: number, radius: number) => {
  const positions = new Float32Array(count * 3);
  const bias = 2.0; // Adjust this to control the concentration towards the center

  for (let i = 0; i < count; i++) {
      // Bias towards the center
      const randomRadius = Math.pow(Math.random(), bias) * radius;
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * 2 * Math.PI;

      // Convert spherical coordinates to Cartesian coordinates
      const x = randomRadius * Math.sin(theta) * Math.cos(phi);
      const y = randomRadius * Math.sin(theta) * Math.sin(phi);
      const z = randomRadius * Math.cos(theta);

      positions.set([x, y, z], i * 3);
  }

  return positions;
};

export const getDodecahedronPositions = (count: number, radius: number, edgeBias: number = 0.8): Float32Array => {
  const positions = new Float32Array(count * 3);

  // Golden ratio φ
  const phi = (1 + Math.sqrt(5)) / 2;

  // Dodecahedron vertices
  const dodecahedronVertices: number[][] = [
      // (±1, ±1, ±1)
      [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1],
      // (0, ±1/φ, ±φ)
      [0, -1 / phi, -phi], [0, 1 / phi, -phi], [0, -1 / phi, phi], [0, 1 / phi, phi],
      // (±1/φ, ±φ, 0)
      [-1 / phi, -phi, 0], [1 / phi, -phi, 0], [-1 / phi, phi, 0], [1 / phi, phi, 0],
      // (±φ, 0, ±1/φ)
      [-phi, 0, -1 / phi], [phi, 0, -1 / phi], [-phi, 0, 1 / phi], [phi, 0, 1 / phi]
  ];

  // Normalize and scale vertices to lie on the surface of the dodecahedron
  const normalizeAndScale = (vec: number[]): number[] => {
      const length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
      return [vec[0] / length * radius, vec[1] / length * radius, vec[2] / length * radius];
  };

  const normalizedVertices = dodecahedronVertices.map(v => normalizeAndScale(v));

  // Generate random points inside the dodecahedron with edge bias
  for (let i = 0; i < count; i++) {
      const randomVertex1 = normalizedVertices[Math.floor(Math.random() * normalizedVertices.length)];
      const randomVertex2 = normalizedVertices[Math.floor(Math.random() * normalizedVertices.length)];
      const randomVertex3 = normalizedVertices[Math.floor(Math.random() * normalizedVertices.length)];

      // Random factors with bias toward edges
      const randomFactor1 = Math.pow(Math.random(), edgeBias);
      const randomFactor2 = Math.pow(Math.random(), edgeBias);
      const randomFactor3 = Math.pow(Math.random(), edgeBias);
      const sum = randomFactor1 + randomFactor2 + randomFactor3;

      // Interpolating the position
      const x = (randomVertex1[0] * randomFactor1 + randomVertex2[0] * randomFactor2 + randomVertex3[0] * randomFactor3) / sum;
      const y = (randomVertex1[1] * randomFactor1 + randomVertex2[1] * randomFactor2 + randomVertex3[1] * randomFactor3) / sum;
      const z = (randomVertex1[2] * randomFactor1 + randomVertex2[2] * randomFactor2 + randomVertex3[2] * randomFactor3) / sum;

      positions.set([x, y, z], i * 3);
  }

  return positions;
};

export const generateSeed = (index:number, count:number) => {
  return Math.sin(index) * count;
};

export const generateRenderTargets = (count: number) => {
  const size = Math.ceil(Math.sqrt(count));
  const renderTarget1 = new THREE.WebGLRenderTarget(size, size, {
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });
  
  const renderTarget2 = new THREE.WebGLRenderTarget(size, size, {
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  return [renderTarget1, renderTarget2];
};

export const generateTexture = (count: number) => {
  const size = Math.ceil(Math.sqrt(count));
  const data = new Float32Array(size * size * 4); // Create a Float32Array to store RGBA values
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
  texture.needsUpdate = true;  // Mark the texture as needing update
  return texture;
};

export const applyShaderPass = (gl:THREE.WebGLRenderer, material:THREE.ShaderMaterial, renderTarget:THREE.WebGLRenderTarget, scene:THREE.Scene, camera:THREE.Camera ) => {
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    material
  );
  
  const rtScene = new THREE.Scene();
  rtScene.add(quad);

  gl.setRenderTarget(renderTarget);
  gl.render(rtScene, camera);
  gl.setRenderTarget(null);
};