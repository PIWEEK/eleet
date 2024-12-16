#version 300 es

precision highp float;

uniform sampler2D u_sampler;
out vec4 o_fragColor;
in vec2 v_texCoord;

void main() {
  o_fragColor = texture(u_sampler, v_texCoord);
}
