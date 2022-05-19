import * as THREE from "three";
import AnimationInput from "../apis/animationInput";
import Character from "../apis/character";
import CharacterHpInfo from "../apis/characterHpInfo";
import { AniEffectScope } from "../apis/enum";
import BaseThree from "../common/baseThree";
import SceneRender from "../scene/sceneRender";
import ThreeMath from "../tool/threeMath";
import CharacterBuilder from "./characterBuilder";
import PlayerAndEnemyCommonBuilder from "./playerAndEnemyCommonBuilder";

export default class PlayerBuilder extends PlayerAndEnemyCommonBuilder {
  player: CharacterBuilder | null = null;
  collider: THREE.Mesh | null = null;
  mousePoint: THREE.Vector2 = new THREE.Vector2();

  onUpKeyDown: boolean = false;
  onDownKeyDown: boolean = false;
  onLeftKeyDown: boolean = false;
  onRightKeyDown: boolean = false;

  /**
   * 玩家的血量信息
   */
  characterHpInfo: CharacterHpInfo | null = null;

  constructor(sceneRender: SceneRender, camera: THREE.Camera) {
    super(
      "player",
      "character/Player.fbx",
      "character/animate/Run Forward.fbx",
      "character/animate/Walk Backward.fbx",
      "character/animate/hit reaction.fbx",
      "character/animate/rifle aiming idle.fbx",
      "character/animate/Dying.fbx",
      sceneRender,
      camera
    );
    this.player = this.characterBuilder;
    this.enable();
  }

  start() {
    super.start();
    this.addEventListener();
  }

  /**
   * 添加事件监听器
   */
  addEventListener() {
    // 添加鼠标移动的事件，用来更新角色朝向
    document.addEventListener("mousemove", (ev) => {
      this.onDocumentMouseMove(ev);
    });
    // 添加键盘按下事件，用于角色移动
    document.addEventListener("keydown", (ev) => {
      this.onDocumentKeyDown(ev);
    });
    // 添加键盘抬起事件，用于停止角色移动
    document.addEventListener("keyup", (ev) => {
      this.onDocumentKeyUp(ev);
    });
  }

