precision mediump float;

attribute vec3 aPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float u_time;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float smoothNoise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = rand(i);
    float b = rand(i + vec2(1.0,0.0));
    float c = rand(i + vec2(0.0,1.0));
    float d = rand(i + vec2(1.0,1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a, b, u.x) +
           (c - a)* u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}

void main() {
  vec4 pos = vec4(aPosition, 1.0);

  float n = smoothNoise(aPosition.xz * 0.05 + u_time * 0.1);
  pos.y += n * 100.0 - 50.0;

  gl_Position = uProjectionMatrix * uModelViewMatrix * pos;
}
