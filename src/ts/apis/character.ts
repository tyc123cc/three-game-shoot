import {
  AnimationAction,
  AnimationActionLoopStyles,
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
    this.animationHeap = new Heap<Animation>(false, [], (a: Animation, b: Animation) => a.weight < b.weight)
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
    // 动画已停止，播放堆中次优先级动画
    if (!this.animationAction?.isRunning()) {
      console.log(this.animationAction)
      console.log(this.animationHeap)
      // 最优先动画已播放完毕，取出
      this.animationHeap.pop();
      // 次优先级动画
      let animation = this.animationHeap.peek();
      if (animation) {
        let clip = animation.animationClip;
        if (clip) {
          // 播放次优先级动画
          this.animationAction = this.mixer?.clipAction(clip) as AnimationAction;
          if (this.animationAction) {
            this.animationAction.loop = animation.loop;
            this.animationAction.enabled = true;
            this.animationAction?.stop();
            this.animationAction?.play();
            this.playingAnimation = animation;
          }

        }

      }
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
      if (this.animationHeap.peek()) {
        // 上半身动画才重置
        if ((this.animationHeap.peek() as Animation).name == animation.name && animation.effectScope == AniEffectScope.Upper) {
          // 当前正在播放该动画，重置动画
          this.animationAction?.reset();
          //this.animationAction?.play();
        }
        // 堆中存在该动画，不做操作，不存在该动画时，将该动画进堆
        else if (this.animationHeap.data.filter(ani => ani.name == animation.name).length == 0) {
          // 将该动画插入堆中
          this.animationHeap.insert(animation)
          // 该动画权重最大，直接播放
          if (this.animationHeap.peek() == animation) {
            this.animationAction = this.mixer?.clipAction(clip) as AnimationAction;
            if (this.animationAction) {
              this.animationAction.loop = animation.loop;
              this.animationAction?.stop();
              this.animationAction?.play();
              this.playingAnimation = animation;
            }
          }
        }
      }
      // 堆中无动画
      else {
        // 将该动画插入堆中
        this.animationHeap.insert(animation)

        this.animationAction = this.mixer?.clipAction(clip) as AnimationAction;
        if (this.animationAction) {
          this.animationAction.loop = animation.loop;
          this.animationAction?.stop();
          this.animationAction?.play();
          this.playingAnimation = animation;
        }

      }


    }
  }
}
