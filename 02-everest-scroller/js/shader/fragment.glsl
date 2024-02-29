precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_textureFactor;
uniform float u_blackAndWhite;
uniform float u_opacityColor;
varying vec2 vUv;


void main(){
  vec2 textureUV = vec2(vUv.x, vUv.y) * u_textureFactor - u_textureFactor / 2. + 0.5;
  vec4 textureColor = texture2D(u_texture, textureUV );

  vec4 blackAndWhiteTexture = vec4(
      vec3( textureColor.x + textureColor.y + textureColor.z ),
    1.
    );

  vec4 bwColored = mix(blackAndWhiteTexture, vec4(u_opacityColor), .8);

  vec4 color = mix(textureColor, bwColored, u_blackAndWhite);
  gl_FragColor = color;
}