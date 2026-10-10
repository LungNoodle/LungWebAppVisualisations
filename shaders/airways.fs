varying vec3 v_viewPos;
varying vec3 v_normal;
varying float v_field0;
varying float v_field1;
varying float v_field2;

uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform vec3 ambientLightColor;
uniform	vec3 directionalLightColor;
uniform	vec3 directionalLightDirection;
uniform float asthmaSeverity;
uniform float smokingSeverity;

vec3 calculateSpectrumColor(float value) {
	value = 1.0 - value;
	vec3 rgb = vec3(0.0);
	if (value<1.0/3.0) {
		rgb[0]=1.0;
		rgb[2]=0.0;
		if (value<1.0/6.0) {
			rgb[1]=value*4.5;
		} else {
			rgb[1]=0.75+(value-1.0/6.0)*1.5;
		}
	} else if (value<2.0/3.0) {
		rgb[1]=1.0;
		if (value<0.5) {
			rgb[0] = 2.5 - 4.5*value;
			rgb[2] = 1.5*value - 0.5;
		} else {
			rgb[0] = 1.0 - 1.5*value;
			rgb[2] = -2.0 + 4.5*value;
		}
	} else {
		rgb[0]=0.0;
		rgb[2]=1.0;
		if (value<5.0/6.0) {
			rgb[1]=1.0-(value-2.0/3.0)*1.5;
		} else {
			rgb[1]=0.75-(value-5.0/6.0)*4.5;
		}
	}
	return rgb;
}

vec3 calculateColor() {
	float value = v_field0;
	if (asthmaSeverity > 0.0) {
		value = (v_field1 - v_field0) * asthmaSeverity + v_field0;
	} else if (smokingSeverity > 0.0) {
		value = (v_field2 - v_field0) * smokingSeverity * 2.0 + v_field0;
		return mix(calculateSpectrumColor(value), vec3(0.3, 0.3, 0.3), smokingSeverity*(v_field1-v_field0));
	}
	return calculateSpectrumColor(value);
}

void main(void) {
#ifdef ALPHATEST
	if (gl_FragColor.a < ALPHATEST) discard;
#endif

	vec3 normal = normalize(v_normal);
	if (!gl_FrontFacing)
		normal.z = -normal.z;
		
	float specularStrength = 1.0;
	vec3 viewPosition = normalize(v_viewPos);
	vec3 adjustDiffuse = calculateColor();
	vec3 totalDiffuse = vec3(0.0);
	vec3 totalSpecular = vec3(0.0);
#if NUM_DIR_LIGHTS > 0
	vec3 dirDiffuse = vec3(0.0);
	vec3 dirSpecular = vec3(0.0);

	vec4 lDirection = viewMatrix * vec4(directionalLightDirection, 0.0);
	vec3 dirVector = normalize(lDirection.xyz);
	float dotProduct = dot(normal, dirVector);
	#ifdef WRAP_AROUND
		float dirDiffuseWeightFull = max(dotProduct, 0.0);
		float dirDiffuseWeightHalf = max(0.5 * dotProduct + 0.5, 0.0);
		vec3 dirDiffuseWeight = mix(vec3(dirDiffuseWeightFull), vec3(dirDiffuseWeightHalf), wrapRGB);
	#else
		float dirDiffuseWeight = max(dotProduct, 0.0);
	#endif
	dirDiffuse += adjustDiffuse * directionalLightColor * dirDiffuseWeight;
	vec3 dirHalfVector = normalize(dirVector + viewPosition);
	float dirDotNormalHalf = max(dot(normal, dirHalfVector), 0.0);
	float dirSpecularWeight = specularStrength * max(pow(dirDotNormalHalf, shininess), 0.0);
	float specularNormalization = (shininess + 2.0001) / 8.0;
	vec3 schlick = specular + vec3(1.0 - specular) * pow(max(1.0 - dot(dirVector, dirHalfVector), 0.0), 5.0);
	dirSpecular += schlick * directionalLightColor * dirSpecularWeight * dirDiffuseWeight * specularNormalization;
	totalDiffuse += dirDiffuse;
	totalSpecular += dirSpecular;
#endif

	gl_FragColor.xyz = totalDiffuse + totalSpecular + emissive + ambientLightColor * ambient * 0.3;
    gl_FragColor.a = 1.0;
}
