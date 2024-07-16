#version 300 es

precision highp float;

uniform vec3 u_position;
uniform mat4 u_modelViewProjection;

float random(float n) {
  return fract(sin(n) * 4343758.5453123);
}

float random_unit(float n) {
  return (random(n) - 0.5) * 2.0;
}

float smod(float x, float y) {
  return x - y * trunc(x / y);
}

vec3 smod(vec3 x, float y) {
  return vec3(
    smod(x.x, y),
    smod(x.y, y),
    smod(x.z, y)
  );
}

vec3 smod(vec3 x, vec3 y) {
  return vec3(
    smod(x.x, y.x),
    smod(x.y, y.y),
    smod(x.z, y.z)
  );
}

vec4 get_vertex(int index, vec3 position) {
  vec3 tp = trunc(position);
  vec3 minp = tp - 1.0;
  vec3 maxp = tp + 1.0;
  vec3 p = mix(minp, maxp, vec3(
    random_unit(float(index + 1) + tp.x),
    random_unit(float(index + 2) + tp.y),
    random_unit(float(index + 3) + tp.z)
  ));
  return vec4(
    p - position,
    random(float(index + 4)) * 7.0 + 1.0
  );
}

void main() {
  vec4 position = get_vertex(gl_VertexID, u_position);
  vec4 whatever = vec4(position.xyz, 1.0);
  gl_PointSize = position.w;
  gl_Position = u_modelViewProjection * whatever;
}
