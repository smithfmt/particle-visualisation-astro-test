uniform float time;
varying vec3 vColor;

void main() {
    // Calculate some dynamic movement over time
    vec3 newPosition = position + vec3(
        sin(position.x * 5.0 + time * 0.1) * 0.5,
        sin(position.y * 5.0 + time * 0.1) * 0.5,
        sin(position.z * 5.0 + time * 0.1) * 0.5
    );

    // Pass color to fragment shader
    vColor = color;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
