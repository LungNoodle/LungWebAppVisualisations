varying vec3 v_viewPos;
varying vec3 v_normal;
varying vec3 v_texCoord;
varying vec3 v_tarPos;

uniform float t;
uniform float tidalVolumeRatio;

const float cellsDensity = 0.1;
const float tarDensity = 0.0175;

vec3 getPosition(vec3 pos)  {
    float scale = tidalVolumeRatio * t;

    float fixed_x = 0.0;
    float fixed_y = 80.0;
    float fixed_z = 150.0;

    pos.x = fixed_x + (pos.x - fixed_x) * (1.0 + scale*0.5);
    pos.y = fixed_y + (pos.y - fixed_y) * (1.0 + scale);
    pos.z = fixed_z + (pos.z - fixed_z) * (1.0 + scale*1.2);
    return pos;
}

void main(void) {
	v_viewPos = -(modelViewMatrix * vec4(position, 1.0)).xyz;

	vec3 n = normal;
#ifdef FLIP_SIDED
	n = -n;
#endif
	v_normal = normalize(normalMatrix * n);

	v_texCoord = position.xyz * cellsDensity;
	v_tarPos = position.xyz * tarDensity;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(getPosition(position), 1.0);
}
