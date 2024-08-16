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
        const x = (Math.random() - 0.5) * radius * 2;
        const y = (Math.random() - 0.5) * radius * 2;
        const z = (Math.random() - 0.5) * radius * 2;

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