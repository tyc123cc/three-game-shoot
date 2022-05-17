import { AniEffectScope, AniStatus } from "./enum";
import { AnimationClip, Group } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

/**
 * 动画类
 */
export default class Animation {
  /**
   * 动画的地址
   */
  public url: string;

  public name: string;

  /**
   * 需要播放的动画的索引
   */
  public aniIndex: number;

  /**
   * 动画影响范围
   */
  public effectScope: AniEffectScope;

  /**
   * 动画的权重
   */
  public weight: number;

  /**
   * 动画clip
   */
  public animationClip: THREE.AnimationClip | null = null;

  public loop: THREE.AnimationActionLoopStyles;

  /**
   *
   * @param url  动画的地址
   * @param name 动画的名称
   * @param aniIndex 需要播放的动画的索引
   * @param effectScope 动画影响范围
   * @param loop 动画的循环方式
   * @param weight 动画的权重
   * @param onLoad 加载完毕调用函数
   * @param onProgress 加载中调用函数
   * @param onError 加载失败调用函数
   */
  constructor(
    url: string,
    name: string,
    aniIndex: number,
    effectScope: AniEffectScope,
    loop: THREE.AnimationActionLoopStyles,
    weight: number,
    onLoad: (object: Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ) {
    this.url = url;
    this.aniIndex = aniIndex;
    this.effectScope = effectScope;
    this.name = name;
    this.loop = loop;
    this.weight = weight;
    let loader = new FBXLoader();
    loader.load(
      url,
      (object) => {
        // 设置动画clip
        this.animationClip = object.animations[aniIndex];
        onLoad(object);
      },
      onProgress,
      onError
    );
  }

  /**
   * 将动画影响范围枚举转变为动画状态
   * @param scope 动画影响范围
   * @returns 动画状态
   */
  public static changeAnimationEffectScopeToStatus(
    scope: AniEffectScope
  ): AniStatus {
    switch (scope) {
      // 全身
      case AniEffectScope.All:
        return AniStatus.All;
      // 下半身
      case AniEffectScope.Lower:
        return AniStatus.Lower;
      // 上半身
      case AniEffectScope.Upper:
        return AniStatus.Upper;
      case AniEffectScope.Death:
        return AniStatus.Death;
      default:
        return AniStatus.Null;
    }
  }
}
