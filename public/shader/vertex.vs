// varying关键字声明一个变量表示顶点纹理坐标插值后的结果
varying vec2 vUv;

varying vec3 mPosition;
void main(){
  // 顶点纹理坐标uv数据进行插值计算
  vUv = uv;
  mPosition = position;
  // 投影矩阵projectionMatrix、视图矩阵viewMatrix、模型矩阵modelMatrix
  gl_Position = projectionMatrix*viewMatrix*modelMatrix*vec4( position, 1.0 );
}