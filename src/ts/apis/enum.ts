/**
 * 动画影响范围
 */
export enum AniEffectScope{
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
    All
}

/**
 * 动画播放状态
 */
 export enum AniStatus{
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
    UpperAndLower
}