import * as THREE from "three";
import {
  BoxBufferGeometry,
  Camera,
  SkinnedMesh,
  Texture,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import BaseThree from "@/ts/common/baseThree";
import SceneRender from "@/ts/scene/sceneRender";
import MapBuilder from "@/ts/gameBuilder/mapBuilder";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import CharacterBuilder from "@/ts/gameBuilder/characterBuilder";
import AnimationInput from "@/ts/apis/animationInput";
import { AniEffectScope } from "@/ts/apis/enum";
import { Heap } from "@/ts/common/heap";
import Bullet from "@/ts/bullet/bullet";
import Character from "@/ts/apis/character";
import bulletBufferPool from "@/ts/bullet/bulletBufferPool";
import CharacterHpInfo from "@/ts/apis/characterHpInfo";
import PlayerBuilder from "@/ts/gameBuilder/playerBuilder";

export default class ThreeJs extends BaseThree {
  start(): void {
    // console.log('start')
  }
  update(): void {
    // if (this.mixer !== null) {
    //   //clock.getDelta()方法获得两帧的时间间隔
    //   // 更新混合器相关的时间
    //   this.mixer.update(this.deltaTime);
    // }

    if (this.camera && this.player) {
      var vector = new THREE.Vector3(
        (this.mousePoint.x / window.innerWidth) * 2 - 1,
        -(this.mousePoint.y / window.innerHeight) * 2 + 1,
        0.5
      );
      vector = vector
        .unproject(this.camera as Camera)
        .sub((this.camera as Camera).position)
        .normalize();
      // console.log(vector)
      let intersectPoint = this.CalPlaneLineIntersectPoint(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        vector,
        this.camera?.position as THREE.Vector3
      );
      intersectPoint.y = 0;
      // console.log(intersectPoint)
      this.player?.lookAt(intersectPoint);
    }

    if (this.onLeftKeyDown && this.onUpKeyDown) {
      //console.log("左前进")
      //this.player?.moveLeftAdvance(10 * this.deltaTime);
      //this.player?.character?.play("run")
      let angle = this.getIncludeAngle(new Vector3(-1, 0, -1));
      let speed = this.playAnimation(angle);
      this.player?.moveLeftAdvance(speed);
    } else if (this.onRightKeyDown && this.onUpKeyDown) {
      // console.log("右前进")
      // this.player?.moveRightAdvance(10 * this.deltaTime);
      // this.player?.character?.play("run")
      let angle = this.getIncludeAngle(new Vector3(1, 0, -1));
      let speed = this.playAnimation(angle);
      this.player?.moveRightAdvance(speed);
    } else if (this.onRightKeyDown && this.onDownKeyDown) {
      // console.log("右后退")
      // this.player?.moveRightBack(5 * this.deltaTime);
      // this.player?.character?.play("back")
      let angle = this.getIncludeAngle(new Vector3(1, 0, 1));
      let speed = this.playAnimation(angle);
      this.player?.moveRightBack(speed);
    } else if (this.onLeftKeyDown && this.onDownKeyDown) {
      // console.log("左后退")
      // this.player?.moveLeftBack(5 * this.deltaTime);
      // this.player?.character?.play("back")
      let angle = this.getIncludeAngle(new Vector3(-1, 0, 1));
      let speed = this.playAnimation(angle);
      this.player?.moveLeftBack(speed);
    } else if (this.onUpKeyDown) {
      // console.log("前进")
      let angle = this.getIncludeAngle(new Vector3(0, 0, -1));
      let speed = this.playAnimation(angle);
      this.player?.moveAdvance(speed);
    } else if (this.onDownKeyDown) {
      // console.log("后退")
      // this.player?.moveBack(5 * this.deltaTime);
      // this.player?.character?.play("back")
      let angle = this.getIncludeAngle(new Vector3(0, 0, 1));
      let speed = this.playAnimation(angle);
      this.player?.moveBack(speed);
    } else if (this.onLeftKeyDown) {
      //console.log("左移")
      // this.player?.moveLeft(10 * this.deltaTime);
      // this.player?.character?.play("run")
      let angle = this.getIncludeAngle(new Vector3(-1, 0, 0));
      let speed = this.playAnimation(angle);
      this.player?.moveLeft(speed);
    } else if (this.onRightKeyDown) {
      //console.log("右移")
      // this.player?.moveRight(10 * this.deltaTime);
      // this.player?.character?.play("run")
      let angle = this.getIncludeAngle(new Vector3(1, 0, 0));
      let speed = this.playAnimation(angle);
      this.player?.moveRight(speed);
    } else {
      this.player?.moveStop();
      this.player?.character?.play("idle");
    }
    if (this.player?.character?.group) {
      this.camera?.position.set(
        this.player.character.group.position.x,
        this.player.character.group.position.y + 28,
        this.player.character.group.position.z + 37.5
      );
      this.camera?.lookAt(this.player.character.group.position);
    }
    if (this.player && this.enemy) {
      this.updateCharacterHPInfo(this.player.character as Character)
      this.updateCharacterHPInfo(this.enemy.character as Character)
    }

    // this.characterHpInfos.splice(0);
    // this.characterHpInfoMap.forEach((value, key, map) => {
    //   this.characterHpInfos.push(value);
    // });

    if (this.enemy?.character && this.enemy.character.hp <= 0) {
      this.enemy.character.play("dying")
    }

    if(this.playerBuilder){
      
    }
  }
  sceneRender: SceneRender | null = null;
  camera: THREE.PerspectiveCamera | null = null;
  renderer: THREE.WebGLRenderer | null = null;
  ambientLight: THREE.AmbientLight | null = null;
  mesh: THREE.Mesh | null = null;
  controls: OrbitControls | null = null;
  mixer: THREE.AnimationMixer | null = null;
  player: CharacterBuilder | null = null;
  enemy: CharacterBuilder | null = null;

  onUpKeyDown: boolean = false;
  onDownKeyDown: boolean = false;
  onLeftKeyDown: boolean = false;
  onRightKeyDown: boolean = false;

  mousePoint: THREE.Vector2 = new THREE.Vector2();

  characterHpInfoMap: Map<string, CharacterHpInfo> = new Map();

  characterHpInfos: CharacterHpInfo[] = [];

  bulletPool: bulletBufferPool | null = null;

  playerBuilder:PlayerBuilder|null = null;

  constructor() {
    super();
    this.init();
    this.enable();
    new MapBuilder(
      require("../assets/map/map01.json"),
      this.sceneRender as SceneRender
    );
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
    this.camera.position.set(0, 28, 37.5);
    this.camera.lookAt(0, 0, 0);
    this.ambientLight = new THREE.AmbientLight(0xaaaaaa); // 环境光
    this.sceneRender = new SceneRender(
      this.camera,
      this.ambientLight,
      false,
      "threeCanvas"
    );
    let light = new THREE.DirectionalLight(0xffffff);
    light.position.set(10, 10, 10);
    this.sceneRender.scene?.add(light);

    const geometry = new THREE.BoxGeometry(); //创建一个立方体几何对象Geometry
    // const material = new THREE.MeshBasicMaterial({ color: 0xff3200 }); //材质对象Material
    const texture = new THREE.TextureLoader().load(
      require("../assets/logo.png")
    ); //首先，获取到纹理

    const material = new THREE.MeshBasicMaterial({ map: texture }); //然后创建一个phong材质来处理着色，并传递给纹理映射
    this.mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    console.log(this.mesh);
    console.log(this.sceneRender);
    if (this.sceneRender.scene) {
      this.sceneRender.scene.add(this.mesh); //网格模型添加到场景中
    }
    let loader = new FBXLoader();
    // var path:string = require("../../public/character/Player.fbx")
    let aniInputs: Array<AnimationInput> = new Array<AnimationInput>();

    aniInputs.push(
      new AnimationInput(
        "character/animate/Run Forward.fbx",
        0,
        "run",
        AniEffectScope.Lower,
        10,
        THREE.LoopRepeat
      )
    );
    aniInputs.push(
      new AnimationInput(
        "character/animate/hit reaction.fbx",
        0,
        "hit",
        AniEffectScope.Upper,
        20,
        THREE.LoopOnce
      )
    );
    aniInputs.push(
      new AnimationInput(
        "character/animate/rifle aiming idle.fbx",
        0,
        "idle",
        AniEffectScope.All,
        1,
        THREE.LoopRepeat
      )
    );
    aniInputs.push(
      new AnimationInput(
        "character/animate/Walk Backward.fbx",
        0,
        "back",
        AniEffectScope.Lower,
        10,
        THREE.LoopRepeat
      )
    );
    aniInputs.push(
      new AnimationInput(
        "character/animate/Dying.fbx",
        0,
        "dying",
        AniEffectScope.Death,
        100,
        THREE.LoopOnce
      )
    );

    // let player = new CharacterBuilder(
    //   "character/Player.fbx",
    //   "player",
    //   aniInputs,
    //   2,
    //   this.sceneRender,
    //   (object) => {
    //     player.character?.group?.position.set(0, 0, 0);
    //     player.character?.group?.scale.set(0.05, 0.05, 0.05);
    //     player.character?.play("idle");
    //     // console.log("player", object)
    //     // console.log("loadedPlayer", player)
    //     let mesh = new THREE.Mesh(
    //       new THREE.BoxGeometry(4, 20, 4),
    //       new THREE.MeshLambertMaterial()
    //     );
    //     mesh.position.y = 10;
    //     player.addCollider(mesh);
    //     this.player = player;
    //     this.characterHpInfoMap.set(
    //       this.player.name,
    //       new CharacterHpInfo(this.player.name)
    //     );
    //   }
    // );
    this.playerBuilder = new PlayerBuilder(this.sceneRender,this.camera);
    if(this.playerBuilder.characterHpInfo){
      this.characterHpInfos.push(this.playerBuilder.characterHpInfo)
    }
    
    document.addEventListener("keydown", (ev) => {
      if (ev.key == "d") {
        // console.log("按下d")
        this.onRightKeyDown = true;
        // player.moveRight(5 * this.deltaTime)
        // player.character?.play("run")
      }
      if (ev.key == "s") {
        //console.log("按下s")
        this.onDownKeyDown = true;
        // player.character?.play("back")
        // player.moveBack(5 * this.deltaTime)
        //console.log(player)
      }

      if (ev.key == "w") {
        // console.log("按下w")
        this.onUpKeyDown = true;
        // player.character?.play("run")
        // //player.moveTo(new THREE.Vector3(10, 0, 10), 3 * this.deltaTime)
        // player.moveAdvance(5 * this.deltaTime)
        //  console.log(player)
      }

      if (ev.key == "a") {
        //console.log("按下a")
        this.onLeftKeyDown = true;
        // player.moveLeft(5 * this.deltaTime)
        // player.character?.play("run")
        //  console.log(player)
      }
    });

    document.addEventListener("keyup", (ev) => {
      if (ev.key == "d") {
        //console.log("松开d")
        this.onRightKeyDown = false;
        // player.moveRight(5 * this.deltaTime)
        // player.character?.play("run")
      }
      if (ev.key == "s") {
        //console.log("松开s")
        this.onDownKeyDown = false;
        // player.character?.play("back")
        // player.moveBack(5 * this.deltaTime)
        //console.log(player)
      }

      if (ev.key == "w") {
        // console.log("松开w")
        this.onUpKeyDown = false;
        // player.character?.play("run")
        // //player.moveTo(new THREE.Vector3(10, 0, 10), 3 * this.deltaTime)
        // player.moveAdvance(5 * this.deltaTime)
        //  console.log(player)
      }

      if (ev.key == "a") {
        // console.log("松开a")
        this.onLeftKeyDown = false;
        // player.moveLeft(5 * this.deltaTime)
        // player.character?.play("run")
        //  console.log(player)
      }
    });

    this.bulletPool = new bulletBufferPool(
      10,
      0.4,
      "red",
      10,
      this.sceneRender
    );

    document.addEventListener("click", (ev) => {
      if (this.player?.character?.group && this.sceneRender) {
        // 点击鼠标发射子弹
        this.player?.character?.play("hit");
        // 调整子弹初始位置，使子弹往人物前方移一点 公式：人物位置+人物面朝方向向量*偏移值
        let initPos = this.player?.character?.group?.position
          .clone()
          .add(
            this.player.character.lookPoint
              .clone()
              .sub(this.player.character.group.position)
              .normalize()
              .multiplyScalar(2)
          );
        this.bulletPool?.fire(
          initPos,
          this.player.character.lookPoint
            .clone()
            .sub(this.player.character.group.position),
          5
        );
      }
    });

    document.addEventListener("mousemove", (ev) => {
      this.mousePoint.set(ev.clientX, ev.clientY);
    });
    //player.character?.group?.scale.set(0.05,0.05,0.05)
    let enemy = new CharacterBuilder(
      "character/Player.fbx",
      "enemy",
      aniInputs,
      2,
      this.sceneRender,
      (object) => {
        enemy.character?.group?.position.set(-5, 0, 0);
        enemy.character?.group?.scale.set(0.05, 0.05, 0.05);
        enemy.character?.play("idle");
        // console.log("player", object)
        // console.log("loadedPlayer", player)
        let mesh = new THREE.Mesh(
          new THREE.BoxGeometry(4, 20, 4),
          new THREE.MeshLambertMaterial()
        );
        mesh.position.y = 10;
        enemy.addCollider(mesh);
        this.enemy = enemy;
        this.characterHpInfoMap.set(
          this.enemy.name,
          new CharacterHpInfo(this.enemy.name)
        );
      }
    );

    //addEventListener("mousemove", this.onDocumentMouseDown)
  }

  updateCharacterHPInfo(character: Character) {
    if (character.group && this.camera && this.sceneRender) {
      let screenPos = this.createVector(
        character.group.position,
        this.camera,
        this.sceneRender
      );
      let HpInfo = this.characterHpInfoMap.get(character.name);
      if (HpInfo) {
        HpInfo.screenPos = screenPos;
        let tempV = character.group.position
          .clone()
          .applyMatrix4(this.camera.matrixWorldInverse)
          .applyMatrix4(this.camera.projectionMatrix);

        if (
          Math.abs(tempV.x) > 1 ||
          Math.abs(tempV.y) > 1 ||
          Math.abs(tempV.z) > 1
        ) {
          // 在视野外了
          HpInfo.isShow = false;
        } else {
          // 在视野内
          HpInfo.isShow = true;
        }
        // 更新hp
        HpInfo.hp = character.hp;
      }
    }
  }

  onDocumentMouseDown(event: MouseEvent) {
    // console.log(this.sceneRender?.camera)
    if (this.camera && this.player) {
      // var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
      // vector = vector.unproject(this.camera as Camera).sub((this.camera as Camera).position).normalize();
      // // console.log(vector)
      // let intersectPoint = this.CalPlaneLineIntersectPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), vector, this.camera?.position as THREE.Vector3)
      // this.player?.lookAt(intersectPoint)

      this.mousePoint.set(event.clientX, event.clientY);
    }
  }

  CalPlaneLineIntersectPoint(
    planeVector: THREE.Vector3,
    planePoint: THREE.Vector3,
    lineVector: THREE.Vector3,
    linePoint: THREE.Vector3
  ) {
    let returnResult = new THREE.Vector3(0, 0, 0);
    let vpt =
      lineVector.x * planeVector.x +
      lineVector.y * planeVector.y +
      lineVector.z * planeVector.z;
    //首先判断直线是否与平面平行
    if (vpt == 0) {
      return returnResult;
    } else {
      let t =
        ((planePoint.x - linePoint.x) * planeVector.x +
          (planePoint.y - linePoint.y) * planeVector.y +
          (planePoint.z - linePoint.z) * planeVector.z) /
        vpt;
      returnResult.x = linePoint.x + lineVector.x * t;
      returnResult.y = linePoint.y + lineVector.y * t;
      returnResult.z = linePoint.z + lineVector.z * t;
    }
    // console.log(returnResult)
    return returnResult;
  }

  getIncludeAngle(vec: THREE.Vector3): number {
    if (this.player && this.player.character && this.player.character.group) {
      let vec1 = vec;
      vec1.y = 0;
      let vec2 = this.player.character.lookPoint
        .clone()
        .sub(this.player.character.group.position);
      vec2.y = 0;
      let angle = vec1.angleTo(vec2);
      // if (vec1.cross(vec2).y < 0) {
      //   angle = -angle
      // }
      return (angle / Math.PI) * 180;
    }
    return 0;
  }

  playAnimation(angle: number): number {
    if (this.player && this.player.character && this.player.character.group) {
      if (angle <= 90) {
        this.player.character.play("run");
        return 10 * this.deltaTime;
      } else {
        this.player.character.play("back");
        return 5 * this.deltaTime;
      }
    }

    return 0;
  }

  createVector(
    vec: THREE.Vector3,
    camera: THREE.Camera,
    sceneRender: SceneRender
  ) {
    var p = vec.clone();
    p.y += 5.2;
    p.x -= 3.6;
    var vector = p.project(camera);
    let container = sceneRender.container as HTMLElement;
    // vector.x = (vector.x + 1) / 2 * window.innerWidth + (vec.x - camera.position.x) * 0.6 - 70;
    // vector.y = -(vector.y - 1) / 2 * window.innerHeight - (vec.z - camera.position.z) * 1 - 120;
    vector.x =
      ((vector.x + 1) / 2) * window.innerWidth +
      (vec.x + 11 - camera.position.x) * 0;
    vector.y =
      (-(vector.y - 1) / 2) * window.innerHeight -
      (vec.z + 37.5 - camera.position.z) * 1.1;
    return new THREE.Vector2(vector.x, vector.y);
  }
}
