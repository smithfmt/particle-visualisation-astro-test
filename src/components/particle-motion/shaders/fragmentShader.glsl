void main() {
  vec3 color = vec3(0.34, 0.53, 0.96);
  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, 3.0);

  gl_FragColor = vec4(color, strength);
}
