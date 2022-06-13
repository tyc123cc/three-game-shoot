import * as THREE from "three";
import Confs from "../common/confs/confs";
import SceneRender from "../scene/sceneRender";
import Bullet from "./bullet";

/**
 * 子弹类缓冲池
 */
export default class bulletBufferPool {
  /**
   * 初始化缓冲池的大小
   */
  public pollSize: number;

  /**
   * 子弹的大小
   */
  public bulletSize: number;

  /**
   * 子弹的颜色
   */
  public bulletColor: string;

  /**
   * 子弹的威力
   */
  public power: number = 0;

  public bullets: Bullet[] = [];

  public sceneRender: SceneRender;

  constructor(
    pollSize: number,
    bulletSize: number,
    bulletColor: string,
    power: number,
    sceneRender: SceneRender
  ) {
    this.pollSize = pollSize;
    this.bulletSize = bulletSize;
    this.bulletColor = bulletColor;
    this.power = power;
    this.sceneRender = sceneRender;
    // 初始化缓冲池，为缓冲池添加初始数目的子弹
    for (let i = 0; i < this.pollSize; i++) {
      let bullet = this.generatebullet();
      this.bullets.push(bullet);
      // bullet.fire(this.player?.character?.group?.position, this.player.character.lookPoint.sub(this.player.character.group.position), 5)
    }
  }

  /**
   * 生成子弹
   */
  private generatebullet(): Bullet {
    let geometry = new THREE.SphereBufferGeometry(this.bulletSize);
    let matrials = new THREE.MeshLambertMaterial({ color: this.bulletColor });
    let bulletMesh = new THREE.Mesh(geometry, matrials);
    let bulletGroup = new THREE.Group();
    bulletGroup.add(bulletMesh);
    this.sceneRender.add(bulletGroup, false);
    let bullet = new Bullet(bulletGroup, this.bulletSize, this.power);
    bullet.colliderMeshList = this.sceneRender.collideMeshList;

    return bullet;
  }

  /**
   * 发射子弹
   * @param pos 子弹的初始位置
   * @param moveVec 方向向量
   * @param speed 速度
   */
  public fire(pos: THREE.Vector3, moveVec: THREE.Vector3, speed: number) {
    // 调整高度
    pos.y = Confs.bulletHeight;
    // 获得空闲子弹
    let bullet: Bullet | null = null;
    for (let bul of this.bullets) {
      // 获得第一个不可见子弹，作为当前发射子弹
      if (!bul.group.visible) {
        bullet = bul;
        break;
      }
    }
    if (!bullet) {
      // 缓冲池中无空闲子弹
      // 生成新子弹
      bullet = this.generatebullet();
      // 将新子弹加入缓冲池
      this.bullets.push(bullet);
    }
    // 发射子弹
    bullet.fire(pos, moveVec, speed);
  }

  clear(){
    for(let bullet of this.bullets){
      bullet.clear();
    }
    this.bullets = [];
  }
}
