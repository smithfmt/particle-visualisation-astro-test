precision highp float;

uniform float uTime; // Time uniform for animation
uniform float uR; // Radius of the larger sphere
uniform float uSmallSphereRadius; // Radius of the smaller sphere where particles respawn
uniform float uCenterSphereRadius; // Radius of the center sphere

attribute vec3 velocity; // Velocity attribute from JavaScript
varying vec3 vColor; // Varying color to pass to the fragment shader
varying vec3 vVelocity;
varying vec3 vPosition;

// Function to create a pseudo-random velocity based on the position
vec3 randomVelocity(vec3 pos) {
    return normalize(vec3(
        fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453),
        fract(sin(dot(pos, vec3(93.9898, 67.234, 76.164))) * 24653.5453),
        fract(sin(dot(pos, vec3(45.9898, 23.233, 89.164))) * 13247.5453)
    )) * 2.0; // Adjust the magnitude for desired speed
}

void main() {
    vec3 pos = position; // Get initial position of the vertex
    vec3 vel = velocity; // Get initial velocity

    // Update position based on velocity and time
    pos += vel * uTime;

    // Reflect off the boundary of the larger sphere
    if (length(pos) > uR) {
        // Reset position to the smaller sphere and assign a new random velocity
        pos = normalize(pos) * uSmallSphereRadius;
        vel = randomVelocity(pos);
    }

    // Reflect off the center sphere
    if (length(pos) < uCenterSphereRadius) {
        pos = normalize(pos) * uCenterSphereRadius;
    }

    // Pass the updated velocity to the next frame
    vColor = color;
    vVelocity = vel;
    vPosition = pos;

    // Set the updated position in the scene
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    // Set the size of each point
    gl_PointSize = 5.0;
}
