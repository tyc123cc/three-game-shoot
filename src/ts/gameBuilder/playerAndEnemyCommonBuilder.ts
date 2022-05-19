import * as THREE from "three";
import AnimationInput from "../apis/animationInput";
import Character from "../apis/character";
import CharacterHpInfo from "../apis/characterHpInfo";
import { AniEffectScope } from "../apis/enum";
import BaseThree from "../common/baseThree";
import SceneRender from "../scene/sceneRender";
import ThreeMath from "../tool/threeMath";
import CharacterBuilder from "./characterBuilder";

/**
 *
 */
export default class PlayerAndEnemyCommonBuilder extends BaseThree {
  characterBuilder: CharacterBuilder | null = null;
  sceneRender: SceneRender;
  collider: THREE.Mesh | null = null;
  camera: THREE.Camera;
  mousePoint: THREE.Vector2 = new THREE.Vector2();
  name: string;

  onUpKeyDown: boolean = false;
  onDownKeyDown: boolean = false;
  onLeftKeyDown: boolean = false;
  onRightKeyDown: boolean = false;

  characterUrl: string;
  runUrl: string;
  backUrl: string;
  idleUrl: string;
  dyingUrl: string;
  hitUrl: string;

  /**
   * 玩家的血量信息
   */
  characterHpInfo: CharacterHpInfo | null = null;

  constructor(
    name: string,
    characterUrl: string,
    runUrl: string,
    backUrl: string,
    hitUrl: string,
    idleUrl: string,
    dyingUrl: string,
    sceneRender: SceneRender,
    camera: THREE.Camera
  ) {
    super();
    this.sceneRender = sceneRender;
    this.camera = camera;
    this.characterUrl = characterUrl;
    this.runUrl = runUrl;
    this.backUrl = backUrl;
    this.idleUrl = idleUrl;
    this.dyingUrl = dyingUrl;
    this.hitUrl = hitUrl;

    this.name = name;
    this.enable();
  }

  start() {
    this.createCharacter();
  }

  createCharacter() {
    let aniInputs: Array<AnimationInput> = new Array<AnimationInput>();
    // 创造动画属性
    aniInputs.push(
      new AnimationInput(
        this.runUrl,
        0,
        "run",
        AniEffectScope.Lower,
        10,
        THREE.LoopRepeat
      )
    );
    aniInputs.push(
      new AnimationInput(
        this.hitUrl,
        0,
        "hit",
        AniEffectScope.Upper,
        20,
        THREE.LoopOnce
      )
    );
    aniInputs.push(
      new AnimationInput(
        this.idleUrl,
        0,
        "idle",
        AniEffectScope.All,
        1,
        THREE.LoopRepeat
      )
    );
    aniInputs.push(
      new AnimationInput(
        this.backUrl,
        0,
        "back",
        AniEffectScope.Lower,
        10,
        THREE.LoopRepeat
      )
    );
    aniInputs.push(
      new AnimationInput(
        this.dyingUrl,
        0,
        "dying",
        AniEffectScope.Death,
        100,
        THREE.LoopOnce
      )
    );

    let player = new CharacterBuilder(
      this.characterUrl,
      this.name,
      aniInputs,
      2,
      this.sceneRender,
      (object) => {
        player.character?.group?.position.set(0, 0, 0);
        // 缩放模型
        player.character?.group?.scale.set(0.05, 0.05, 0.05);
        // 播放待机动画
        player.play("idle");
        // 构建碰撞体
        let mesh = new THREE.Mesh(
          new THREE.BoxGeometry(4, 20, 4),
          new THREE.MeshLambertMaterial()
        );
        mesh.position.y = 10;
        this.collider = mesh;
        player.addCollider(mesh);
        this.characterBuilder = player;
      }
    );
    // 创建血条信息
    this.characterHpInfo = new CharacterHpInfo(this.name);
  }

  update() {
    this.updatePlayerHp();
  }

  /**
   * 更新玩家血量信息
   */
   updatePlayerHp() {
    if (this.characterBuilder?.character) {
      // 角色血量小于0时，播放死亡动画
      if (this.characterBuilder.character.hp <= 0) {
        this.characterBuilder.character.play("dying");
      }
      // 更新血量条信息
      this.updateCharacterHPInfo(this.characterBuilder.character);
    }
  }

  /**
   * 更新血量条信息
   */
  updateCharacterHPInfo(character: Character) {
    if (character.group && this.camera && this.sceneRender) {
      let screenPos = ThreeMath.createVector(
        character.group.position,
        this.camera
      );
      let HpInfo = this.characterHpInfo;
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
}
