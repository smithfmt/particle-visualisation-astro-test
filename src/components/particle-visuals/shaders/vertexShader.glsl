
uniform sampler2D uTargetPositions;
uniform float uShapeType;
uniform float uRadius;

attribute vec3 velocity; 

vec3 newVelocity;
vec3 newPosition;
void main() {
    newVelocity = velocity;

    newPosition = position;
    if (uShapeType == 0.0) {
        if (length(position) > uRadius) {
            newPosition =  normalize(position);
        }
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = 3.0;
}
