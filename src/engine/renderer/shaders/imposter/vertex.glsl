#version 300 es

precision highp float;

uniform mat4 u_modelViewProjection;
uniform float u_size;

out vec2 v_texCoord;

vec2 get_vertex(int index) {
  if (index == 0) {
    return vec2(-1.0, -1.0);
  } else if (index == 1) {
    return vec2( 1.0, -1.0);
  } else if (index == 2) {
    return vec2(-1.0,  1.0);
  } else if (index == 3) {
    return vec2( 1.0,  1.0);
  }
  return vec2(0.0,  0.0);
}

void main() {
  gl_Position = u_modelViewProjection * vec4(get_vertex(gl_VertexID) * u_size, 0.0, 1.0);
  v_texCoord = get_vertex(gl_VertexID);
}
