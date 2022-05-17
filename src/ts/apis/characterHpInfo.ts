import THREE, { Vector2 } from "three";

/**
 * 角色的血量信息 为血量条的显示提供信息
 */
export default class CharacterHpInfo  {

    /**
     * 角色的名称
     */
    public name:string = "";

    /**
     * 血量条在屏幕中的位置
     */
    public screenPos: Vector2 = new Vector2();

    /**
     * 是否显示血量条
     */
    public isShow: boolean = false;

    /**
     * 当前血量
     */
    public hp:number = 100;

    /**
     * 最大血量
     */
    public maxHp:number = 100;

    constructor(name:string){
        this.name = name;
    }
}