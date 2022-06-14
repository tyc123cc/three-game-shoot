import * as THREE from "three";
import { Material } from "three";
import AnimationInput from "../apis/animationInput";
import Character from "../apis/character";
import CharacterHpInfo from "../apis/characterHpInfo";
import { AniEffectScope, CameraMode, CharacterStatus } from "../apis/enum";
import bulletBufferPool from "../bullet/bulletBufferPool";
import BaseThree from "../common/baseThree";
import Confs from "../common/confs/confs";
import SceneRender from "../scene/sceneRender";
import ThreeMath from "../tool/threeMath";
import CharacterBuilder from "./characterBuilder";

/**
 *
 */
export default abstract class PlayerAndEnemyCommonBuilder extends BaseThree {
  characterBuilder: CharacterBuilder | null = null;
  sceneRender: SceneRender;
  collider: THREE.Mesh | null = null;
  camera: THREE.Camera;
  mousePoint: THREE.Vector2 = new THREE.Vector2();
  name: string;
  initPos: THREE.Vector3 = new THREE.Vector3;
  rebirthTime: number = 5;
  nowRebirthTime: number = 0;
  characterStatus: CharacterStatus = CharacterStatus.Alive;

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

  /**
 * 子弹缓冲池
 */
  bulletPool: bulletBufferPool;

  onLoad: (object: THREE.Group) => void;
  private onProgress?: (event: ProgressEvent) => void;
  private onError?: (event: ErrorEvent) => void;

  /**
   * 是否加载完毕
   */
  loaded: boolean = false;

  constructor(
    name: string,
    characterUrl: string,
    runUrl: string,
    backUrl: string,
    hitUrl: string,
    idleUrl: string,
    dyingUrl: string,
    sceneRender: SceneRender,
    camera: THREE.Camera,
    onLoad: (object: THREE.Group) => void,
    bulletPool: bulletBufferPool,
    initPos?: THREE.Vector3,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
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
    this.onLoad = onLoad;
    this.name = name;
    this.bulletPool = bulletPool;
    if (initPos) {
      this.initPos = initPos;
    }
    this.onProgress = onProgress;
    this.onError = onError;
    //this.enable();
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
        player.character?.group?.position.copy(this.initPos);
        // 缩放模型
        player.character?.group?.scale.set(0.05, 0.05, 0.05);
        // 播放待机动画
        player.play("idle");
        // 构建碰撞体
        let mesh = new THREE.Mesh(
          new THREE.BoxGeometry(Confs.characterColliderSize, 20, Confs.characterColliderSize),
          new THREE.MeshLambertMaterial()
        );
        mesh.position.copy(object.position)
        mesh.position.y = 10;
        this.collider = mesh;
        player.addCollider(mesh);
        this.characterBuilder = player;
        this.onLoad(object);
        this.loaded = true;
      },
      this.onProgress
    );

    // 创建血条信息
    this.characterHpInfo = new CharacterHpInfo(this.name);
  }

  update() {
    this.updatePlayerHp();
    this.rebirth();
  }

  /**
   * 角色复活
   */
  rebirth() {
    // 如果角色是死亡状态，进行复活倒计时
    if (this.characterStatus == CharacterStatus.Death) {
      this.nowRebirthTime += this.deltaTime;
      // 倒计时完毕，角色复活
      if (this.nowRebirthTime >= this.rebirthTime) {
        // 恢复复活计时
        this.nowRebirthTime = 0;
        // 播放待机动画
        this.characterBuilder?.play('idle')
        // 角色回到初始位置
        this.resetPosition();
        this.characterStatus = CharacterStatus.Alive
        this.characterBuilder?.resetHP();
        if (this.collider) {
          this.characterBuilder?.addCollider(this.collider)
        }
      }
    }
  }

  resetPosition() {
    // 角色回到初始位置
    this.characterBuilder?.character?.group?.position.copy(this.initPos)
  }

  /**
   * 更新玩家血量信息
   */
  updatePlayerHp() {
    if (this.characterBuilder?.character) {
      // 角色血量小于0时，播放死亡动画
      if (this.characterBuilder.character.hp <= 0 && this.characterStatus == CharacterStatus.Alive) {
        this.characterBuilder.character.play("dying");
        // 将角色状态设置为死亡
        this.characterStatus = CharacterStatus.Death;
        // 角色停止前进
        this.characterBuilder.moveStop();
        // 移除碰撞体
        this.characterBuilder.removeCollider();
        // 执行角色死亡函数
        this.death();
      }
      // 更新血量条信息
      this.updateCharacterHPInfo(this.characterBuilder.character);
    }
  }

  /**
   * 角色死亡抽象函数
   */
  abstract death(): void;

  /**
   * 更新血量条信息
   */
  updateCharacterHPInfo(character: Character) {
    if (character.group && this.camera && this.sceneRender) {
      let screenPos = ThreeMath.createVector(
        character.group.position,
        this.camera,
        this.sceneRender
      );
      let HpInfo = this.characterHpInfo;
      if (HpInfo) {
        HpInfo.screenPos = screenPos;
        let characterPos = Confs.CAMERA_MODE == CameraMode.TPS ?
          character.group.position.clone() :
          new THREE.Vector3(character.group.position.x, Confs.FPSCameraHeight, character.group.position.z)
        let tempV = characterPos
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

  /**
   * 角色发射子弹
   */
  fire() {
    if (this.characterBuilder?.character?.group && this.sceneRender) {
      // 播放射击动画
      this.characterBuilder?.character?.play("hit");
      // 调整子弹初始位置，使子弹往人物前方移一点 公式：人物位置+人物面朝方向向量*偏移值
      let initPos = this.characterBuilder?.character?.group?.position
        .clone()
        .add(
          this.characterBuilder.character.lookPoint
            .clone()
            .sub(this.characterBuilder.character.group.position)
            .normalize()
            .multiplyScalar(2)
        );
      this.bulletPool?.fire(
        initPos,
        this.characterBuilder.character.lookPoint
          .clone()
          .sub(this.characterBuilder.character.group.position),
        Confs.bulletSpeed
      );
    }
  }

  clear() {
    super.clear()
    this.characterBuilder?.clear();
    if (this.collider) {
      this.collider.geometry.dispose();
      (this.collider.material as Material).dispose();
      this.collider = null;
    }
    this.characterBuilder = null;
  }
}
