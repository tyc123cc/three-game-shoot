import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import BaseThree from "@/ts/common/baseThree";
import { Color, CubeTexture, Layers, OrthographicCamera, Vector3 } from "three";
import Map from "@/ts/apis/map";
import Confs from "../common/confs/confs";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import {
  ClearMaskPass,
  MaskPass,
} from "three/examples/jsm/postprocessing/MaskPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";

import Shaders from "../common/confs/shaders";

export default class SceneRender extends BaseThree {
  public scene: THREE.Scene | null = null;
  public camera: THREE.PerspectiveCamera | null = null;
  public renderer: THREE.WebGLRenderer | null = null;
  public ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0x000000);
  public controls: OrbitControls | null = null;
  public collideMeshList: THREE.Object3D[] = [];
  public composer: EffectComposer | null = null;
  public composerMap: EffectComposer | null = null;
  public renderPass: RenderPass | null = null;
  public deathShader:ShaderPass|null = null;

  public mapCamera: OrthographicCamera | null = null;
  public mapCameraS = 100; //三维场景显示范围控制系数，系数越大，显示的范围越大
  public mapCameraHeight = 300;

  /**
   * 是否允许使用control
   */
  private useControls: Boolean;

  public container: HTMLElement | Window | null = null;

  private skyboxTexutre: CubeTexture | null = null;

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
    if (this.skyboxTexutre) {
      // 先释放之前的天空盒纹理
      this.skyboxTexutre.dispose();
      this.skyboxTexutre = null;
    }
    // 天空盒一定需要6张图片
    if (Confs.skyboxPath && Confs.skyboxPath.length == 6) {
      let urls = [
        /**右边 */
        "../" + Confs.skyboxPath[0],
        /**左边 */
        "../" + Confs.skyboxPath[1],
        /**上面 */
        "../" + Confs.skyboxPath[2],
        /**下面 */
        "../" + Confs.skyboxPath[3],
        /**前面 */
        "../" + Confs.skyboxPath[4],
        /**后面 */
        "../" + Confs.skyboxPath[5],
      ];
      this.skyboxTexutre = new THREE.CubeTextureLoader().load(urls);
      if (this.scene) {
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
    if (this.scene && this.renderer && this.camera) {
      // 设置混合器，后处理需要

      Shaders.Death_Shader().then((shader) => {
        if (this.scene && this.mapCamera && this.camera) {
          
          // 初始化shader
          shader.uniforms.mapSize.value = new THREE.Vector2(map.width * 2,map.height * 2);
          shader.uniforms.mapOffsetSize.value = new THREE.Vector2(40,40);
          shader.uniforms.screenSize.value = new THREE.Vector2(containerWidth,containerHeight)

          // 主场景pass
          this.renderPass = new RenderPass(this.scene, this.camera);
          // 作为背景的RenderPass clear必须为true
          this.renderPass.clear = true;
          this.renderPass.renderToScreen = true;
          // 主场景遮罩
          let mask = new MaskPass(this.scene, this.camera);
          // 小地图的遮罩
          let maskMap = new MaskPass(this.scene, this.mapCamera);
          // 小地图的RenderPass
          let renderPassMap = new RenderPass(this.scene, this.mapCamera);
          // 最终渲染效果的pass
          let effectCopy = new ShaderPass(CopyShader);
          effectCopy.renderToScreen = true;
          // 作为前置的场景pass clear必须为false
          renderPassMap.clear = false;
          renderPassMap.renderToScreen = true;

          this.deathShader = new ShaderPass(shader);
 
          // 主场景作为背景
          this.composer?.addPass(this.renderPass);
          // 主场景遮罩
          this.composer?.addPass(mask);
          // this.composer?.addPass(new FilmPass());
          // 地图renderPass
          this.composer?.addPass(renderPassMap);
          // 地图遮罩
          this.composer?.addPass(maskMap);
           //this.composer?.addPass(new FilmPass());
           this.composer?.addPass(new ClearMaskPass());
          // // 获得主场景和地图场景的混合效果
           this.composer?.addPass(effectCopy);   
          this.composer?.addPass(this.deathShader)
            
        }
      });

    }
  }


  /**
   * 将场景渲染为黑白或彩色场景
   * @param isBlackAndWhite 是否渲染为黑白场景
   */
  public renderToBlackAndWhite(isBlackAndWhite:boolean){
    if(this.deathShader){
      // 修改shader变量
      this.deathShader.uniforms["death"].value = isBlackAndWhite;
    }
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
      if(this.deathShader){
        this.deathShader.uniforms["screenSize"].value= new THREE.Vector2(containerWidth,containerHeight);
      }
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
    if (this.scene && this.camera) {
      // 设置混合器，后处理需要
      this.composer = new EffectComposer(this.renderer);

      this.composer.renderToScreen = true;
      this.composer.renderTarget1.stencilBuffer = true;
      this.composer.renderTarget2.stencilBuffer = true;

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
    if (this.skyboxTexutre) {
      this.skyboxTexutre.dispose();
      this.skyboxTexutre = null;
    }
    document.removeEventListener("resize", this.resizeEvent);
    this.collideMeshList = [];
    // 清空pass
    if(this.composer){
      this.composer.passes = [];
    }
  }

  // 渲染
  render(): void {
    if (this.renderer && this.scene && this.camera && this.mapCamera) {
      //this.renderer.autoClear = false;
      //this.renderer.clear();
      //this.composerMap?.render();
      //this.mapCamera.visible = false;

      this.composer?.render(this.deltaTime);

      //this.mapCamera.visible = true;
      //this.composerMap?.render();

      //this.renderer.render(this.scene, this.camera);
      // this.renderer.render(this.scene, this.mapCamera);
    }
  }
}
