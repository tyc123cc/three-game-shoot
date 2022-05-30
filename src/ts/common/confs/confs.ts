import ConfsVar from "./confsVar";

export default class Confs {
  /**
   * 摄像机偏移量
   */
  public static cameraOffsetPos: THREE.Vector3;

  /**
   * 血条偏移量
   */
  public static hpInfoOffsetPos: THREE.Vector3;

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
   * 前进速度
   */
  public static forwardSpeed: number;

  /**
    * 后退速度
    */
  public static backSpeed: number;

  /**
    * 子弹速度
    */
  public static bulletSpeed: number;

  /**
   * 敌人射程
   */
  public static enemyRange: number;

  /**
   * 配置设置项
   */
  public static setting(confVars: ConfsVar) {
    this.cameraOffsetPos = confVars.cameraOffsetPos;
    this.hpInfoOffsetPos = confVars.hpInfoOffsetPos;
    this.bulletHeight = confVars.bulletHeight;
    this.bulletSize = confVars.bulletSize;
    this.characterColliderSize = confVars.characterColliderSize;
    this.forwardSpeed = confVars.forwardSpeed;
    this.backSpeed = confVars.backSpeed;
    this.bulletSpeed = confVars.bulletSpeed;
    this.enemyRange = confVars.enemyRange;
  }
}
