import * as THREE from "three";
import AnimationInput from "../apis/animationInput";
import Character from "../apis/character";
import CharacterHpInfo from "../apis/characterHpInfo";
import { AniEffectScope } from "../apis/enum";
import bulletBufferPool from "../bullet/bulletBufferPool";
import BaseThree from "../common/baseThree";
import SceneRender from "../scene/sceneRender";
import ThreeMath from "../tool/threeMath";
import CharacterBuilder from "./characterBuilder";
import PlayerAndEnemyCommonBuilder from "./playerAndEnemyCommonBuilder";

export default class EnemyBuilder extends PlayerAndEnemyCommonBuilder {
  enemy: CharacterBuilder | null = null;
  collider: THREE.Mesh | null = null;
  mousePoint: THREE.Vector2 = new THREE.Vector2();

  name: string

  onUpKeyDown: boolean = false;
  onDownKeyDown: boolean = false;
  onLeftKeyDown: boolean = false;
  onRightKeyDown: boolean = false;

  /**
   * 玩家的血量信息
   */
  characterHpInfo: CharacterHpInfo | null = null;


  constructor(name: string, sceneRender: SceneRender, camera: THREE.Camera, bulletPool: bulletBufferPool, initPos?: THREE.Vector3) {
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
      },
      bulletPool,
      initPos
    );
    this.name = name;
    this.enable();
  }



  start() {
    super.start();
  }



  update() {
    super.update();

  }

}