  createPlayer() {
    let aniInputs: Array<AnimationInput> = new Array<AnimationInput>();
    // 创造动画属性
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

    let player = new CharacterBuilder(
      "character/Player.fbx",
      "player",
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
        this.player = player;
      }
    );
    // 创建血条信息
    this.characterHpInfo = new CharacterHpInfo("player");
  }

  update() {
    super.update();
    this.updateLookPoint();
    this.updatePlayerStatus();
  }

  /**
   * 更新玩家状态，包含更新位置和动画
   */
  updatePlayerStatus() {
    if (this.player?.character) {
      if (this.onLeftKeyDown && this.onUpKeyDown) {
        // 左前进
        let angle = this.getIncludeAngle(new THREE.Vector3(-1, 0, -1));
        let speed = this.playAnimation(angle);
        this.player?.moveLeftAdvance(speed);
      } else if (this.onRightKeyDown && this.onUpKeyDown) {
        // 右前进
        let angle = this.getIncludeAngle(new THREE.Vector3(1, 0, -1));
        let speed = this.playAnimation(angle);
        this.player?.moveRightAdvance(speed);
      } else if (this.onRightKeyDown && this.onDownKeyDown) {
        /// 右后退
        let angle = this.getIncludeAngle(new THREE.Vector3(1, 0, 1));
        let speed = this.playAnimation(angle);
        this.player?.moveRightBack(speed);
      } else if (this.onLeftKeyDown && this.onDownKeyDown) {
        // 左后退
        let angle = this.getIncludeAngle(new THREE.Vector3(-1, 0, 1));
        let speed = this.playAnimation(angle);
        this.player?.moveLeftBack(speed);
      } else if (this.onUpKeyDown) {
        // 前进
        let angle = this.getIncludeAngle(new THREE.Vector3(0, 0, -1));
        let speed = this.playAnimation(angle);
        this.player?.moveAdvance(speed);
      } else if (this.onDownKeyDown) {
        // 后退
        let angle = this.getIncludeAngle(new THREE.Vector3(0, 0, 1));
        let speed = this.playAnimation(angle);
        this.player?.moveBack(speed);
      } else if (this.onLeftKeyDown) {
        // 左移
        let angle = this.getIncludeAngle(new THREE.Vector3(-1, 0, 0));
        let speed = this.playAnimation(angle);
        this.player?.moveLeft(speed);
      } else if (this.onRightKeyDown) {
        // 右移
        let angle = this.getIncludeAngle(new THREE.Vector3(1, 0, 0));
        let speed = this.playAnimation(angle);
        this.player?.moveRight(speed);
      } else {
        // 待机
        this.player?.moveStop();
        this.player?.character?.play("idle");
      }
      // 角色血量小于0时，播放死亡动画
      if (this.player.character.hp <= 0) {
        this.player.character.play("dying");
      }
      // 更新摄像机位置
      this.updateCameraPosition();

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

  /**
   * 根据当前角色朝向与前进方向的夹角来播放动画
   * @param angle 当前角色朝向与前进方向的夹角
   * @returns 前进的速度
   */
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

  /**
   * 获得当前角色朝向与目标向量之间的夹角
   * @param vec 方向向量
   * @returns 当前角色朝向与目标向量之间的夹角
   */
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

  /**
   * 更新摄像机位置，使摄像机始终与主角保持相对运动
   */
  updateCameraPosition() {
    if (this.player?.character?.group) {
      // 更新摄像机位置，使摄像机始终与主角保持相对运动
      this.camera?.position.set(
        this.player.character.group.position.x,
        this.player.character.group.position.y + 28,
        this.player.character.group.position.z + 37.5
      );
      this.camera?.lookAt(this.player.character.group.position);
    }
  }

  /**
   * 更新玩家朝向点
   */
  updateLookPoint() {
    if (this.camera && this.player) {
      var vector = new THREE.Vector3(
        (this.mousePoint.x / window.innerWidth) * 2 - 1,
        -(this.mousePoint.y / window.innerHeight) * 2 + 1,
        0.5
      );
      vector = vector
        .unproject(this.camera as THREE.Camera)
        .sub((this.camera as THREE.Camera).position)
        .normalize();
      // console.log(vector)
      let intersectPoint = ThreeMath.CalPlaneLineIntersectPoint(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        vector,
        this.camera?.position as THREE.Vector3
      );
      intersectPoint.y = 0;
      // console.log(intersectPoint)
      this.player?.lookAt(intersectPoint);
    }
  }

  onDocumentMouseMove(event: MouseEvent) {
    if (this.camera && this.player) {
      // 记录鼠标位置
      this.mousePoint.set(event.clientX, event.clientY);
    }
  }

  /**
   * 键盘按下时的事件
   * @param event
   */
  onDocumentKeyDown(ev: KeyboardEvent) {
    if (ev.key == "d") {
      // 按下D
      this.onRightKeyDown = true;
    }
    if (ev.key == "s") {
      // 按下s
      this.onDownKeyDown = true;
    }

    if (ev.key == "w") {
      // 按下w
      this.onUpKeyDown = true;
    }

    if (ev.key == "a") {
      // 按下a
      this.onLeftKeyDown = true;
    }
  }

  /**
   * 键盘抬起时的事件
   * @param event
   */
  onDocumentKeyUp(ev: KeyboardEvent) {
    if (ev.key == "d") {
      // 松开d
      this.onRightKeyDown = false;
    }
    if (ev.key == "s") {
      // 松开s
      this.onDownKeyDown = false;
    }

    if (ev.key == "w") {
      // 松开w
      this.onUpKeyDown = false;
    }

    if (ev.key == "a") {
      // 松开a
      this.onLeftKeyDown = false;
    }
  }
}
