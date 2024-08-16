precision highp float;

uniform float uTime; // Time uniform for animation
uniform float uR; // Radius of the larger sphere
uniform float uSmallSphereRadius; // Radius of the smaller sphere
uniform vec3 mouseDirection; // Mouse direction vector in world space
uniform float forceDistanceThreshold; // Distance threshold for applying force

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
    vec3 pos = position;
    vec3 vel = velocity;

    // Update position based on velocity and time
    if (length(pos) > uR) {
        // Reset position to the smaller sphere and apply an outward velocity
        vel = -vel;
    }
    pos += vel * uTime;

    // Reflect off the boundary of the outer sphere
    

    vColor = color;
    vVelocity = vel;
    vPosition = pos;

    // float dist = length(pos - mouseDirection);
    
    // // Apply force only if the particle is within the threshold distance
    // if (dist < forceDistanceThreshold) {
    //     float force = max(0.0, 1.0 - (dist / forceDistanceThreshold)); // Example force function
    //     vec3 forceDirection = normalize(mouseDirection - pos);
    //     pos += forceDirection * force * 10.0; // Adjust strength with a scalar
    // }

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = 5.0;
}
