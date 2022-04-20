import * as THREE from "three";
import { Texture } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import BaseThree from "@/ts/common/baseThree";
import SceneRender from "@/ts/scene/sceneRender";
import MapBuilder from "@/ts/gameBuilder/mapBuilder";

export default class ThreeJs extends BaseThree {
  start(): void {
    // console.log('start')
  }
  update(): void {
    if (this.mesh) {
      // this.mesh.rotation.x += 1 * this.deltaTime;
      // this.mesh.rotation.y += 1 * this.deltaTime;
    }
  }
  sceneRender:SceneRender|null = null;
  camera: THREE.PerspectiveCamera | null = null;
  renderer: THREE.WebGLRenderer | null = null;
  ambientLight: THREE.AmbientLight | null = null;
  mesh: THREE.Mesh | null = null;
  controls: OrbitControls | null = null;

  constructor() {
    super()
    this.init();
    this.enable();
    new MapBuilder(require('../assets/map/map01.json'),this.sceneRender as SceneRender);
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
    this.camera.position.set(11, 28, 37.5)
    this.ambientLight = new THREE.AmbientLight(0xaaaaaa); // 环境光
    this.sceneRender = new SceneRender(this.camera, this.ambientLight, true, 'threeCanvas')
    let light = new THREE.DirectionalLight(0xffffff)
    light.position.set(10,10,10)
    this.sceneRender.scene?.add(light)

    const geometry = new THREE.BoxGeometry(); //创建一个立方体几何对象Geometry
    // const material = new THREE.MeshBasicMaterial({ color: 0xff3200 }); //材质对象Material
    const texture = new THREE.TextureLoader().load(
      require("../assets/logo.png")
    ); //首先，获取到纹理

    const material = new THREE.MeshBasicMaterial({ map: texture }); //然后创建一个phong材质来处理着色，并传递给纹理映射
    this.mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    console.log(this.sceneRender)
    if (this.sceneRender.scene) {
      this.sceneRender.scene.add(this.mesh); //网格模型添加到场景中
    }
  }
  
}