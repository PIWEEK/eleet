#version 300 es

#define PI 3.14159265
#define TAU (PI * 2.0)

#define TYPE_SUN 0
#define TYPE_PLANET 1

precision highp float;

const vec4 colorMain = vec4(1., 0.9, 0.5, 1.);
const vec4 colorBlack = vec4(0);
const vec4 colorWhite = vec4(1);

float from(float x, float min, float max) {
  return (x - min) / (max - min);
}

float random(float n) {
  return fract(sin(n) * 43758.5453123);
}

vec4 random_texture(vec2 pos) {
  return vec4(
    random(pos.x + 1.0),
    random(pos.y + 1.1),
    random(pos.x + 2.0),
    random(pos.y + 2.5)
  );
}

float dither2x2(vec2 position, float brightness) {
  int x = int(mod(position.x, 2.0));
  int y = int(mod(position.y, 2.0));
  int index = x + y * 2;
  float limit = 0.0;

  if (x < 8) {
    if (index == 0) limit = 0.25;
    if (index == 1) limit = 0.75;
    if (index == 2) limit = 1.00;
    if (index == 3) limit = 0.50;
  }

  return brightness < limit ? 0.0 : 1.0;
}


float dither4x4(vec2 position, float brightness) {
  int x = int(mod(position.x, 4.0));
  int y = int(mod(position.y, 4.0));
  int index = x + y * 4;
  float limit = 0.0;

  if (x < 8) {
    if (index == 0) limit = 0.0625;
    if (index == 1) limit = 0.5625;
    if (index == 2) limit = 0.1875;
    if (index == 3) limit = 0.6875;
    if (index == 4) limit = 0.8125;
    if (index == 5) limit = 0.3125;
    if (index == 6) limit = 0.9375;
    if (index == 7) limit = 0.4375;
    if (index == 8) limit = 0.25;
    if (index == 9) limit = 0.75;
    if (index == 10) limit = 0.125;
    if (index == 11) limit = 0.625;
    if (index == 12) limit = 1.0;
    if (index == 13) limit = 0.5;
    if (index == 14) limit = 0.875;
    if (index == 15) limit = 0.375;
  }

  return brightness < limit ? 0.0 : 1.0;
}


float dither8x8(vec2 position, float brightness) {
  int x = int(mod(position.x, 8.0));
  int y = int(mod(position.y, 8.0));
  int index = x + y * 8;
  float limit = 0.0;

  if (x < 8) {
    if (index == 0) limit = 0.015625;
    if (index == 1) limit = 0.515625;
    if (index == 2) limit = 0.140625;
    if (index == 3) limit = 0.640625;
    if (index == 4) limit = 0.046875;
    if (index == 5) limit = 0.546875;
    if (index == 6) limit = 0.171875;
    if (index == 7) limit = 0.671875;
    if (index == 8) limit = 0.765625;
    if (index == 9) limit = 0.265625;
    if (index == 10) limit = 0.890625;
    if (index == 11) limit = 0.390625;
    if (index == 12) limit = 0.796875;
    if (index == 13) limit = 0.296875;
    if (index == 14) limit = 0.921875;
    if (index == 15) limit = 0.421875;
    if (index == 16) limit = 0.203125;
    if (index == 17) limit = 0.703125;
    if (index == 18) limit = 0.078125;
    if (index == 19) limit = 0.578125;
    if (index == 20) limit = 0.234375;
    if (index == 21) limit = 0.734375;
    if (index == 22) limit = 0.109375;
    if (index == 23) limit = 0.609375;
    if (index == 24) limit = 0.953125;
    if (index == 25) limit = 0.453125;
    if (index == 26) limit = 0.828125;
    if (index == 27) limit = 0.328125;
    if (index == 28) limit = 0.984375;
    if (index == 29) limit = 0.484375;
    if (index == 30) limit = 0.859375;
    if (index == 31) limit = 0.359375;
    if (index == 32) limit = 0.0625;
    if (index == 33) limit = 0.5625;
    if (index == 34) limit = 0.1875;
    if (index == 35) limit = 0.6875;
    if (index == 36) limit = 0.03125;
    if (index == 37) limit = 0.53125;
    if (index == 38) limit = 0.15625;
    if (index == 39) limit = 0.65625;
    if (index == 40) limit = 0.8125;
    if (index == 41) limit = 0.3125;
    if (index == 42) limit = 0.9375;
    if (index == 43) limit = 0.4375;
    if (index == 44) limit = 0.78125;
    if (index == 45) limit = 0.28125;
    if (index == 46) limit = 0.90625;
    if (index == 47) limit = 0.40625;
    if (index == 48) limit = 0.25;
    if (index == 49) limit = 0.75;
    if (index == 50) limit = 0.125;
    if (index == 51) limit = 0.625;
    if (index == 52) limit = 0.21875;
    if (index == 53) limit = 0.71875;
    if (index == 54) limit = 0.09375;
    if (index == 55) limit = 0.59375;
    if (index == 56) limit = 1.0;
    if (index == 57) limit = 0.5;
    if (index == 58) limit = 0.875;
    if (index == 59) limit = 0.375;
    if (index == 60) limit = 0.96875;
    if (index == 61) limit = 0.46875;
    if (index == 62) limit = 0.84375;
    if (index == 63) limit = 0.34375;
  }

  return brightness < limit ? 0.0 : 1.0;
}

