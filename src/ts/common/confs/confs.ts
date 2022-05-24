import ConfsVar from "./confsVar";

export default class Confs {
  /**
   * 摄像机偏移量
   */
  public static cameraOffsetPos: THREE.Vector3;

  /**
   * 子弹发射高度
   */
  public static bulletHeight: number;

  /**
   * 子弹大小
   */
  public static bulletSize: number;

  /**
  * 角色碰撞体的大小
  */
  public static characterColliderSize: number;

  /**
   * 配置设置项
   */
  public static setting(confVars: ConfsVar) {
    this.cameraOffsetPos = confVars.cameraOffsetPos;
    this.bulletHeight = confVars.bulletHeight;
    this.bulletSize = confVars.bulletSize;
    this.characterColliderSize = confVars.characterColliderSize;
  }

}