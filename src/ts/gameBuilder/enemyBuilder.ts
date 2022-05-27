import * as THREE from "three";
import AnimationInput from "../apis/animationInput";
import Character from "../apis/character";
import CharacterHpInfo from "../apis/characterHpInfo";
import { AniEffectScope } from "../apis/enum";
import bulletBufferPool from "../bullet/bulletBufferPool";
import BaseThree from "../common/baseThree";
import SceneRender from "../scene/sceneRender";
import ThreeMath from "../tool/threeMath";
import AStar from "./AStar";
import CharacterBuilder from "./characterBuilder";
import MapBuilder from "./mapBuilder";
import PlayerAndEnemyCommonBuilder from "./playerAndEnemyCommonBuilder";

export default class EnemyBuilder extends PlayerAndEnemyCommonBuilder {
  enemy: CharacterBuilder | null = null;
  collider: THREE.Mesh | null = null;
  mousePoint: THREE.Vector2 = new THREE.Vector2();
  mapBuilder: MapBuilder;

  name: string

  onUpKeyDown: boolean = false;
  onDownKeyDown: boolean = false;
  onLeftKeyDown: boolean = false;
  onRightKeyDown: boolean = false;

  /**
   * 玩家的血量信息
   */
  characterHpInfo: CharacterHpInfo | null = null;

  navigation: AStar | null = null;


  constructor(name: string, sceneRender: SceneRender, camera: THREE.Camera, bulletPool: bulletBufferPool, mapBuilder: MapBuilder, initPos?: THREE.Vector3) {
    super(
      name,
      "character/Enemy.fbx",
      "character/animate/player/Run Forward.fbx",
      "character/animate/player/Walk Backward.fbx",
      "character/animate/player/hit reaction.fbx",
      "character/animate/player/rifle aiming idle.fbx",
      "character/animate/player/Dying.fbx",
      sceneRender,
      camera,
      (object) => {
        this.enemy = this.characterBuilder
        this.navigation = new AStar(this.mapBuilder.map, this.sceneRender.collideMeshList, this.name, "player", 1)
        if(this.name == "enemy2"){
          console.log(this.navigation?.builder());
        }
      },
      bulletPool,
      initPos
    );
    this.name = name;
    this.mapBuilder = mapBuilder;
    this.enable();
  }



  start() {
    super.start();
  }



  update() {
    super.update();

  }

}
