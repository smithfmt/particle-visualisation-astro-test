
uniform float uRadius;
uniform float uTime;
uniform float uSizeMin; 
uniform float uSizeMax; 
uniform vec3 cameraDirection;
uniform vec3 mousePosition;
uniform float forceDistanceThreshold; 
uniform vec3 uColor;

attribute float aSeed;

mat3 rotation3dY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

float randomInRange(float seed, float x, float y) {
    // Generate a pseudo-random number between 0.0 and 1.0 based on the seed
    float pseudoRandom = fract(sin(seed * 12.9898) * 43758.5453);
    
    // Map the pseudo-random number to the range [x, y]
    return x + (y - x) * pseudoRandom;
}

out vec3 vColor;
out float vStrength;

void main() {
    // Default color for particles
    vColor = uColor;

    float distanceFactor = pow(uRadius / 5.0 - distance(position, vec3(0.0)), 1.5);
    vec3 pos = position * rotation3dY(uTime * 0.3 * distanceFactor);

    // pos = position; // TEMP FOR TESTING

    vec3 lineToPoint = pos - mousePosition;

    float t = dot(lineToPoint, cameraDirection);  
    vec3 closestPointOnLine = mousePosition + t * cameraDirection;

    float dist = length(pos - closestPointOnLine);
    float forceStrength = 0.02;


    float forceDist = forceDistanceThreshold;
    vStrength = 0.0;
    if (dist < forceDist) {
        float force = 1.0 - (dist / forceDist);
        vec3 forceDirection = -normalize(pos - closestPointOnLine);
        
        // Push the particle in the direction perpendicular to the camera plane
        pos += forceDirection * force * forceStrength;
        
        // Change the color of affected particles
        vStrength = force;
    }

    // Transform the position to screen space
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    // Determine the size of the point
    float size = randomInRange(aSeed,uSizeMax,uSizeMin);

    // Set the final position and point size
    gl_Position = projectedPosition;
    gl_PointSize = size;
}
