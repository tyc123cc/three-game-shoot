import * as THREE from "three";
import { Camera, SkinnedMesh, Texture, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import BaseThree from "@/ts/common/baseThree";
import SceneRender from "@/ts/scene/sceneRender";
import MapBuilder from "@/ts/gameBuilder/mapBuilder";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import CharacterBuilder from "@/ts/gameBuilder/characterBuilder";
import AnimationInput from "@/ts/apis/animationInput";
import { AniEffectScope } from "@/ts/apis/enum";
import { Heap } from "@/ts/common/heap";

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

    if(this.onLeftKeyDown && this.onUpKeyDown){
     // console.log("左前进")
      this.player?.moveLeftAdvance(10 * this.deltaTime);
      this.player?.character?.play("run")
    }
    else if(this.onRightKeyDown && this.onUpKeyDown){
     // console.log("右前进")
      this.player?.moveRightAdvance(10 * this.deltaTime);
      this.player?.character?.play("run")
    }
    else if(this.onRightKeyDown && this.onDownKeyDown){
     // console.log("右后退")
      this.player?.moveRightBack(5 * this.deltaTime);
      this.player?.character?.play("back")
    }
    else if(this.onLeftKeyDown && this.onDownKeyDown){
     // console.log("左后退")
      this.player?.moveLeftBack(5 * this.deltaTime);
      this.player?.character?.play("back")
    }
    else if(this.onUpKeyDown){
     // console.log("前进")
      this.player?.moveAdvance(10 * this.deltaTime);
      this.player?.character?.play("run")
    }
    else if(this.onDownKeyDown){
     // console.log("后退")
      this.player?.moveBack(5 * this.deltaTime);
      this.player?.character?.play("back")
    }
    else if(this.onLeftKeyDown){
     // console.log("左移")
      this.player?.moveLeft(10 * this.deltaTime);
      this.player?.character?.play("run")
    }
    else if(this.onRightKeyDown){
      //console.log("右移")
      this.player?.moveRight(10 * this.deltaTime);
      this.player?.character?.play("run")
    }
    else{
      this.player?.moveStop();
      this.player?.character?.play("idle");
    }
  }
  sceneRender: SceneRender | null = null;
  camera: THREE.PerspectiveCamera | null = null;
  renderer: THREE.WebGLRenderer | null = null;
  ambientLight: THREE.AmbientLight | null = null;
  mesh: THREE.Mesh | null = null;
  controls: OrbitControls | null = null;
  mixer: THREE.AnimationMixer | null = null
  player: CharacterBuilder | null = null;

  onUpKeyDown:boolean = false;
  onDownKeyDown:boolean = false;
  onLeftKeyDown:boolean = false;
  onRightKeyDown:boolean = false;

  constructor() {
    super()
    this.init();
    this.enable();
    new MapBuilder(require('../assets/map/map01.json'), this.sceneRender as SceneRender);
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
    light.position.set(10, 10, 10)
    this.sceneRender.scene?.add(light)

    const geometry = new THREE.BoxGeometry(); //创建一个立方体几何对象Geometry
    // const material = new THREE.MeshBasicMaterial({ color: 0xff3200 }); //材质对象Material
    const texture = new THREE.TextureLoader().load(
      require("../assets/logo.png")
    ); //首先，获取到纹理

    const material = new THREE.MeshBasicMaterial({ map: texture }); //然后创建一个phong材质来处理着色，并传递给纹理映射
    this.mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    console.log(this.mesh)
    console.log(this.sceneRender)
    if (this.sceneRender.scene) {
      this.sceneRender.scene.add(this.mesh); //网格模型添加到场景中
    }
    let loader = new FBXLoader();
    // var path:string = require("../../public/character/Player.fbx")
    let aniInputs: Array<AnimationInput> = new Array<AnimationInput>()

    aniInputs.push(new AnimationInput("character/animate/Run Forward.fbx", 0, "run", AniEffectScope.Lower, 10, THREE.LoopRepeat))
    aniInputs.push(new AnimationInput("character/animate/hit reaction.fbx", 0, "hit", AniEffectScope.Upper, 20, THREE.LoopOnce))
    aniInputs.push(new AnimationInput("character/animate/rifle aiming idle.fbx", 0, "idle", AniEffectScope.All, 1, THREE.LoopRepeat))
    aniInputs.push(new AnimationInput("character/animate/Walk Backward.fbx", 0, "back", AniEffectScope.Lower, 10, THREE.LoopRepeat))

    let player = new CharacterBuilder("character/Player.fbx", aniInputs, 2, this.sceneRender, (object) => {
      player.character?.group?.position.set(5, 0, 0)
      player.character?.group?.scale.set(0.05, 0.05, 0.05)
      player.character?.play("run")
      // console.log("player", object)
      // console.log("loadedPlayer", player)
      this.player = player;
    })

    document.addEventListener('keydown', (ev) => {
      if (ev.key == 'd') {
       // console.log("按下d")
        this.onRightKeyDown = true;
        // player.moveRight(5 * this.deltaTime)
        // player.character?.play("run")
      }
      if (ev.key == 's') {
        //console.log("按下s")
        this.onDownKeyDown = true;
        // player.character?.play("back")
        // player.moveBack(5 * this.deltaTime)
        //console.log(player)
      }

      if (ev.key == 'w') {
       // console.log("按下w")
        this.onUpKeyDown = true
        // player.character?.play("run")
        // //player.moveTo(new THREE.Vector3(10, 0, 10), 3 * this.deltaTime)
        // player.moveAdvance(5 * this.deltaTime)
        //  console.log(player)
      }


      if (ev.key == 'a') {
        //console.log("按下a")
        this.onLeftKeyDown = true;
        // player.moveLeft(5 * this.deltaTime)
        // player.character?.play("run")
        //  console.log(player)
      }

    })

    document.addEventListener('keyup', (ev) => {
      if (ev.key == 'd') {
        //console.log("松开d")
        this.onRightKeyDown = false;
        // player.moveRight(5 * this.deltaTime)
        // player.character?.play("run")
      }
      if (ev.key == 's') {
        //console.log("松开s")
        this.onDownKeyDown = false;
        // player.character?.play("back")
        // player.moveBack(5 * this.deltaTime)
        //console.log(player)
      }

      if (ev.key == 'w') {
       // console.log("松开w")
        this.onUpKeyDown = false
        // player.character?.play("run")
        // //player.moveTo(new THREE.Vector3(10, 0, 10), 3 * this.deltaTime)
        // player.moveAdvance(5 * this.deltaTime)
        //  console.log(player)
      }


      if (ev.key == 'a') {
       // console.log("松开a")
        this.onLeftKeyDown = false;
        // player.moveLeft(5 * this.deltaTime)
        // player.character?.play("run")
        //  console.log(player)
      }
    })
    //player.character?.group?.scale.set(0.05,0.05,0.05)
    loader.load("character/animate/Run Forward.fbx", (ani2) => {
      loader.load("character/animate/hit reaction.fbx", (ani) => {
        ani.animations[0].tracks.splice(45);
        ani.animations[0].tracks.push(...ani2.animations[0].tracks.splice(45))
        ani.animations[0].tracks[1] = ani2.animations[0].tracks[1]
        //  ani.animations[0].tracks[2] = ani2.animations[0].tracks[2]
        // ani.animations[0].tracks[3] = ani2.animations[0].tracks[3]
        // ani.animations[0].tracks[4] = ani2.animations[0].tracks[4]
        //console.log(ani2.animations[0].tracks.splice(45))
        loader.load("character/Player.fbx", (object) => {
          object.scale.set(0.05, 0.05, 0.05)
          this.sceneRender?.scene?.add(object)
          //从返回对象获得骨骼网格模型
          var SkinnedMesh: THREE.SkinnedMesh = object.children[2] as SkinnedMesh;
          //骨骼网格模型作为 参数创建一个混合器
          this.mixer = new THREE.AnimationMixer(SkinnedMesh);
          // 查看骨骼网格模型的帧动画数据
          // console.log(SkinnedMesh.geometry.animations)
          // 解析跑步状态对应剪辑对象clip中的关键帧数据
          var AnimationAction = this.mixer.clipAction(ani.animations[0]);
          // 解析步行状态对应剪辑对象clip中的关键帧数据
          // var AnimationAction = mixer.clipAction(SkinnedMesh.geometry.animations[3]);
          AnimationAction.play();
        }, (event) => {
        });
      })
    })

    //addEventListener("mousemove", this.onDocumentMouseDown)
  }

  onDocumentMouseDown(event: MouseEvent) {
    // console.log(this.sceneRender?.camera)
    if (this.camera && this.player) {
      var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
      vector = vector.unproject(this.camera as Camera).sub((this.camera as Camera).position).normalize();
      // console.log(vector)
      let intersectPoint = this.CalPlaneLineIntersectPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), vector, this.camera?.position as THREE.Vector3)
      this.player?.lookAt(intersectPoint)
    }


  }

  CalPlaneLineIntersectPoint(planeVector: THREE.Vector3, planePoint: THREE.Vector3, lineVector: THREE.Vector3, linePoint: THREE.Vector3) {
    let returnResult = new THREE.Vector3(0, 0, 0);
    let vpt = lineVector.x * planeVector.x + lineVector.y * planeVector.y + lineVector.z * planeVector.z;
    //首先判断直线是否与平面平行
    if (vpt == 0) {
      return returnResult;
    }
    else {
      let t = ((planePoint.x - linePoint.x) * planeVector.x + (planePoint.y - linePoint.y) * planeVector.y + (planePoint.z - linePoint.z)
        * planeVector.z) / vpt;
      returnResult.x = linePoint.x + lineVector.x * t;
      returnResult.y = linePoint.y + lineVector.y * t;
      returnResult.z = linePoint.z + lineVector.z * t;
    }
    // console.log(returnResult)
    return returnResult;
  }

}