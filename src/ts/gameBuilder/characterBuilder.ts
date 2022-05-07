import * as THREE from "three";
import SceneRender from "../scene/sceneRender";
import BaseThree from "../common/baseThree";
import Animation from "../apis/animation";
import Character from "../apis/character";
import { Group } from "three";
import { AniEffectScope } from "../apis/enum";
import AnimationInput from "../apis/animationInput";
import gsap from "gsap";

/**
 * 角色构建器
 */
export default class CharacterBuilder extends BaseThree {
  public characterUrl: string;

  public animationsInput: Array<AnimationInput>;

  public animations: Array<Animation> = [];

  public character: Character | null = null;

  public skinMeshIndex: number;

  public mixer: THREE.AnimationMixer | null = null;

  public scene: SceneRender;

  private onLoad: (object: Group) => void;
  private onProgress?: (event: ProgressEvent) => void;
  private onError?: (event: ErrorEvent) => void;

  constructor(
    characterUrl: string,
    animationsInput: Array<AnimationInput>,
    skinMeshIndex: number,
    scene: SceneRender,
    onLoad: (object: Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ) {
    super();
    this.characterUrl = characterUrl;
    this.animationsInput = animationsInput;
    this.skinMeshIndex = skinMeshIndex;
    this.scene = scene;
    this.onLoad = onLoad;
    this.onProgress = onProgress;
    this.onError = onError;
    this.enable();
  }

  start(): void {
    this.loadCharacter(0);
  }

  public lookAt(pos: THREE.Vector3) {
    this.character?.lookAt(pos);
  }

  /**
   * 角色前进
   * @param speed 前进速度
   */
  public moveAdvance(speed: number) {
    if (this.character) {
      // 角色前进 朝向目标点移动
      this.moveTo(this.character.lookPoint, speed);
    }
  }

  /**
   * 角色后退
   * @param speed 速度
   */
  public moveBack(speed: number) {
    if (this.character && this.character.group) {
      // 角色前进 朝向目标点反方向移动
      this.moveTo(
        this.character.group.position.clone().sub(this.character.lookPoint),
        speed
      );
    }
  }

  /**
   * 角色左移
   * @param speed 速度
   */
  public moveLeft(speed: number) {
    if (this.character && this.character.group) {
      let targetPos = this.changeAngleFromYAxis(
        this.character.lookPoint.clone().sub(this.character.group.position),
        -Math.PI / 2
      );
      this.moveTo(targetPos, speed);
    }
  }

  /**
   * 角色右移
   * @param speed 速度
   */
  public moveRight(speed: number) {
    if (this.character && this.character.group) {
      let targetPos = this.changeAngleFromYAxis(
        this.character.lookPoint.clone().sub(this.character.group.position),
        Math.PI / 2
      );
      this.moveTo(targetPos, speed);
    }
  }

  /**
   * 角色左前进
   * @param speed 速度
   */
  public moveLeftAdvance(speed: number) {
    if (this.character && this.character.group) {
      let targetPos = this.changeAngleFromYAxis(
        this.character.lookPoint.clone().sub(this.character.group.position),
        -Math.PI / 4
      );
      this.moveTo(targetPos, speed);
    }
  }

  /**
   * 角色右前进
   * @param speed 速度
   */
  public moveRightAdvance(speed: number) {
    if (this.character && this.character.group) {
      let targetPos = this.changeAngleFromYAxis(
        this.character.lookPoint.clone().sub(this.character.group.position),
        Math.PI / 4
      );
      this.moveTo(targetPos, speed);
    }
  }

  /**
   * 角色左后进
   * @param speed 速度
   */
  public moveLeftBack(speed: number) {
    if (this.character && this.character.group) {
      let targetPos = this.changeAngleFromYAxis(
        this.character.group.position.clone().sub(this.character.lookPoint),
        Math.PI / 4
      );
      this.moveTo(targetPos, speed);
    }
  }

  /**
   * 角色右后进
   * @param speed 速度
   */
  public moveRightBack(speed: number) {
    if (this.character && this.character.group) {
      let targetPos = this.changeAngleFromYAxis(
        this.character.group.position.clone().sub(this.character.lookPoint),
        -Math.PI / 4
      );
      this.moveTo(targetPos, speed);
    }
  }

  /**
   * 角色停止移动
   */
  public moveStop() {
    if (this.character && this.character.group) {
      let targetPos = null;
      this.character.targetPos = targetPos;
    }
  }

  /**
   * 将向量根据y轴偏移角度
   * @param vec 需要偏移的向量
   * @param radian 需要偏移的弧度
   *
   * @returns 偏移后的向量
   */
  private changeAngleFromYAxis(
    vec: THREE.Vector3,
    radian: number
  ): THREE.Vector3 {
    if (vec.x !== 0 || vec.z !== 0) {
      var x = vec.x;
      var y = vec.z;
      var tha1 = radian;

      var value = Math.sqrt(x * x + y * y);

      var cos1 = x / value;
      var sin1 = y / value;

      var cos2 = Math.cos(tha1);
      var sin2 = Math.sin(tha1);

      var cos3 = cos1 * cos2 - sin1 * sin2;
      var sin3 = sin1 * cos2 + cos1 * sin2;

      return new THREE.Vector3(value * cos3, vec.y, value * sin3);
    }
    return vec;
  }

  public moveTo(pos: THREE.Vector3, speed: number) {
    if (this.character) {
      let collideObjs: THREE.Object3D[] = [];
      collideObjs = this.scene.collideMeshList.filter((obj) => {
        return obj.id != this.character?.group?.id;
      });
      this.character.colliderMeshList = collideObjs;
      this.character.moveTo(pos, speed);
    }
  }

  update(): void {}

  loadCharacter(animationIndex: number) {
    if (animationIndex < this.animationsInput.length) {
      let animationInput = this.animationsInput[animationIndex];
      let animation: Animation = new Animation(
        animationInput.url,
        animationInput.name,
        animationInput.aniIndex,
        animationInput.effectScope,
        animationInput.loop,
        animationInput.weight,
        (object) => {
          if (animationInput.onLoad) {
            animationInput.onLoad(object);
          }
          this.onAnimationSuccess(object);
          this.loadCharacter(animationIndex + 1);
        }
      );
      this.animations.push(animation);
    } else {
      let character: Character = new Character(
        this.characterUrl,
        this.animations,
        this.skinMeshIndex,
        (object) => {
          this.scene.add(object);
          this.onLoad(object);
        }
      );
      this.character = character;
    }
  }

  onAnimationSuccess(object: Group) {}

  onCharacterSuccess(object: Group) {}
}
