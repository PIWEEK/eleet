#version 300 es

precision highp float;

in vec2 v_texCoord;
out vec4 o_fragColor;

void main() {
  if (length(v_texCoord) > 1.0) {
    discard;
  }

  o_fragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
