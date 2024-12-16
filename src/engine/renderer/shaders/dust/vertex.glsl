#version 300 es

precision highp float;

uniform vec3 u_position;
uniform mat4 u_modelViewProjection;

out float v_alpha;

float random(float n) {
  return fract(sin(n) * 43758.5453123);
}

float random_unit(float n) {
  return (random(n) - 0.5) * 2.0;
}

vec3 get_vertex_box(float index) {
  float z = mod(floor(index / 9.0), 3.0);
  float y = mod(floor(index / 3.0), 3.0);
  float x = mod(index, 3.0);
  return vec3(
    x - 1.0,
    y - 1.0,
    z - 1.0
  );
}

vec3 get_vertex_at(float index, vec3 box) {
  return box + vec3(
    random_unit(index + 163.0),
    random_unit(index + 127.0),
    random_unit(index + 487.0)
  );
}

vec4 get_vertex(int index, vec3 position) {
  float i = float(index);
  vec3 box = get_vertex_box(i);
  return vec4(
    get_vertex_at(mod(i, 100.0), box + floor(position)) - position,
    random(i) * 4.0 + 1.0
  );
}

void main() {
  vec4 vertex = get_vertex(gl_VertexID, u_position);
  vec4 position = vec4(vertex.xyz, 1.0);
  vec4 projected = u_modelViewProjection * position;
  gl_PointSize = vertex.w;
  gl_Position = projected;
  v_alpha = 1.0 - projected.z;
}
