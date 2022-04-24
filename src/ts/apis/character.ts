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
import Animation from "./animation";

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

  public animationAction:AnimationAction|null = null;

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
  }

  /**
   *  播放动画
   * @param name 要播放动画的名称
   * @param loop 是否循环
   */
  public play(name: number | string, loop: boolean) {
    let animation = this.animations.filter((value) => value.name == name)[0];
    let clip = animation.animationClip;
    if (clip) {
      this.animationAction = this.mixer?.clipAction(clip) as AnimationAction;
      if (this.animationAction) {
        this.animationAction.loop = loop ? LoopRepeat : LoopOnce;
        this.animationAction?.play();
        this.playingAnimation = animation;
      }
    }
  }
}
