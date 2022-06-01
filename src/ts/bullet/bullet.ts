import BaseThree from "../common/baseThree";
import * as THREE from "three";
import { Group } from "three";

/**
 * 角色射击的子弹类
 */
export default class Bullet extends BaseThree {
  /**
   * 子弹的group
   */
  public group: THREE.Group;

  /**
   * 子弹的速度
   */
  public speed: number = 0;

  /**
   * 子弹的威力
   */
  public power: number = 0;

  /**
   * 子弹的移动方向
   */
  public moveVec: THREE.Vector3 = new THREE.Vector3();

  /**
   * 子弹的大小
   */
  public size: number;

  /**
   * 碰撞体的list
   */
  public colliderMeshList: THREE.Object3D[] = [];

  constructor(group: THREE.Group, size: number, power: number) {
    super();
    this.group = group;
    this.size = size;
    this.power = power;
    this.enable();
  }

  /**
   * 发射子弹
   *
   * @param pos 子弹的起始位置
   * @param moveVec 发射的方向
   * @param speed 子弹的速度
   */
  public fire(pos: THREE.Vector3, moveVec: THREE.Vector3, speed: number) {
    // 将group置为可见
    this.group.visible = true;
    // 设置group的位置
    this.group.position.copy(pos);
    this.moveVec = moveVec.clone().normalize();
    this.speed = speed;
  }

  start(): void {
    // 初始化时将group置为不可见
    this.group.visible = false;
  }
  update(): void {
    // 子弹开始移动
    if (this.speed > 0) {
      let target: string | null = this.intersect();
      if (target) {
        // 子弹碰到了其他目标,触发事件
        const sendEvent = new CustomEvent("hit", {
          detail: {
            target,
            power: this.power
          },
        });
        // 发送事件
        document.dispatchEvent(sendEvent)
        // 将物体置为不可见
        this.group.visible = false;
        this.speed = 0;
      }
      // 向移动方向移动
      this.group.position.add(
        this.moveVec.clone().multiplyScalar(this.speed * this.deltaTime)
      );
      //console.log(this.group.position)
    }
  }

  /**
   * 检测子弹是否与其他物体相碰撞
   * @returns
   */
  intersect(): string | null {
    let rayLength = this.size;
    let colliderScope = 20 * this.deltaTime;
    let directVec = this.moveVec.clone();

    let originPos = new THREE.Vector3(
      this.group.position.x,
      this.group.position.y,
      this.group.position.z
    );
    var raycaster = new THREE.Raycaster(originPos, directVec, 0, colliderScope);

    let originPos1 = new THREE.Vector3(
      this.group.position.x + rayLength,
      this.group.position.y,
      this.group.position.z + rayLength
    );
    var raycaster1 = new THREE.Raycaster(
      originPos1,
      directVec,
      0,
      colliderScope
    );

    let originPos2 = new THREE.Vector3(
      this.group.position.x + rayLength,
      this.group.position.y,
      this.group.position.z - rayLength
    );
    var raycaster2 = new THREE.Raycaster(
      originPos2,
      directVec,
      0,
      colliderScope
    );

    let originPos3 = new THREE.Vector3(
      this.group.position.x - rayLength,
      this.group.position.y,
      this.group.position.z + rayLength
    );
    var raycaster3 = new THREE.Raycaster(
      originPos3,
      directVec,
      0,
      colliderScope
    );

    let originPos4 = new THREE.Vector3(
      this.group.position.x - rayLength,
      this.group.position.y,
      this.group.position.z - rayLength
    );
    var raycaster4 = new THREE.Raycaster(
      originPos4,
      directVec,
      0,
      colliderScope
    );

    // 计算射线和参数1中的模型对象是否相交，参数1数组中可以设置多个模型模型对象，下面参数只设置了立方体网格模型
    var intersects = raycaster.intersectObjects(this.colliderMeshList);
    if (intersects.length > 0) {
      return intersects[0].object.name;
    }

    // 计算射线和参数1中的模型对象是否相交，参数1数组中可以设置多个模型模型对象，下面参数只设置了立方体网格模型
    var intersects = raycaster1.intersectObjects(this.colliderMeshList);
    if (intersects.length > 0) {
      return intersects[0].object.name;
    }

    // 计算射线和参数1中的模型对象是否相交，参数1数组中可以设置多个模型模型对象，下面参数只设置了立方体网格模型
    var intersects = raycaster2.intersectObjects(this.colliderMeshList);
    if (intersects.length > 0) {
      return intersects[0].object.name;
    }

    // 计算射线和参数1中的模型对象是否相交，参数1数组中可以设置多个模型模型对象，下面参数只设置了立方体网格模型
    var intersects = raycaster3.intersectObjects(this.colliderMeshList);
    if (intersects.length > 0) {
      return intersects[0].object.name;
    }

    // 计算射线和参数1中的模型对象是否相交，参数1数组中可以设置多个模型模型对象，下面参数只设置了立方体网格模型
    var intersects = raycaster4.intersectObjects(this.colliderMeshList);
    if (intersects.length > 0) {
      return intersects[0].object.name;
    }

    return null;
  }
}
