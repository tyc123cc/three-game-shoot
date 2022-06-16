import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import BaseThree from "@/ts/common/baseThree";
import { CubeTexture, Layers, OrthographicCamera, Vector3 } from "three";
import Map from "@/ts/apis/map";
import Confs from "../common/confs/confs";

export default class SceneRender extends BaseThree {
  public scene: THREE.Scene | null = null;
  public camera: THREE.PerspectiveCamera | null = null;
  public renderer: THREE.WebGLRenderer | null = null;
  public ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0x000000);
  public controls: OrbitControls | null = null;
  public collideMeshList: THREE.Object3D[] = [];

  public mapCamera: OrthographicCamera | null = null;
  public mapCameraS = 100; //三维场景显示范围控制系数，系数越大，显示的范围越大
  public mapCameraHeight = 300;

  /**
   * 是否允许使用control
   */
  private useControls: Boolean;

  public container: HTMLElement | Window | null = null;

  private skyboxTexutre:CubeTexture|null = null;

  private resizeEvent = this.onWindowsResize.bind(this);

  start(): void {
    // 第一步新建一个场景
    this.scene = new THREE.Scene();
    this.scene.layers.enableAll();
    this.setRenderer();
    this.setLight();
    window.addEventListener("resize", this.resizeEvent);
  }

  setSkybox() {
    // 天空盒一定需要6张图片
    if(Confs.skyboxPath && Confs.skyboxPath.length == 6){
      let urls = [
        "../" + Confs.skyboxPath[0],
        "../" + Confs.skyboxPath[1],
        "../" + Confs.skyboxPath[2],
        "../" + Confs.skyboxPath[3],
        "../" + Confs.skyboxPath[4],
        "../" + Confs.skyboxPath[5],
      ];
      this.skyboxTexutre = new THREE.CubeTextureLoader().load(urls);
      console.log(this.skyboxTexutre)
      if(this.scene){
        this.scene.background = this.skyboxTexutre; //作为背景贴图
      }
    }
   
  }

  setMapCamera(map: Map) {
    let containerWidth = 0,
      containerHeight = 0;
    if (this.container instanceof HTMLElement) {
      (containerWidth = this.container.clientWidth),
        (containerHeight = this.container.clientHeight);
    } else if (this.container instanceof Window) {
      (containerWidth = this.container.innerWidth),
        (containerHeight = this.container.innerHeight);
    }
    /**
     * 相机设置
     */
    var k = containerWidth / containerHeight; //窗口宽高比

    //创建相机对象
    this.mapCamera = new THREE.OrthographicCamera(
      -map.width / 2,
      map.width / 2,
      map.height / 2,
      -map.height / 2,
      1,
      1000
    );

    this.mapCamera.position.set(0, 300, 0); //设置相机位置
    this.mapCamera.lookAt(this.scene ? this.scene?.position : new Vector3()); //设置相机方向(指向的场景对象)
    //this.mapCamera.layers.disableAll();
    // 使地图摄像机只能看到第2层模型
    this.mapCamera.layers.set(2);

    // 将小地图放到右下角
    this.mapCamera.setViewOffset(
      map.width * 2,
      map.height * 2,
      -containerWidth + map.width * 2 + 40,
      -containerHeight + map.height * 2 + 40,
      containerWidth,
      containerHeight
    );
    this.mapCamera.updateProjectionMatrix();
    this.add(this.mapCamera, false);
  }

  update(): void {
    this.render();
    // 设置画布的大小
    if (this.renderer) {
      if (this.container instanceof HTMLElement) {
        this.renderer.setSize(
          this.container.clientWidth,
          this.container.clientHeight
        );
      } else if (this.container instanceof Window) {
        this.renderer.setSize(
          this.container.innerWidth,
          this.container.innerHeight
        );
      }
    }
  }

  onWindowsResize(e: Event) {
    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      // 更新摄像机世界矩阵
      this.camera.updateProjectionMatrix();
      let containerWidth = 0,
        containerHeight = 0;
      // 设置画布的大小
      if (this.container instanceof HTMLElement) {
        this.renderer?.setSize(
          this.container.clientWidth,
          this.container.clientHeight
        );
        containerWidth = this.container.clientWidth;
        containerHeight = this.container.clientHeight;
      } else if (this.container instanceof Window) {
        this.renderer?.setSize(
          this.container.innerWidth,
          this.container.innerHeight
        );
        containerWidth = this.container.innerWidth;
        containerHeight = this.container.innerHeight;
      }
      let fullWidth = this.mapCamera?.view ? this.mapCamera.view.fullWidth : 0;
      let fullHeight = this.mapCamera?.view
        ? this.mapCamera.view.fullHeight
        : 0;
      // 将小地图放到右下角
      this.mapCamera?.setViewOffset(
        fullWidth,
        fullHeight,
        -containerWidth + fullWidth + 40,
        -containerHeight + fullHeight + 40,
        containerWidth,
        containerHeight
      );
      this.mapCamera?.updateProjectionMatrix();
    }
  }

  /**
   *
   * @param object 将物体添加到scene中
   * @param isCollide 该物体是否具有碰撞体
   */
  add(object: THREE.Object3D, isCollide: boolean = true): void {
    this.scene?.add(object);
    if (isCollide) {
      this.collideMeshList.push(object);
    }
  }

  setCollider(object: THREE.Mesh) {
    object.visible = false;
    this.scene?.add(object);
    this.collideMeshList.push(object);
  }

  /**
   * 移除碰撞体
   * @param collider
   */
  removeCollider(collider: THREE.Mesh | null) {
    if (collider) {
      this.scene?.remove(collider);
      var index = this.collideMeshList.indexOf(collider);
      if (index > -1) {
        // list中删除碰撞体
        this.collideMeshList.splice(index, 1);
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
  constructor(
    camera: THREE.PerspectiveCamera,
    ambientLight: THREE.AmbientLight,
    useControls: Boolean,
    elementId?: string
  ) {
    super();
    let container: HTMLElement | null = elementId
      ? document.getElementById(elementId)
      : null;
    // 没有找到dom或者未上送dom ID 则以窗口长宽为准
    this.container = container ? container : window;
    console.log(elementId);
    this.camera = camera;
    this.ambientLight = ambientLight;
    this.useControls = useControls;
    this.enable();
  }

  // 设置渲染器
  setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({});
    this.renderer.autoClear = false;
    // 设置画布的大小
    if (this.container instanceof HTMLElement) {
      this.renderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight
      );
    } else if (this.container instanceof Window) {
      this.renderer.setSize(
        this.container.innerWidth,
        this.container.innerHeight
      );
    }
    this.renderer.setClearColor(0x000000, 1); //设置背景颜色
    this.renderer.domElement.id = "threeCanvas";
    this.renderer.domElement.className = "threeCanvasRender";
    //这里 其实就是canvas 画布  renderer.domElement
    if (this.container instanceof HTMLElement) {
      this.container.appendChild(this.renderer.domElement);
    } else if (this.container instanceof Window) {
      document.body.appendChild(this.renderer.domElement);
    }
    if (this.camera && this.renderer && this.useControls) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      // this.controls.target.set(0, 100, 0);
      this.controls.update();
    }
    // 设置axesHelper
    // 辅助坐标系  参数250表示坐标系大小，可以根据场景大小去设置
    // var axisHelper = new THREE.AxesHelper(1000);
    // this.scene?.add(axisHelper);
  }

  // 设置环境光
  setLight(): void {
    if (this.scene) {
      this.scene.add(this.ambientLight);
    }
  }

  clear() {
    //super.clear();
    this.scene?.clear();
    if (this.renderer) {
      this.renderer.dispose();
      // this.renderer.forceContextLoss();
      // let gl = this.renderer.domElement.getContext("webgl");
      // if (gl) {
      //   gl.getExtension("WEBGL_lose_context")?.loseContext();
      // }
    }
    this.mapCamera?.clear();
    this.mapCamera = null;
    if(this.skyboxTexutre){
      this.skyboxTexutre.dispose();
      this.skyboxTexutre = null;
    }
    document.removeEventListener("resize", this.resizeEvent);
    this.collideMeshList = [];
  }

  // 渲染
  render(): void {
    if (this.renderer && this.scene && this.camera && this.mapCamera) {
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.renderer.render(this.scene, this.mapCamera);
    }
  }
}
