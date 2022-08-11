import axios from "axios";
import * as THREE from "three";

export default class Shaders {
  public static async Death_Shader() {
    const vertex: string = (await axios.get("../shader/vertex.vs")).data;

    const fragment: string = (await axios.get("../shader/fragment.fs")).data;
    return {
      uniforms: {
        tDiffuse: {
          // 加载纹理贴图返回Texture对象作为texture的值
          // Texture对象对应着色器中sampler2D数据类型变量
          value: null,
        },
        mapSize: {
          value: new THREE.Vector2(200, 100),
        },
        mapOffsetSize: {
          value: new THREE.Vector2(80, 80),
        },
        screenSize: {
          value: new THREE.Vector2(994, 714),
        },
        death: {
          // 是否死亡标志，为true时显示黑白图像
          value: false,
        },
      },

      // 0.2126 R + 0.7152 G + 0.0722 B
      // vertexshader is always the same for postprocessing steps
      vertexShader: vertex,

      fragmentShader: fragment,
    };
  }
}
