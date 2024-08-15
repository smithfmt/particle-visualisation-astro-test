precision mediump float;

uniform float uMinDistance;
uniform float uLineWidth;

varying vec3 vColor;
varying vec3 vPosition;
varying vec3 vVelocity;

void main() {
    // Placeholder color and alpha
    vec4 color = vec4(vColor, 1.0);

    // Create a strength variable that's bigger the closer to the center of the particle the pixel is
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    
    // Make it decrease in strength *faster* the further from the center by using a power of 3
    strength = pow(strength, 2.0);

    // Ensure the color is only visible close to the center of the particle
    color.rgb = mix(vec3(0.0), vColor, strength);

    // Compute distance between the current fragment and the positions of other particles
    // float distToParticle = length(vPosition - gl_FragCoord.xyz);

    // if (distToParticle < uMinDistance) {
    //     float alpha = 1.0 - (distToParticle / uMinDistance);
    //     color.a = alpha * uLineWidth;
    // } else {
    //     color.a = 0.0;
    // }

    gl_FragColor = vec4(color.rgb, strength);
}
