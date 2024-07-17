#version 300 es

#define TYPE_SUN 0
#define TYPE_PLANET 1

precision highp float;

uniform vec4 u_color;
uniform int u_type;
uniform float u_time;
uniform vec3 u_position;
uniform mat4 u_view;
in vec2 v_texCoord;
out vec4 o_fragColor;

vec4 render_planet(vec2 pos, vec4 color) {
  // Esta normal es con respecto a la pantalla.
  vec3 relative_norm = normalize(vec3(pos, sqrt(1. - dot(pos, pos))));
  vec3 world_norm = (u_view * vec4(relative_norm, 1.0)).xyz;

  float d = length(pos);
  float a = dot(-u_position, world_norm);

  if (d < 0.99) {
    return vec4(color) * ceil(a);
  } else if (d > 1.0) {
    return vec4(0);
  } else {
    return vec4(color);
  }
}

void main() {
  if (length(v_texCoord) > 1.0) {
    discard;
  }

  if (u_type == TYPE_SUN)
    o_fragColor = u_color;
  else
    o_fragColor = render_planet(v_texCoord, u_color);
}
