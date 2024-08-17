in vec3 vColor;
in float vStrength;

void main() {
  vec3 mixer = vec3(1.0, 1.0, 1.0);
  float mixStrength = vStrength/5.0;
  mixStrength = 0.0;
  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, 3.0);

  vec3 finalColor = mix(vColor, mixer, mixStrength);

  gl_FragColor = vec4(finalColor, strength);
}
