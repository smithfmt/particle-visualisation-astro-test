// vertexShader.glsl

precision highp float;

uniform float uTime; // Time uniform for animation
uniform float uR; // Radius of the larger sphere
uniform float uSmallSphereRadius; // Radius of the smaller sphere where particles spawn
varying vec3 vColor; // Varying color to pass to the fragment shader

// Function to create a pseudo-random velocity based on position
vec3 randomVelocity(vec3 pos) {
    return normalize(vec3(
        fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453),
        fract(sin(dot(pos, vec3(93.9898, 67.234, 76.164))) * 24653.5453),
        fract(sin(dot(pos, vec3(45.9898, 23.233, 89.164))) * 13247.5453)
    )) / 1.0; // Reduce the divisor to speed up the particles
}

void main() {
    vec3 pos = position; // Get initial position of the vertex
    vec3 velocity = randomVelocity(pos); // Calculate velocity based on position

    // Calculate new position based on velocity and time
    pos += velocity * uTime;

    // Reflect off the boundary of the larger sphere
    if (length(pos) > uR) {
        // Reflect the direction and slightly reduce the length to avoid exact boundary placement
        vec3 normal = normalize(pos);
        pos = reflect(pos, normal);
        pos = normalize(pos) * (uR - 0.01);
    }

    // Pass color to the fragment shader
    vColor = color;

    // Set the updated position in the scene
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    // Set the size of each point
    gl_PointSize = 3.0;
}
