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
   * 敌人设计冷却时间
   */
  public static enemyShootCD: number;

  /**
   * 敌人复活时间
   */
  public static enemyRebirthTime: number;

  /**
   * 玩家复活时间
   */
  public static playerRebirthTime: number;

  /**
   * 敌人子弹威力
   */
  public static enemyBulletPower: number;

  /**
   * 玩家子弹威力
   */
  public static playerBulletPower: number;

  /**
   * 道具大小
   */
  public static itemSize: number;

  /**
 * 道具自旋转速度
 */
  public static itemRotateSpeed: number;


  /**
   * 道具上下移动速度
   */
  public static itemMoveSpeed: number;

  /**
   * 道具离地高度
   */
  public static itemHeight: number;

  /**
   * 获得道具后的加血值
   */
  public static itemAddHP: number;

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
    this.enemyShootCD = confVars.enemyShootCD;
    this.enemyRebirthTime = confVars.enemyRebirthTime;
    this.playerRebirthTime = confVars.playerRebirthTime;
    this.enemyBulletPower = confVars.enemyBulletPower;
    this.playerBulletPower = confVars.playerBulletPower;
    this.itemSize = confVars.itemSize;
    this.itemRotateSpeed = confVars.itemRotateSpeed;
    this.itemMoveSpeed = confVars.itemMoveSpeed;
    this.itemHeight = confVars.itemHeight;
    this.itemAddHP = confVars.itemAddHP;
  }
}
