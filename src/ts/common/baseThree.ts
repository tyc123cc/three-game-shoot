import { Clock } from "three";
import Confs from "./confs/confs";

/**
 * 公共方法
 */
export default abstract class BaseThree {
  // 创建一个时钟对象Clock
  private clock: Clock = new Clock();

  /**
   * 是否已被清理
   */
  public isCleared = false;

  /**
   * 每帧时间
   */
  public deltaTime: number = this.clock.getDelta();
  /**
   * 初始化完毕后调用该方法，保证start和update函数可以正常执行
   */
  public enable() {
    this.start();
    this.ani();
  }

  /**
   * 类可用时调用该方法
   */
  abstract start(): void;

  private ani() {
    if (!this.isCleared) {
      // 每帧调用
      requestAnimationFrame(this.ani.bind(this));
    }

    // 更新每帧时间
    this.deltaTime = this.clock.getDelta();
    // 10帧以下不执行update
    if (!this.isCleared && !Confs.PAUSED && this.deltaTime < 0.1) {
      // update主方法
      this.update();
    }
  }
  /**
   * 每帧都会调用该方法
   */
  abstract update(): void;
}
