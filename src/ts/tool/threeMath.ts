import * as THREE from "three";
import Confs from "../common/confs/confs";

export default class ThreeMath {
  /**
   * 三维坐标转屏幕坐标
   * @param vec 三维坐标
   * @param camera 摄像机
   * @returns 屏幕坐标
   */
  public static createVector(vec: THREE.Vector3, camera: THREE.Camera) {
    var p = vec.clone();
    // 设置偏移值
    p.x += Confs.hpInfoOffsetPos.x;
    p.y += Confs.hpInfoOffsetPos.y;
    var vector = p.project(camera);
    vector.x =
      ((vector.x + 1) / 2) * window.innerWidth +
      (vec.x + 11 - camera.position.x) * 0;
    vector.y =
      (-(vector.y - 1) / 2) * window.innerHeight -
      (vec.z + 37.5 - camera.position.z) * 1.1;
    return new THREE.Vector2(vector.x, vector.y);
  }

  /**
   * 计算线段与平面的交点
   * @param planeVector 平面的法向量
   * @param planePoint 平面的一点
   * @param lineVector 线段的方向向量
   * @param linePoint 线段的一点
   * @returns
   */
  public static CalPlaneLineIntersectPoint(
    planeVector: THREE.Vector3,
    planePoint: THREE.Vector3,
    lineVector: THREE.Vector3,
    linePoint: THREE.Vector3
  ) {
    let returnResult = new THREE.Vector3(0, 0, 0);
    let vpt =
      lineVector.x * planeVector.x +
      lineVector.y * planeVector.y +
      lineVector.z * planeVector.z;
    //首先判断直线是否与平面平行
    if (vpt == 0) {
      return returnResult;
    } else {
      let t =
        ((planePoint.x - linePoint.x) * planeVector.x +
          (planePoint.y - linePoint.y) * planeVector.y +
          (planePoint.z - linePoint.z) * planeVector.z) /
        vpt;
      returnResult.x = linePoint.x + lineVector.x * t;
      returnResult.y = linePoint.y + lineVector.y * t;
      returnResult.z = linePoint.z + lineVector.z * t;
    }
    return returnResult;
  }

  /**
   * 将向量根据y轴偏移角度
   * @param vec 需要偏移的向量
   * @param radian 需要偏移的弧度
   *
   * @returns 偏移后的向量
   */
  public static changeAngleFromYAxis(
    vec: THREE.Vector3,
    radian: number
  ): THREE.Vector3 {
    if (vec.x !== 0 || vec.z !== 0) {
      var x = vec.x;
      var y = vec.z;
      var tha1 = radian;

      var value = Math.sqrt(x * x + y * y);

      var cos1 = x / value;
      var sin1 = y / value;

      var cos2 = Math.cos(tha1);
      var sin2 = Math.sin(tha1);

      var cos3 = cos1 * cos2 - sin1 * sin2;
      var sin3 = sin1 * cos2 + cos1 * sin2;

      return new THREE.Vector3(value * cos3, vec.y, value * sin3);
    }
    return vec;
  }

  /**
   * 将number值精细化
   * @param number 数值
   * @param percision 精细化的程度
   * @returns 精细化后的值
   */
  public static toPrecision(number: number, percision: number): number {
    return Math.round((number + Number.EPSILON) * percision) / percision;
  }

  /**
   * 二维坐标点是否在长方形范围内
   * @param pos 坐标点
   * @param leftTopPos 长方形的左上角
   * @param rightBottomPos 长方形的右下角
   * @returns 
   */
  public static posInScope(
    pos: THREE.Vector2,
    leftTopPos: THREE.Vector2,
    rightBottomPos: THREE.Vector2
  ) {
    return (
      pos.x > leftTopPos.x &&
      pos.x < rightBottomPos.x &&
      pos.y > rightBottomPos.y &&
      pos.y < leftTopPos.y
    );
  }
}
