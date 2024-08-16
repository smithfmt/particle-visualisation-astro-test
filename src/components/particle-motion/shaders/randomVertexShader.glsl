
uniform float uRadius;
uniform float uTime;
uniform float uSizeMin; 
uniform float uSizeMax; 
uniform float uSeed;
uniform vec3 mouseDirection;
uniform float forceDistanceThreshold; 

mat3 rotation3dY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

float random(float seed, vec3 pos) {
    return fract(sin(dot(pos, vec3(seed, seed * 1.0, seed * 2.0))) * 43758.5453);
}

void main() {
    float randomFactor = random(uSeed, position);
    float distanceFactor = pow(uRadius/5.0 - distance(position, vec3(0.0)), 1.5);
    vec3 particlePosition = position * rotation3dY(uTime * 0.3 * distanceFactor);

    float dist = length(particlePosition - mouseDirection);

    float forceStrength = 0.5;
    if (dist < forceDistanceThreshold) {
        float force = max(1.0-(dist/forceDistanceThreshold), 1.0 - (dist / forceDistanceThreshold));
        vec3 forceDirection = normalize(mouseDirection - particlePosition);
        particlePosition += forceDirection * force * forceStrength; 
    }

    vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    float size = mix(uSizeMin, uSizeMax, randomFactor);

    

    gl_Position = projectedPosition;
    gl_PointSize = 3.0;
}