/*
float ditherNoise8x8(vec2 position, float brightness) {
  float limit = rand(position.x + position.y);
  return brightness < limit ? 0.0 : 1.0;
}
*/

// Dither con textura (necesita una textura de ruido azúl).
/*
float dither8x8(vec2 position, float brightness) {
  float limit = texture(iChannel0, position / 1024.).x;
  return brightness < limit ? 0.0 : 1.0;
}
*/

// uniform float u_time;
uniform vec4 u_color;
uniform int u_type;
uniform float u_time;
uniform vec3 u_position;
uniform mat4 u_view;
in vec2 v_texCoord;
out vec4 o_fragColor;

vec4 renderPlanet(vec2 pos, vec4 color) {
  // Esta normal es con respecto a la pantalla.
  vec3 relative_norm = normalize(vec3(pos, sqrt(1. - dot(pos, pos))));
  vec3 world_norm = (u_view * vec4(relative_norm, 1.0)).xyz;

  float d = length(pos);
  float a = dot(-u_position, world_norm);

  if (d < 0.99) {
    return vec4(color) * dither8x8(gl_FragCoord.xy, a);
  } else if (d > 1.0) {
    return vec4(0);
  } else {
    return vec4(color);
  }
}

vec4 renderSun(vec2 pos, vec4 color) {
    const float halodist = 0.9;

    vec4 fragColor  = vec4(0);

    vec3 light = vec3(cos(u_time), .0, sin(u_time));
    float apos = atan(pos.y, pos.x);
    vec3 norm = normalize(vec3(pos, sqrt(1. - dot(pos, pos))));
    vec2 tpos = vec2(
      atan(norm.z, norm.x) / TAU,
      asin(norm.y) / TAU
    );

    vec2 tdpos0 = vec2(
        mod(u_time * .1, 1.),
        mod(-u_time* 0.01, 1.)
    ) + tpos;
    vec4 tex0 = random_texture(
      tdpos0
    );

    vec2 tdpos1 = vec2(
        mod(u_time * .1, 1.),
        mod(u_time * 0.01, 1.)
   	) + tpos;
    vec4 tex1 = random_texture(
      tdpos1
    );

    float rx = atan(norm.y, norm.x) / PI;
    float ry = mod(u_time * 0.01, 1.);
    vec2 rpos = vec2(rx, ry);
    vec4 rtex0 = random_texture(
      rpos
    );
    vec4 rtex1 = random_texture(
      rpos
    );
    float incidence = dot(light, norm);
    float dist = length(pos);
    float ndist = halodist - dist;
    if (dist > halodist) {
      fragColor = vec4(0);
      fragColor += mix(
          colorMain,
          colorBlack,
          pow(dist - halodist, .0125)
      );

      float ldist = halodist + rtex1.x * .075;
      if (dist < ldist) {
        vec4 corona = mix(
          colorMain * 0.1,
          colorBlack,
          from(dist, halodist, ldist)
        );
        fragColor += corona;
      }

      float hdist = halodist + rtex0.x * 0.05 + rtex1.x * 0.1;
      if (dist < hdist) {
        vec4 corona = mix(
          colorMain * 0.5,
          colorBlack,
          from(dist, halodist, hdist)
        );
        fragColor += corona;
      }

      float rdist = halodist + rtex0.x * 0.1;
      if (dist < rdist) {
        vec4 corona = mix(
          colorMain + vec4(0.5, 0.5, 0.5, 1.),
          colorBlack,
          from(dist, halodist, rdist)
        );
        fragColor += corona;
      }
    } else {
    	fragColor = vec4(
            mix(
                colorWhite * 0.1,
                colorMain,
            	(tex0.x + tex1.x) * 0.5
            )
        ) * halodist;

        fragColor += vec4(
            mix(
                colorMain,
                colorBlack,
                pow(halodist, 0.5)
            )
        );

        fragColor += vec4(
            mix(
                colorMain * 0.7,
                colorBlack,
                pow(halodist, 0.09)
            )
        );
    }
    float brightness = (fragColor.x + fragColor.y + fragColor.z) / 3.0;
    return vec4(color) * dither8x8(gl_FragCoord.xy, brightness);
}

void main() {
  if (length(v_texCoord) > 1.0)
  {
    discard;
  }

  if (u_type == TYPE_SUN)
  {
    o_fragColor = renderSun(v_texCoord, u_color);
  }
  else
  {
    o_fragColor = renderPlanet(v_texCoord, u_color);
  }
}
