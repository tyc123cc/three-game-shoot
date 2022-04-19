import * as THREE from "three";
import { Texture } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import BaseThree from "@/ts/common/baseThree";

export default class SceneRender extends BaseThree {

  public scene: THREE.Scene | null = null;
  public camera: THREE.PerspectiveCamera | null = null;
  public renderer: THREE.WebGLRenderer | null = null;
  public ambientLight: THREE.AmbientLight | null = null;
  public controls: OrbitControls | null = null;

  /**
   * 是否允许使用control
   */
  private useControls: Boolean

  private container: HTMLElement | Window | null = null;


  start(): void {
    // 第一步新建一个场景
    this.scene = new THREE.Scene();
    this.setCamera();
    this.setRenderer();
    this.setLight();
  }
  update(): void {
    this.render();
    // 设置画布的大小
    if (this.renderer) {
      if (this.container instanceof HTMLElement) {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      }
      else if (this.container instanceof Window) {
        this.renderer.setSize(this.container.innerWidth, this.container.innerHeight)
      }
    }

  }

  /**
   * 
   * @param camera 摄像机
   * @param ambientLight 环境光
   * @param useControls 是否使用control，可以使用鼠标移动摄像机
   * @param elementId 可选，Canvas依附于的dom节点id，若不送则以windows为准
   */
  constructor(camera: THREE.PerspectiveCamera, ambientLight: THREE.AmbientLight, useControls: Boolean, elementId?: string) {
    super()
    let container: HTMLElement | null = elementId ? document.getElementById(elementId) : null
    // 没有找到dom或者未上送dom ID 则以窗口长宽为准
    this.container = container ? container : window;

    this.camera = camera;
    this.ambientLight = ambientLight;
    this.useControls = useControls;
    this.enable();
  }

  // 新建透视相机
  setCamera(): void {

    if (this.scene && this.camera) {
      this.camera.lookAt(this.scene.position)
    }
  }

  // 设置渲染器
  setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer();
    // 设置画布的大小
    if (this.container instanceof HTMLElement) {
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    else if (this.container instanceof Window) {
      this.renderer.setSize(this.container.innerWidth, this.container.innerHeight)
    }
    //这里 其实就是canvas 画布  renderer.domElement
    if (this.container instanceof HTMLElement) {
      this.container.appendChild(this.renderer.domElement);
    }
    else if (this.container instanceof Window) {
      document.body.appendChild(this.renderer.domElement);
    }
    if (this.camera && this.renderer && this.useControls) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      // this.controls.target.set(0, 100, 0);
      this.controls.update();
    }
  }

  // 设置环境光
  setLight(): void {
    if (this.scene) {
      this.ambientLight = new THREE.AmbientLight(0xffffff); // 环境光
      this.scene.add(this.ambientLight);
    }
  }


  // 渲染
  render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

}