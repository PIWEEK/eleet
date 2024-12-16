#version 300 es

#define PI 3.14159265
#define TAU (PI * 2.0)

precision highp float;

uniform int u_total;
uniform mat4 u_modelViewProjection;
uniform float u_radius;

vec4 get_vertex(int index, int total, float radius) {
  float theta = float(index) / float(total - 1) * TAU;
  return vec4(
    cos(theta) * radius,
    0.0,
    sin(theta) * radius,
    1.0
  );
}

void main() {
  gl_Position = u_modelViewProjection * get_vertex(gl_VertexID, u_total, u_radius);
}
