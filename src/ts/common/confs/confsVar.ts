import * as THREE from "three";
import Confs from "./confs";

export default class ConfsVar {
  /**
   * 关卡文件名
   */
  public levelFiles: string[] = [];

  /**
   * 摄像机偏移量
   */
  public cameraOffsetPos: THREE.Vector3 = new THREE.Vector3();

  /**
   * 血条偏移量
   */
  public hpInfoOffsetPos: THREE.Vector3 = new THREE.Vector3();

  /**
   * 第一人称视角下血条偏移值
   */
  public FPSHpInfoOffsetPos: THREE.Vector3 = new THREE.Vector3();

  /**
   * 子弹发射高度
   */
  public bulletHeight: number = 0;

  /**
   * 子弹大小
   */
  public bulletSize: number = 0;

  /**
   * 角色碰撞体的大小
   */
  public characterColliderSize: number = 0;

  /**
   * 前进速度
   */
  public forwardSpeed: number = 0;

  /**
   * 后退速度
   */
  public backSpeed: number = 0;

  /**
   * 子弹速度
   */
  public bulletSpeed: number = 0;

  /**
   * 敌人射程
   */
  public enemyRange: number = 0;

  /**
   * 敌人设计冷却时间
   */
  public enemyShootCD: number = 0;

  /**
   * 敌人复活时间
   */
  public enemyRebirthTime: number = 0;

  /**
   * 玩家复活时间
   */
  public playerRebirthTime: number = 0;

  /**
   * 敌人子弹威力
   */
  public enemyBulletPower: number = 0;

  /**
   * 敌人寻路间隔时间
   */
  public enemyNaviTime: number = 0;

  /**
   * 玩家子弹威力
   */
  public playerBulletPower: number = 0;

  /**
   * 道具大小
   */
  public itemSize: number = 0;

  /**
   * 道具自旋转速度
   */
  public itemRotateSpeed: number = 0;

  /**
   * 道具上下移动速度
   */
  public itemMoveSpeed: number = 0;

  /**
   * 道具离地高度
   */
  public itemHeight: number = 0;

  /**
   * 获得道具后的加血值
   */
  public itemAddHP: number = 0;

  /**
  * 第一人称摄像机高度
  */
  public FPSCameraHeight: number = 0;
}
