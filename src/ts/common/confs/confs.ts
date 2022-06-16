import { CameraMode } from "@/ts/apis/enum";
import ConfsVar from "./confsVar";

export default class Confs {
  /**
   * store方法重置进度
   */
  public static readonly STORE_RESETPROCESS = "resetProcess";

  /**
   * store方法玩家死亡
   */
  public static readonly STORE_DEATH = "death";

  /**
   * store方法增加进度
   */
  public static readonly STORE_ADDPROCESS = "addProcess";

  /**
   * 是否点击了UI
   */
  public static CLICKUI = false;

  /**
   * 游戏是否是暂停状态
   */
  public static PAUSED: boolean = false;

  /**
   * 摄像机模式
   */
  public static CAMERA_MODE: CameraMode = CameraMode.TPS;

  /**
   * 关卡文件名
   */
  public static levelFiles: string[];

  /**
   * 摄像机偏移量
   */
  public static cameraOffsetPos: THREE.Vector3;

  /**
   * 血条偏移量
   */
  public static hpInfoOffsetPos: THREE.Vector3;

  /**
   * 第一人称视角下血条偏移值
   */
  public static FPSHpInfoOffsetPos: THREE.Vector3;

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
   * 敌人寻路间隔时间
   */
  public static enemyNaviTime: number;

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
   * 第一人称摄像机高度
   */
  public static FPSCameraHeight: number;

  /**
   * 天空盒图片路径
   */
  public static skyboxPath:string[];

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
    this.levelFiles = confVars.levelFiles;
    this.enemyNaviTime = confVars.enemyNaviTime;
    this.FPSCameraHeight = confVars.FPSCameraHeight;
    this.FPSHpInfoOffsetPos = confVars.FPSHpInfoOffsetPos;
    this.skyboxPath = confVars.skyboxPath;
  }
}
