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
  * 角色在执行上半身动画结束后的AnimationAction
  */
  public nextAnimationAction: Animation | null = null;


  /**
   * 该角色的后补动画Set
   */
  public animationSet: Set<Animation>;

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
    this.animationSet = new Set()
    let loader = new FBXLoader();
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

  start(): void { }

  update(): void {
    //clock.getDelta()方法获得两帧的时间间隔
    // 更新混合器相关的时间
    this.mixer?.update(this.deltaTime);
    if (!this.animationAction) {
      return;
    }
    // 上半身动画停止
    if (this.animationAction.time >= (this.playingAnimation?.animationClip?.duration as number) && this.playingAnimation?.effectScope == AniEffectScope.Upper) {
      // 重置当前播放动画
      this.playingAnimation = null;
      if (this.nextAnimationAction) {
        // 播放上半身停止后动画
        this.play(this.nextAnimationAction.name)
        this.animationSet.forEach(ani => {
          if (ani.name != this.playingAnimation?.name) {
            // 停止其他动画 防止出现攻击-移动-静止时依旧播放移动动画的情况
            this.mixer?.clipAction(ani.animationClip as AnimationClip).stop();
          }
        });
        this.animationSet.clear();
      }
      this.nextAnimationAction = null;

    }
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
      console.log("正在执行播放下半身时播放上半身:" + animation.name)
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
      this.nextAnimationAction = this.playingAnimation;
      if (!this.animationSet.has(this.playingAnimation)) {
        this.animationSet.add(this.playingAnimation)
      }
      this.playingAnimation = animation;
    } else if (
      animation.effectScope != AniEffectScope.Upper &&
      this.playingAnimation.effectScope == AniEffectScope.Upper
    ) {
      console.log('正在执行上半身动作时插入别的动画' + animation.name)
      // 不停止上半身动画，直接播放下半身动画进行动画融合

      // let playingAnimationAction = this.mixer?.clipAction(this.playingAnimation.animationClip as AnimationClip) as AnimationAction;
      // let newUpperAnimationAction = this.mixer?.clipAction(animationClipTemp) as AnimationAction;
      // newUpperAnimationAction.syncWith(playingAnimationAction)
      //playingAnimationAction.stop();
      this.animationAction?.play();
      this.animationAction = this.mixer?.clipAction(this.playingAnimation.animationClip as AnimationClip) as AnimationAction;

      let animationClipTemp =
        this.playingAnimation.animationClip?.clone() as AnimationClip;
      // // 上半身动画只保留上半身骨骼动画
      animationClipTemp.tracks.splice(45);
      animationClipTemp.tracks[1] = (
        animation.animationClip as AnimationClip
      ).tracks[1];
      let oldAnimationAction = this.animationAction as AnimationAction;
      this.animationAction = this.mixer?.clipAction(
        animationClipTemp
      ) as AnimationAction;
      this.animationAction.loop = oldAnimationAction.loop;
      this.animationAction.weight = oldAnimationAction.weight;
      this.animationAction.syncWith(oldAnimationAction)
      this.animationAction.play();
      oldAnimationAction.stop()
      //newUpperAnimationAction.play();
      //this.playingAnimation = animation;
      // 如果是全身动画，还需要把其他动画关掉


      // 此时播放动画以上半身动画为准
      if (!this.animationSet.has(animation)) {
        this.animationSet.add(animation)
        console.log("添加set:" + animation.name)
      }
      this.nextAnimationAction = animation;
      // if (animation.effectScope == AniEffectScope.All) {
      //   // 重置当前播放动画
      //   this.playingAnimation = null;
      //   if (this.nextAnimationAction) {
      //     // 播放上半身停止后动画
      //     this.play(this.nextAnimationAction.name)
      //     this.animationSet.forEach(ani => {
      //       if (ani.name != this.playingAnimation?.name) {
      //         // 停止其他动画 防止出现攻击-移动-静止时依旧播放移动动画的情况
      //         this.mixer?.clipAction(ani.animationClip as AnimationClip).stop();
      //       }
      //     });
      //     this.animationSet.clear();
      //   }
      //   this.nextAnimationAction = null;
      // }
    }
    else if (
      animation.name == this.playingAnimation.name &&
      animation.effectScope != AniEffectScope.Upper
    ) {
      // 非上半身重复播放，不执行
      console.log("正在执行非上半身动作重复播放:" + animation.name)
    }
    else if (
      animation.effectScope != AniEffectScope.Upper &&
      this.playingAnimation.effectScope == AniEffectScope.Upper
    ) {
      // 上半身动作无法被其他动作覆盖，该
      console.log("正在执行上半身动作无法被其他动作覆盖:" + animation.name)
    } else {
      console.log("正在执行其他情况:" + animation.name)
      // 其他情况直接播放动画
      // 获取正在播放的action
      let playingAnimationAction = this.mixer?.clipAction(
        this.playingAnimation.animationClip as AnimationClip
      ) as AnimationAction;
      this.animationAction?.stop().play();
      if (animation.effectScope != AniEffectScope.Upper) {
        // 非上半身动作，需要停止当前动作
        playingAnimationAction.stop();
      }
      else {
        // 播放上半身动作，记录当前动作
        this.nextAnimationAction = this.playingAnimation
        if (!this.animationSet.has(this.playingAnimation)) {
          this.animationSet.add(this.playingAnimation)
        }
      }
      this.playingAnimation = animation;
    }
  }
}
