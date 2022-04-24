import { Group } from "three";
import { AniEffectScope } from "./enum";

/**
 * 构建动画的入参，将构建动画需要的参数封装于此类
 */
export default class AnimationInput {
  /**
   * 动画的地址
   */
  public url: string;

  /**
   * 需要播放的动画索引
   */
  public aniIndex: number;

  /**
   * 动画的名称
   */
  public name: string;

  /**
   * 动画的影响范围
   */
  public effectScope: AniEffectScope;

  /**
   * 动画的权重
   */
  public weight: number;

  onLoad?: (object: Group) => void;
  onProgress?: (event: ProgressEvent) => void;
  onError?: (event: ErrorEvent) => void;

  constructor(
    url: string,
    aniIndex: number,
    name: string,
    effectScope: AniEffectScope,
    weight: number,
    onLoad?: (object: Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ) {
    this.url = url;
    this.name = name;
    this.aniIndex = aniIndex;
    this.effectScope = effectScope;
    this.weight = weight;

    this.onLoad = onLoad;
    this.onProgress = onProgress;
    this.onError = onError;
  }
}
