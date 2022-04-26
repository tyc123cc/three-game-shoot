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
import { AniEffectScope, AniStatus } from "./enum";

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
  public nextAnimation: Animation | null = null;

  /**
   * 该角色的后补动画Set
   */
  public animationSet: Set<Animation>;

  /**
   * 当前动画播放状态
   */
  public AnimationStatus: AniStatus = AniStatus.Null;

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
    this.animationSet = new Set();
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

  start(): void {}

  update(): void {
    //clock.getDelta()方法获得两帧的时间间隔
    if (!this.animationAction) {
      return;
    }
    // 上半身动画停止
    // this.animationAction.time >= (this.playingAnimation?.animationClip?.duration as number)
    if (
      !this.animationAction.isRunning() &&
      this.playingAnimation?.effectScope == AniEffectScope.Upper
    ) {
      // 重置当前播放动画
      if (this.nextAnimation) {
        let action = this.mixer?.clipAction(
          this.nextAnimation.animationClip as AnimationClip
        ) as AnimationAction;
        action.stop().play();
        this.animationAction.stop();
        this.animationAction = action;
        this.playingAnimation = this.nextAnimation;
        this.AnimationStatus = Animation.changeAnimationEffectScopeToStatus(
          this.nextAnimation.effectScope
        );
        this.nextAnimation = null;
        // 播放上半身停止后动画
        //this.play(this.nextAnimation.name);
        console.log("播放完毕");
        this.animationSet.forEach((ani) => {
          if (ani.name != this.playingAnimation?.name) {
            // 停止其他动画 防止出现攻击-移动-静止时依旧播放移动动画的情况
            this.mixer?.clipAction(ani.animationClip as AnimationClip).stop();
            console.log("已删除" + ani.name);
          }
        });
        this.animationSet.clear();
      }
      this.nextAnimation = null;
    }
    // 更新混合器相关的时间
    this.mixer?.update(this.deltaTime);
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
      let animationAction: AnimationAction | null = null;
      // 混合器中不存在该clip，需要设置初始属性
      if (!this.mixer?.existingAction(clip)) {
        animationAction = this.mixer?.clipAction(clip) as AnimationAction;
        animationAction.loop = animation.loop;
        animationAction.weight = animation.weight;
      } else {
        animationAction = this.mixer?.clipAction(clip) as AnimationAction;
      }
      this.playMixAnimation(animation, animationAction);
    }
  }

  /**
   * 播放混合动画
   */
  private playMixAnimation(animation: Animation, action: AnimationAction) {
    // 当前未在播放动画，直接播放当前动画
    if (this.AnimationStatus == AniStatus.Null) {
      console.log("直接播放动画 " + animation.name);
      action.stop().play();
      this.animationAction = action;
      this.playingAnimation = animation;
      this.AnimationStatus = Animation.changeAnimationEffectScopeToStatus(
        animation.effectScope
      );
      return;
    }
    // 当前正在播放下半身动画，且需要播放上半身动画时（或相反情况），进行动画融合操作
    if (
      animation.effectScope == AniEffectScope.Upper &&
      this.AnimationStatus == AniStatus.Lower
    ) {
      console.log("正在执行播放下半身时播放上半身:" + animation.name);
      // 不停止下半身动画，直接播放上半身动画进行动画融合
      // 克隆出该上半身动画数据，进行骨骼点裁剪，再将新动画与正在播放的下半身动画融合
      let animationClipTemp = animation.animationClip?.clone() as AnimationClip;
      // 上半身动画只保留上半身骨骼动画
      animationClipTemp.tracks.splice(45);
      animationClipTemp.tracks[1] = (
        this.playingAnimation?.animationClip as AnimationClip
      ).tracks[1];
      // 裁剪完毕，生成新的Action
      let newAnimationAction = this.mixer?.clipAction(
        animationClipTemp
      ) as AnimationAction;
      // 配置初始值
      newAnimationAction.loop = animation.loop;
      newAnimationAction.weight = animation.weight;
      // 播放裁剪后的上半身动作
      newAnimationAction.stop().play();
      // 设置当前Action为裁剪过的动作Action
      this.animationAction = newAnimationAction;
      // 设置结束后的动作为当前的下半身动作
      this.nextAnimation = this.playingAnimation;
      // 将当前动画放在set中，待上半身动画结束后进行统一播放/停止
      if (!this.animationSet.has(this.playingAnimation as Animation)) {
        this.animationSet.add(this.playingAnimation as Animation);
      }
      // 设置当前播放动画
      this.playingAnimation = animation;
      // 当前正在播放上下半身融合动画
      this.AnimationStatus = AniStatus.UpperAndLower;
    }
    // 当前正在播放上半身动画时，插入下半身动画，进行动画融合
    else if (
      animation.effectScope == AniEffectScope.Lower &&
      this.AnimationStatus == AniStatus.Upper
    ) {
      console.log("正在执行上半身动作时插入别的动画" + animation.name);
      // 不停止上半身动画，直接播放下半身动画进行动画融合

      // 播放当前动画
      action.stop().play();
      // 裁剪当前播放的上半身动画

      // 裁剪当前播放的上半身动画的克隆
      let animationClipTemp =
        this.playingAnimation?.animationClip?.clone() as AnimationClip;
      // 上半身动画只保留上半身骨骼动画
      animationClipTemp.tracks.splice(45);
      animationClipTemp.tracks[1] = (
        animation.animationClip as AnimationClip
      ).tracks[1];
      // 正在播放的上半身动画action
      let oldAnimationAction = this.animationAction as AnimationAction;
      // 生成裁剪后的action
      this.animationAction = this.mixer?.clipAction(
        animationClipTemp
      ) as AnimationAction;
      // 配置初始值
      this.animationAction.loop = oldAnimationAction.loop;
      this.animationAction.weight = oldAnimationAction.weight;
      // 将裁剪后的动画时间与与当前播放的上半身动画同步
      this.animationAction.syncWith(oldAnimationAction);
      // 播放裁剪后的上半身动画
      this.animationAction.play();
      // 正在播放的上半身动画停止
      oldAnimationAction.stop();

      // 此时正在播放播放动画还是原先的上半身动画，不修改playingAnimation

      // 将下半身动作放入set中
      if (!this.animationSet.has(animation)) {
        this.animationSet.add(animation);
        console.log("添加set:" + animation.name);
      }
      // 设置上半身动画结束后的动画
      this.nextAnimation = animation;
      // 当前动画播放状态为上下半身动画融合
      this.AnimationStatus = AniStatus.UpperAndLower;

      // }
    } else if (
      animation.name == this.playingAnimation?.name &&
      animation.effectScope != AniEffectScope.Upper
    ) {
      // 非上半身重复播放，不执行
      console.log("正在执行非上半身动作重复播放:" + animation.name);
    } else if (
      animation.effectScope == AniEffectScope.All &&
      this.playingAnimation?.effectScope == AniEffectScope.Upper
    ) {
      // 上半身动作无法被全身动作覆盖，将该动作放入set和next中
      console.log("正在执行上半身动作无法被全身动作覆盖:" + animation.name);
      this.nextAnimation = animation;
      // 将当前动画放在set中，待上半身动画结束后进行统一播放/停止
      if (!this.animationSet.has(this.playingAnimation as Animation)) {
        this.animationSet.add(this.playingAnimation as Animation);
      }
    } else {
      console.log("正在执行其他情况:" + animation.name);
      // 其他情况直接播放动画
      // 播放当前动画
      action.stop().play();

      // 当前播放上半身动画，需要存储当前动作
      if (
        animation.effectScope == AniEffectScope.Upper &&
        this.AnimationStatus != AniStatus.Upper
      ) {
        // 设置上半身动画结束后的动画
        this.nextAnimation = this.playingAnimation;
        // 将当前动作放入set中
        if (!this.animationSet.has(this.playingAnimation as Animation)) {
          this.animationSet.add(this.playingAnimation as Animation);
          console.log("添加set:" + this.playingAnimation?.name);
        }
      }
      // 直接播放上半身动作时，不停止当前动画
      // 当前播放上半身动画时，需要重置动画，同样不停止
      else if (this.AnimationStatus != AniStatus.Upper) {
        // 需要停止当前动作
        this.animationAction?.stop();
      }

      // 设置当前播放动画和action
      this.animationAction = action;
      this.playingAnimation = animation;
      this.AnimationStatus = Animation.changeAnimationEffectScopeToStatus(
        animation.effectScope
      );
    }
  }
}
