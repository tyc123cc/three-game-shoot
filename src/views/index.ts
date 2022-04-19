import * as THREE from "three";
import { Texture } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import BaseThree from "@/ts/common/baseThree";
import SceneRender from "@/ts/scene/sceneRender";

export default class ThreeJs extends BaseThree {
  start(): void {
    // console.log('start')
  }
  update(): void {
    if (this.mesh) {
      this.mesh.rotation.x += 1 * this.deltaTime;
      this.mesh.rotation.y += 1 * this.deltaTime;
    }
  }
  scene: THREE.Scene | null = null;
  camera: THREE.PerspectiveCamera | null = null;
  renderer: THREE.WebGLRenderer | null = null;
  ambientLight: THREE.AmbientLight | null = null;
  mesh: THREE.Mesh | null = null;
  controls: OrbitControls | null = null;

  constructor() {
    super()
    this.init();
    this.enable();

  }

  init(): void {
    // 第一步新建一个场景
    // this.setCamera();
    // this.setRenderer();
    // this.setCube();
    // this.setLight();
    // this.animate();
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    this.camera.position.set(1, 2, 1)
    this.ambientLight = new THREE.AmbientLight(0xffffff); // 环境光
    let sceneRender = new SceneRender(this.camera, this.ambientLight, true, 'threeCanvas')
    //sceneRender.enable();
    this.scene = sceneRender.scene;
    const geometry = new THREE.BoxGeometry(); //创建一个立方体几何对象Geometry
    // const material = new THREE.MeshBasicMaterial({ color: 0xff3200 }); //材质对象Material
    const texture = new THREE.TextureLoader().load(
      require("../assets/logo.png")
    ); //首先，获取到纹理


    const material = new THREE.MeshBasicMaterial({ map: texture }); //然后创建一个phong材质来处理着色，并传递给纹理映射
    this.mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    if (this.scene) {
      this.scene.add(this.mesh); //网格模型添加到场景中
    }
  }

  // 新建透视相机
  setCamera(): void {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    this.camera.position.set(1, 2, 1)
    if (this.scene) {
      this.camera.lookAt(this.scene.position)
    }
  }

  // 设置渲染器
  setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer();
    // 设置画布的大小
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    //这里 其实就是canvas 画布  renderer.domElement
    document.body.appendChild(this.renderer.domElement);

  }

  // 设置环境光
  setLight(): void {
    if (this.scene) {
      this.ambientLight = new THREE.AmbientLight(0xffffff); // 环境光
      this.scene.add(this.ambientLight);
    }
  }

  // 创建网格模型
  setCube(): void {
    if (this.scene) {
      const geometry = new THREE.BoxGeometry(); //创建一个立方体几何对象Geometry
      // const material = new THREE.MeshBasicMaterial({ color: 0xff3200 }); //材质对象Material
      const texture = new THREE.TextureLoader().load(
        require("../assets/logo.png")
      ); //首先，获取到纹理


      const material = new THREE.MeshBasicMaterial({ map: texture }); //然后创建一个phong材质来处理着色，并传递给纹理映射
      this.mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      if (this.scene) {
        this.scene.add(this.mesh); //网格模型添加到场景中
      }
      console.log(texture)

      this.render();
      if (this.camera && this.renderer) {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.target.set(0, 100, 0);
        this.controls.update();
        console.log(this.controls)
      }

    }
  }

  // 渲染
  render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // 动画
  animate(): void {
    if (this.mesh) {
      requestAnimationFrame(this.animate.bind(this));
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y += 0.01;
      this.render();
    }
  }
}