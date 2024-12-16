#version 300 es

precision highp float;

in float v_alpha;
out vec4 o_fragColor;

void main() {
  o_fragColor = vec4(v_alpha, v_alpha, v_alpha, v_alpha);
}
