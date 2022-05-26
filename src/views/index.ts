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
import EnemyBuilder from "@/ts/gameBuilder/enemyBuilder";
import Confs from "@/ts/common/confs/confs";
import ConfsVar from "@/ts/common/confs/confsVar";

export default class ThreeJs extends BaseThree {
  start(): void {
    // console.log('start')
  }
  update(): void { }
  sceneRender: SceneRender | null = null;
  camera: THREE.PerspectiveCamera | null = null;
  renderer: THREE.WebGLRenderer | null = null;
  ambientLight: THREE.AmbientLight | null = null;
  mesh: THREE.Mesh | null = null;
  controls: OrbitControls | null = null;
  mixer: THREE.AnimationMixer | null = null;
  player: CharacterBuilder | null = null;
  enemy: CharacterBuilder | null = null;
  mapBuilder: MapBuilder | null = null;

  onUpKeyDown: boolean = false;
  onDownKeyDown: boolean = false;
  onLeftKeyDown: boolean = false;
  onRightKeyDown: boolean = false;

  mousePoint: THREE.Vector2 = new THREE.Vector2();

  characterHpInfoMap: Map<string, CharacterHpInfo> = new Map();

  characterHpInfos: CharacterHpInfo[] = [];

  bulletPool: bulletBufferPool | null = null;

  playerBuilder: PlayerBuilder | null = null;

  enemyBuilders: EnemyBuilder[] = [];

  constructor() {
    super();
    this.init();
    this.enable();
  }

  init(): void {

    // 设置配置值
    let confsVar: ConfsVar = require("../assets/confs/confs.json");
    Confs.setting(confsVar);

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

    // 创建地图
    this.mapBuilder = new MapBuilder(
      require("../assets/map/map01.json"),
      this.sceneRender
    );


    // 初始化摄像机位置
    this.camera.position.set(
      this.mapBuilder.playerInitPos.x + Confs.cameraOffsetPos.x,
      this.mapBuilder.playerInitPos.y + Confs.cameraOffsetPos.y,
      this.mapBuilder.playerInitPos.z + Confs.cameraOffsetPos.z
    );

    this.bulletPool = new bulletBufferPool(
      10,
      Confs.bulletSize,
      "red",
      10,
      this.sceneRender
    );

    this.playerBuilder = new PlayerBuilder(
      this.sceneRender,
      this.camera,
      this.bulletPool,
      this.mapBuilder.playerInitPos
    );
    if (this.playerBuilder.characterHpInfo) {
      this.characterHpInfos.push(this.playerBuilder.characterHpInfo);
    }

    for (let enemy of this.mapBuilder.Enemies) {
      this.enemyBuilders.push(
        new EnemyBuilder(
          enemy.name,
          this.sceneRender,
          this.camera,
          this.bulletPool,
          this.mapBuilder,
          new THREE.Vector3(enemy.initPos.x, 0, enemy.initPos.y)
        )
      );
    }

    this.enemyBuilders.forEach((enemy) => {
      if (enemy.characterHpInfo) {
        this.characterHpInfos.push(enemy.characterHpInfo);
      }
    });
  }
}
