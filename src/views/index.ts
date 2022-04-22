import * as THREE from "three";
import { SkinnedMesh, Texture } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import BaseThree from "@/ts/common/baseThree";
import SceneRender from "@/ts/scene/sceneRender";
import MapBuilder from "@/ts/gameBuilder/mapBuilder";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export default class ThreeJs extends BaseThree {
  start(): void {
    // console.log('start')
  }
  update(): void {
    if (this.mixer !== null) {
      //clock.getDelta()方法获得两帧的时间间隔
      // 更新混合器相关的时间
      this.mixer.update(this.deltaTime);
    }
  }
  sceneRender:SceneRender|null = null;
  camera: THREE.PerspectiveCamera | null = null;
  renderer: THREE.WebGLRenderer | null = null;
  ambientLight: THREE.AmbientLight | null = null;
  mesh: THREE.Mesh | null = null;
  controls: OrbitControls | null = null;
   mixer :THREE.AnimationMixer|null = null

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
    let loader = new FBXLoader();
    // var path:string = require("../../public/character/Player.fbx")
    loader.load("character/animate/Run Forward.fbx",(ani2)=>{
      console.log("ani2",ani2)
    loader.load("character/animate/hit reaction.fbx",(ani)=>{
     ani.animations[0].tracks.splice(45);
     ani.animations[0].tracks.push(...ani2.animations[0].tracks.splice(45))
     ani.animations[0].tracks[1] = ani2.animations[0].tracks[1]
    //  ani.animations[0].tracks[2] = ani2.animations[0].tracks[2]
    // ani.animations[0].tracks[3] = ani2.animations[0].tracks[3]
    // ani.animations[0].tracks[4] = ani2.animations[0].tracks[4]
    //console.log(ani2.animations[0].tracks.splice(45))
      loader.load("character/Player.fbx", (object) =>{
        console.log(object)
          object.scale.set(0.05,0.05,0.05)
          object.position.set(1,0,0)
        this.sceneRender?.scene?.add(object)
        //从返回对象获得骨骼网格模型
    var SkinnedMesh:THREE.SkinnedMesh = object.children[2] as SkinnedMesh;
    //骨骼网格模型作为 参数创建一个混合器
    this.mixer = new THREE.AnimationMixer(SkinnedMesh);
    // 查看骨骼网格模型的帧动画数据
    // console.log(SkinnedMesh.geometry.animations)
    // 解析跑步状态对应剪辑对象clip中的关键帧数据
    console.log("ani", ani.animations[0])
    var AnimationAction = this.mixer.clipAction(ani.animations[0]);
    // 解析步行状态对应剪辑对象clip中的关键帧数据
    // var AnimationAction = mixer.clipAction(SkinnedMesh.geometry.animations[3]);
    AnimationAction.play();
      },(event)=>{
        console.log("总共:" + event.loaded + "，已加载：" + event.total)
      });
    })
  })
  }
  
}