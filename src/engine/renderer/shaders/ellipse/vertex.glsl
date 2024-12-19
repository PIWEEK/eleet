#version 300 es

#define PI 3.14159265
#define TAU (PI * 2.0)

precision highp float;

uniform int u_total;
uniform mat4 u_modelViewProjection;
uniform float u_semiMajorAxis;
uniform float u_semiMinorAxis;

vec4 get_vertex(int index, int total, float a, float b) {
  float theta = float(index) / float(total - 1) * TAU;
  return vec4(
    cos(theta) * a,
    0.0,
    sin(theta) * b,
    1.0
  );
}

void main() {
  gl_Position = u_modelViewProjection * get_vertex(gl_VertexID, u_total, u_semiMajorAxis, u_semiMinorAxis);
}
