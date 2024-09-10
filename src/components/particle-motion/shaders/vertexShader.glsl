
uniform float uRadius;
uniform float uTime;
uniform float uSizeMin; 
uniform float uSizeMax; 
uniform vec3 cameraDirection;
uniform vec3 mousePosition;
uniform float forceDistanceThreshold; 
uniform float forceStrength;
uniform vec3 uColor;

attribute float aSeed;
attribute vec3 aCube;
attribute vec3 aSphere;
attribute vec3 aRandom;
attribute vec3 aDoDeca;


vec3 randomGeometryAlgorithm(vec3 p) {
    // Compute the squared components of the input vector
    float x2 = p.x * p.x;
    float y2 = p.y * p.y;
    float z2 = p.z * p.z;
    
    // Calculate the projection onto the cube's faces
    vec3 newPos = vec3(
        p.x * sqrt(1.0 - (y2 + z2) / 2.0 + (y2 * z2) / 3.0),
        p.y * sqrt(1.0 - (x2 + z2) / 2.0 + (x2 * z2) / 3.0),
        p.z * sqrt(1.0 - (x2 + y2) / 2.0 + (x2 * y2) / 3.0)
    );

    return newPos;
}

float nonLinearTimeline(float time, float minSpeed, float maxSpeed, float cycleDuration, float edgeSoftness) {
    // Map time to the range of 0 to 2 * PI for a full sine wave cycle
    float phase = mod(time / cycleDuration * 6.28318530718, 6.28318530718); // 2 * PI
    
    // Calculate normalized speed using a sine function
    float normalizedSpeed = 0.5 * (sin(phase) + 1.0);
    
    // Apply edge softness: slows down towards the edges
    float t = normalizedSpeed; // Normalized phase from 0 to 1
    float softFactor = 1.0 - edgeSoftness * abs(t - 0.5); // Smooth edge effect
    
    // Calculate the final timeline value
    return minSpeed + (maxSpeed - minSpeed) * normalizedSpeed * softFactor;
}

float randomInRange(float seed, float x, float y) {
  float pseudoRandom = fract(sin(seed * 12.9898) * 43758.5453);
  return x + (y - x) * pseudoRandom;
}

out vec3 vColor;
out float vStrength;

float nonlinearPhase(float time, float phaseLength) {
    // Ensure time is within the bounds of 0 to phaseLength
    float t = clamp(time / phaseLength, 0.0, 1.0);

    // Apply a non-linear transformation
    return t * t * (3.0 - 2.0 * t); // Smoothstep-like curve
}

void main() {

    vColor = uColor;

    // Define the Timeline
    // float minTimelineValue = -20.0;
    // float maxTimelineValue = 20.0;
    // float minSpeed = 0.5;
    // float maxSpeed = 1.5;
    // float cycleDuration = 20.0;
    // float edgeSoftness = 0.2;
    // float phases = 2.0;

    // float timeline = nonLinearTimeline(uTime, minSpeed, maxSpeed, cycleDuration, edgeSoftness);
    // float scaledTimeline = minTimelineValue + (maxTimelineValue - minTimelineValue) * timeline;

    // vec3 pos = normalize(position);
    // vec3 targetPos = randomGeometryAlgorithm(pos);
    

    // Move particle towards new position based on the frame in the timeline
    // pos = mix(pos, targetPos, scaledTimeline);
    vec3 phase1 = aDoDeca;
    vec3 phase2 = aCube;
    vec3 phase3 = aSphere;


    vec3 initialPos = normalize(position);
    float phaseLength = 10.0;
    float phases = 3.0;
    float timeline = nonlinearPhase(mod(uTime,phaseLength), phaseLength);
    float phase = mod(floor(uTime/phaseLength),phases+1.0);

    vec3 startPos = initialPos; // initial position
    vec3 targetPos = phase1; // first phase
    if (phase==1.0) {
      startPos = phase1;
      targetPos = phase2;
    }
    if (phase==2.0) {
      startPos = phase2;
      targetPos = phase3;
    }
    if (phase==3.0) {
      startPos = phase3;
      targetPos = initialPos;
    }

    vec3 pos = mix(startPos,targetPos,timeline);

    // Add Force Based on Proximity to Mouse Position
    vec3 lineToPoint = pos - mousePosition;

    float t = dot(lineToPoint, cameraDirection);  
    vec3 closestPointOnLine = mousePosition + t * cameraDirection;

    float dist = length(pos - closestPointOnLine);

    float forceDist = forceDistanceThreshold;
    vStrength = 0.0;
    if (dist < forceDist) {
        float force = 1.0 - (dist / forceDist);
        vec3 forceDirection = -normalize(pos - closestPointOnLine);
        // Push towards the line from the mouse position to the center
        pos += forceDirection * force * forceStrength;
        vStrength = force;
    }
    
    // Set New Position in space
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    // Add some size variation
    float size = randomInRange(aSeed,uSizeMax,uSizeMin);
    gl_Position = projectedPosition;
    gl_PointSize = size;
}