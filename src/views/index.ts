import * as THREE from "three";
import store from "@/store";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import BaseThree from "@/ts/common/baseThree";
import SceneRender from "@/ts/scene/sceneRender";
import MapBuilder from "@/ts/gameBuilder/mapBuilder";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import CharacterBuilder from "@/ts/gameBuilder/characterBuilder";
import AnimationInput from "@/ts/apis/animationInput";
import { AniEffectScope, CameraMode } from "@/ts/apis/enum";
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
  directLight: THREE.DirectionalLight | null = null;
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
  // 玩家子弹缓冲池
  playerBulletPool: bulletBufferPool | null = null;
  // 敌人子弹缓冲池
  enemyBulletPool: bulletBufferPool | null = null;

  /**
   * 场景是否加载完毕
   */
  isLoaded: boolean = false;

  // 目前已加载完毕的角色
  loadedNum: number = 0;
  // 总共需要加载的角色
  totalLoadingNum: number = 0;

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

    // 默认第三人称视角
    Confs.CAMERA_MODE = CameraMode.TPS;

    if (!this.camera) {
      this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
    }
    if (!this.ambientLight) {
      this.ambientLight = new THREE.AmbientLight(0xaaaaaa); // 环境光
      // 环境光所有层均可见
      this.ambientLight.layers.enableAll();
    }
    if (!this.directLight) {
      this.directLight = new THREE.DirectionalLight(0xffffff); // 方向光
      // 方向光所有层均可见
      this.directLight.layers.enableAll();
      this.directLight.position.set(10, 10, 10);
    }

    if (!this.sceneRender) {
      this.sceneRender = new SceneRender(
        this.camera,
        this.ambientLight,
        false,
        "threeCanvas"
      );
    } else {
      // 加入环境光
      this.sceneRender.scene?.add(this.ambientLight);
    }
    this.sceneRender.add(this.directLight, false);
    console.log(this.sceneRender?.renderer?.info)

    // 设置天空盒
    this.sceneRender.setSkybox();

    // 创建地图
    this.mapBuilder = new MapBuilder(
      require("../assets/map/" + mapName + ".json"),
      this.sceneRender
    );
    // 总共需要加载的角色：敌人数目+玩家
    this.totalLoadingNum = this.mapBuilder.enemies.length + 1;
    // 初始化游戏进度
    store.commit(Confs.STORE_RESETPROCESS, {
      targetProcess: this.mapBuilder.map.targetProcess,
      maxLife: this.mapBuilder.map.life,
    });

    // 设置小地图
    this.sceneRender.setMapCamera(this.mapBuilder.map)

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
    this.playerBulletPool = new bulletBufferPool(
      10,
      Confs.bulletSize,
      "red",
      Confs.playerBulletPower,
      this.sceneRender
    );

    // 敌人子弹缓冲池
    this.enemyBulletPool = new bulletBufferPool(
      10,
      Confs.bulletSize,
      "blue",
      Confs.enemyBulletPower,
      this.sceneRender
    );

    this.playerBuilder = new PlayerBuilder(
      this.sceneRender,
      this.camera,
      this.playerBulletPool,
      this.mapBuilder.playerInitPos,
      (object) => {
        this.loadedNum++;
        if (this.loadedNum >= this.totalLoadingNum) {
          this.isLoaded = true;
        }
      }
    );
    if (this.playerBuilder.characterHpInfo) {
      this.characterHpInfos.push(this.playerBuilder.characterHpInfo);
    }
    if (!this.itemBufferPool) {
      this.itemBufferPool = new ItemBufferPoll(
        2,
        Confs.itemSize,
        "/img/item.png",
        Confs.itemHeight,
        this.sceneRender
      );
    }


    for (let enemy of this.mapBuilder.enemies) {
      this.enemyBuilders.push(
        new EnemyBuilder(
          enemy.name,
          this.playerBuilder,
          this.sceneRender,
          this.camera,
          this.enemyBulletPool,
          this.mapBuilder,
          this.itemBufferPool,
          enemy.naviDelayTime,
          new THREE.Vector3(enemy.initPos.x, 0, enemy.initPos.y),
          (object) => {
            this.loadedNum++;
            if (this.loadedNum >= this.totalLoadingNum) {
              this.isLoaded = true;
            }
          }
        )
      );
    }

    this.enemyBuilders.forEach((enemy) => {
      if (enemy.characterHpInfo) {
        this.characterHpInfos.push(enemy.characterHpInfo);
      }
    });
  }

  /**
   * 重新加载界面
   */
  reload(levelIndex?: number) {
    this.clear();
    // 重新加载界面不清理该类
    this.isCleared = false;
    if (levelIndex) {
      this.levelIndex = levelIndex;
    }
    this.characterHpInfos = [];
    this.enemyBuilders = [];
    this.init();
  }

  /**
   * 清理场景
   */
  clear() {
    super.clear()
    this.sceneRender?.clear();
    this.playerBuilder?.clear();
    this.enemyBuilders.forEach((enemy: EnemyBuilder) => {
      enemy.clear();
    });
    this.playerBuilder = null;
    this.enemyBuilders = [];
    if(this.directLight){
      this.directLight.dispose();
      this.directLight = null;
    }
    if (this.itemBufferPool) {
      this.itemBufferPool.clear();
      this.itemBufferPool = null;
    }
    if (this.enemyBulletPool) {
      this.enemyBulletPool.clear();
      this.enemyBulletPool = null;
    }
    if (this.playerBulletPool) {
      this.playerBulletPool.clear();
      this.playerBulletPool = null;
    }
    if (this.mapBuilder) {
      this.mapBuilder.clear();
      this.mapBuilder = null;
    }

  }
}
