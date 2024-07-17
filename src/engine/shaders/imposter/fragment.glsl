#version 300 es

#define TYPE_SUN 0
#define TYPE_PLANET 1

precision highp float;

uniform vec4 u_color;
uniform int u_type;
uniform float u_time;
in vec2 v_texCoord;
out vec4 o_fragColor;

vec4 render_planet(vec2 pos, vec4 color) {
  vec3 sun = vec3(cos(u_time * 0.5), 0., sin(u_time * 0.5));
  vec3 norm = normalize(vec3(pos, sqrt(1. - dot(pos, pos))));

  float d = length(pos);
  float a = dot(sun, norm);

  if (d < 0.99) {
    // Output to screen
    // fragColor = vec4(1) * dither8x8(fragCoord, a);
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
