import * as THREE from "three";
import store from "@/store";
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
import ThreeMath from "@/ts/tool/threeMath";
import Item from "@/ts/item/item";
import ItemBufferPoll from "@/ts/item/itemBufferPool";

export default class ThreeJs extends BaseThree {
  start(): void {
    // console.log('start')
  }
  update(): void { }

  /**
   * 关卡序号
   */
  levelIndex: number = 0;

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

  playerBuilder: PlayerBuilder | null = null;

  enemyBuilders: EnemyBuilder[] = [];

  itemBufferPool: ItemBufferPoll | null = null;

  constructor(index: number) {
    super();
    this.levelIndex = index;
    this.init();
    this.enable();
  }

  init(): void {

    if (!Confs.levelFiles) {
      // 设置配置值
      let confsVar: ConfsVar = require("../assets/confs/confs.json");
      Confs.setting(confsVar);
    }
    // 传递的关卡序号有误
    if (this.levelIndex < 0 || this.levelIndex >= Confs.levelFiles.length) {
      return;
    }
    let mapName = Confs.levelFiles[this.levelIndex];

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
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
      require("../assets/map/" + mapName + ".json"),
      this.sceneRender
    );

    // 初始化游戏进度
    store.commit(Confs.STORE_RESETPROCESS, {
      targetProcess: this.mapBuilder.map.targetProcess,
      maxLife: this.mapBuilder.map.life,
    });

    // 初始化摄像机位置
    this.camera.position.set(
      this.mapBuilder.playerInitPos.x + Confs.cameraOffsetPos.x,
      this.mapBuilder.playerInitPos.y + Confs.cameraOffsetPos.y,
      this.mapBuilder.playerInitPos.z + Confs.cameraOffsetPos.z
    );
    this.camera.lookAt(
      this.mapBuilder.playerInitPos.x,
      this.mapBuilder.playerInitPos.y,
      this.mapBuilder.playerInitPos.z
    );

    // 玩家子弹缓冲池
    let playerBulletPool = new bulletBufferPool(
      10,
      Confs.bulletSize,
      "red",
      Confs.playerBulletPower,
      this.sceneRender
    );

    // 敌人子弹缓冲池
    let enemyBulletPool = new bulletBufferPool(
      10,
      Confs.bulletSize,
      "blue",
      Confs.enemyBulletPower,
      this.sceneRender
    );

    this.playerBuilder = new PlayerBuilder(
      this.sceneRender,
      this.camera,
      playerBulletPool,
      this.mapBuilder.playerInitPos
    );
    if (this.playerBuilder.characterHpInfo) {
      this.characterHpInfos.push(this.playerBuilder.characterHpInfo);
    }

    //console.log(ThreeMath.posInScope(new THREE.Vector2(-20,20),new THREE.Vector2(-21,25),new THREE.Vector2(-19,-9)))
    this.itemBufferPool = new ItemBufferPoll(
      2,
      Confs.itemSize,
      "/img/item.png",
      Confs.itemHeight,
      this.sceneRender
    );

    for (let enemy of this.mapBuilder.enemies) {
      this.enemyBuilders.push(
        new EnemyBuilder(
          enemy.name,
          this.playerBuilder,
          this.sceneRender,
          this.camera,
          enemyBulletPool,
          this.mapBuilder,
          this.itemBufferPool,
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

  clear() {
    this.sceneRender?.scene?.clear();
    this.playerBuilder?.removeEventListener();
    this.enemyBuilders.forEach((enemy: EnemyBuilder) => {
      enemy.characterBuilder?.clear();
    })
    if (this.itemBufferPool) {
      this.itemBufferPool.clear();
    }
  }
}
