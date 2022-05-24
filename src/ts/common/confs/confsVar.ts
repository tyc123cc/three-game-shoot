import * as THREE from "three";
import Confs from "./confs";

export default class ConfsVar{
    /**
     * 摄像机偏移量
     */
     public cameraOffsetPos:THREE.Vector3 = new THREE.Vector3();

     /**
      * 子弹发射高度
      */
     public bulletHeight:number = 0;

    

}