import { Vector3 } from "three";
import BaseThree from "../common/baseThree";
import Confs from "../common/confs/confs";
import SceneRender from "../scene/sceneRender";
import Item from "./item";

export default class ItemBufferPoll extends BaseThree {
  /**
  * 初始化缓冲池的大小
  */
  public pollSize: Number;

  /**
   * 道具的大小
   */
  public itemSize: number;

  /**
   * 道具离地高度
   */
  public height: number;

  /**
   * 道具的纹理路径
   */
  public textureUrl: string;


  public items: Item[] = [];

  public sceneRender: SceneRender;

  constructor(pollSize: number, itemSize: number, textureUrl: string, height: number, sceneRender: SceneRender) {
    super()
    this.pollSize = pollSize;
    this.itemSize = itemSize;
    this.textureUrl = textureUrl;
    this.height = height;
    this.sceneRender = sceneRender;
    this.enable();
  }

  start() {
    this.initPool();
  }

  clear() {
    this.items.forEach(item => {
      item.clear();
    })
  }

  /**
   * 为缓冲池添加道具
   */
  private initPool() {
    for (let i in this.pollSize) {
      let item = new Item("item" + i, this.itemSize, this.textureUrl, this.height, this.sceneRender);
      item.rotateSpeed = Confs.itemRotateSpeed;
      item.moveSpeed = Confs.itemMoveSpeed;
      item.generateItem(false);
      this.items.push(item);
    }
  }

  /**
 * 生成道具
 */
  public generateItem(pos: Vector3): Item {
    let item: Item | null = null;
    for (let it of this.items) {
      // 找到缓冲池中空闲的道具
      if (!it.mesh?.visible) {
        item = it;
      }
    }
    if (!item) {
      // 缓冲池中无空闲道具
      item = new Item("item" + this.items.length, this.itemSize, this.textureUrl, this.height, this.sceneRender);
      item.rotateSpeed = Confs.itemRotateSpeed;
      item.moveSpeed = Confs.itemMoveSpeed;
      item.generateItem(true, pos);
      this.items.push(item);
    }
    if (item.mesh) {
      // 设置道具位置
      item.setPosition(pos);
    }
    return item;
  }

  update() {

  }

}