import ConfsVar from "./confsVar";

export default class Confs{
    /**
     * 摄像机偏移量
     */
    public static cameraOffsetPos:THREE.Vector3;

    /**
     * 子弹发射高度
     */
    public static bulletHeight:number;

     /**
      * 配置设置项
      */
      public static setting(confVars:ConfsVar){
        this.cameraOffsetPos = confVars.cameraOffsetPos;
        this.bulletHeight = confVars.bulletHeight;
     }

}