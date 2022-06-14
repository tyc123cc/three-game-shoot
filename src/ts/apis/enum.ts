/**
 * 动画影响范围
 */
export enum AniEffectScope {
  /**
   * 上半身
   */
  Upper,
  /**
   * 下半身
   */
  Lower,
  /**
   * 全身
   */
  All,
  /**
   * 死亡动画，最高优先级
   */
  Death
}

/**
 * 动画播放状态
 */
export enum AniStatus {
  /**
   * 未播放动画
   */
  Null,
  /**
   * 仅播放上半身
   */
  Upper,
  /**
   * 仅播放下半身
   */
  Lower,
  /**
   * 仅播放全身
   */
  All,
  /**
   * 播放上半身和下半身的融合动画
   */
  UpperAndLower,
  /**
  * 死亡动画，最高优先级
  */
  Death
}

/**
 * 角色状态
 */
export enum CharacterStatus {
  /**
   * 存活
   */
  Alive,
  /**
   * 死亡
   */
  Death
}

/**
 * 摄像机模式
 */
export enum CameraMode {
  /**
   * 第一人称视角
   */
  FPS,
  /**
   * 第三人称视角
   */
  TPS
}