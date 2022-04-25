import {
  AnimationAction,
  AnimationActionLoopStyles,
  AnimationClip,
  AnimationMixer,
  Group,
  LoopOnce,
  LoopRepeat,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import BaseThree from "../common/baseThree";
import { Heap } from "../common/heap";
import Animation from "./animation";
import { AniEffectScope } from "./enum";

/**
 * 角色类
 */
export default class Character extends BaseThree {
  /**
   * 模型的url地址
   */
  public url: string;

  /**
   * 该角色的动画组
   */
  public animations: Array<Animation>;

  /**
   * 正在播放的动画
   */
  public playingAnimation: Animation | null = null;

  /**
   * 骨骼模型索引(children下)
   */
  public skinMeshIndex: number;

  /**
   * 动画混合器
   */
  public mixer: AnimationMixer | undefined;

  /**
   * 角色的模型group
   */
  public group: THREE.Group | null = null;

  /**
   * 角色的AnimationAction
   */
  public animationAction: AnimationAction | null = null;

  /**
   * 该角色的动画堆
   */
  public animationHeap: Heap<Animation>;

  constructor(
    url: string,
    animations: Array<Animation>,
    skinMeshIndex: number,
    onLoad: (object: Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ) {
    super();
    this.url = url;
    this.animations = animations;
    this.skinMeshIndex = skinMeshIndex;
    let loader = new FBXLoader();
    this.animationHeap = new Heap<Animation>(
      false,
      [],
      (a: Animation, b: Animation) => a.weight < b.weight
    );
    loader.load(
      url,
      (object) => {
        this.group = object;
        this.mixer = new AnimationMixer(object.children[skinMeshIndex]);
        onLoad(object);
      },
      onProgress,
      onError
    );

    this.enable();
  }

  start(): void {}

  update(): void {
    //clock.getDelta()方法获得两帧的时间间隔
    // 更新混合器相关的时间
    this.mixer?.update(this.deltaTime);
    // 动画已停止，播放堆中次优先级动画
  }

  /**
   *  播放动画
   * @param name 要播放动画的名称
   * @param loop 是否循环
   */
  public play(name: string) {
    let animation = this.animations.filter((value) => value.name == name)[0];
    let clip = animation.animationClip;
    if (clip) {
      // 混合器中不存在该clip，需要设置初始属性
      if (!this.mixer?.existingAction(clip)) {
        this.animationAction = this.mixer?.clipAction(clip) as AnimationAction;
        this.animationAction.loop = animation.loop;
        this.animationAction.weight = animation.weight;
      } else {
        this.animationAction = this.mixer?.clipAction(clip) as AnimationAction;
      }
    }
    this.playMixAnimation(animation);
  }

  /**
   * 播放混合动画
   */
  private playMixAnimation(animation: Animation) {
    // 当前未在播放动画，直接播放当前动画
    if (this.playingAnimation == null) {
      this.animationAction?.stop().play();
      this.playingAnimation = animation;
      return;
    }
    // 当前正在播放下半身动画，且需要播放上半身动画时（或相反情况），进行动画融合操作
    if (
      animation.effectScope == AniEffectScope.Upper &&
      this.playingAnimation.effectScope == AniEffectScope.Lower
    ) {
      // 不停止下半身动画，直接播放上半身动画进行动画融合
      let animationClipTemp = animation.animationClip?.clone() as AnimationClip;
      // 上半身动画只保留上半身骨骼动画
      animationClipTemp.tracks.splice(45);
      animationClipTemp.tracks[1] = (
        this.playingAnimation.animationClip as AnimationClip
      ).tracks[1];
      this.animationAction = this.mixer?.clipAction(
        animationClipTemp
      ) as AnimationAction;
      this.animationAction.loop = animation.loop;
      this.animationAction.weight = animation.weight;
      this.animationAction?.stop().play();
      //this.playingAnimation = animation;
    } else if (
      animation.effectScope == AniEffectScope.Lower &&
      this.playingAnimation.effectScope == AniEffectScope.Upper
    ) {
      // 不停止上半身动画，直接播放下半身动画进行动画融合
      let animationClipTemp =
        this.playingAnimation.animationClip?.clone() as AnimationClip;
      // 上半身动画只保留上半身骨骼动画
      animationClipTemp.tracks.splice(45);
      animationClipTemp.tracks[1] = (
        animation.animationClip as AnimationClip
      ).tracks[1];
      this.animationAction = this.mixer?.clipAction(
        animationClipTemp
      ) as AnimationAction;
      let playingAnimationAction = this.mixer?.clipAction(this.playingAnimation.animationClip as AnimationClip) as AnimationAction;
      this.animationAction.syncWith(playingAnimationAction)
      this.animationAction?.stop().play();
      this.playingAnimation = animation;
      // 此时播放动画以上半身动画为准
    } else if (
      animation.effectScope == this.playingAnimation.effectScope &&
      animation.effectScope != AniEffectScope.Upper
    ) {
      // 非上半身动作重复播放，不执行
    } else if (
      animation.effectScope != AniEffectScope.Upper &&
      this.playingAnimation.effectScope == AniEffectScope.Upper
    ) {
      // 上半身动作无法被其他动作覆盖，该
    } else {
      // 其他情况直接播放动画
      // 获取正在播放的action
      let playingAnimationAction = this.mixer?.clipAction(
        this.playingAnimation.animationClip as AnimationClip
      ) as AnimationAction;
      this.animationAction?.stop().play();
      if (animation.effectScope != AniEffectScope.Upper) {
        // 非上半身动作，需要停止当前动作
        playingAnimationAction.stop();
        this.playingAnimation = animation;
      }
    }
  }
}
