precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pan; 
uniform float u_scroll; 



#define PI 3.14159265359

float hash12(vec2 p)
{
    uvec2 q = uvec2(ivec2(p)) * uvec2(1597334673U, 3812015801U);
    uint n = (q.x ^ q.y) * 1597334673U;
    return float(n) * 2.328306437080797e-10;
}

vec2 direction(vec2 p)
{
    float t = hash12(p)*2.*PI;
    return vec2(cos(t), sin(t));
}

float perlin2d(vec2 p)
{
    vec2 pg = floor(p), pc = fract(p);
    float p0 = dot(direction(pg+vec2(0,0)), pc-vec2(0,0));
    float p1 = dot(direction(pg+vec2(1,0)), pc-vec2(1,0));
    float p2 = dot(direction(pg+vec2(0,1)), pc-vec2(0,1));
    float p3 = dot(direction(pg+vec2(1,1)), pc-vec2(1,1));
    
    pc = pc*pc*(3.-2.*pc);
    
    return mix(
        mix(p0,p1,pc.x),
        mix(p2,p3,pc.x),
        pc.y
    )*2.10+.5;
}

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float m = sin(perlin2d(( uv + u_pan )) * PI * 10.0 - u_time) - 0.97;
    float a = 0.01;
    float t = 0.02;
    m = smoothstep(a, a + t, m);
    vec3 col = mix(vec3(0.1), vec3(1.0), 1.0 - m);
    gl_FragColor = vec4(col, 1.0);
}
