import { BoxBufferGeometry, Material, Mesh, MeshLambertMaterial, Texture, TextureLoader, Vector3 } from "three";
import BaseThree from "../common/baseThree";
import Confs from "../common/confs/confs";
import SceneRender from "../scene/sceneRender";

export default class Item extends BaseThree {
  /**
   * 道具的大小
   */
  public size: number;

  /**
   * 纹理
   */
  public texture: Texture | null;

  /**
   * 自旋转速度
   */
  public rotateSpeed: number = 0;


  /**
   * 上下移动速度
   */
  public moveSpeed: number = 0;

  /**
   * 离地高度
   */
  public height: number;

  public name: string;

  public sceneRender: SceneRender;

  public mesh: Mesh | null = null;

  public colliderMesh: Mesh | null = null;

  /**
   * 最低高度
   */
  public minHeight: number = 0;

  /**
   * 最高高度
   */
  public maxHeight: number = 0;

  /**
   * 是否正在上升
   */
  public isUpper: boolean = true;

  getItemEvent: (e: Event) => void = this.getItem.bind(this)

  constructor(name: string, size: number, texture: Texture, height: number, sceneRender: SceneRender) {
    super();
    this.name = name;
    this.size = size;
    this.texture = texture;
    this.height = height;
    this.minHeight = this.size / 2 + height / 2;
    this.maxHeight = this.size / 2 + height * 1.5;
    this.sceneRender = sceneRender;
    this.enable();
  }

  start() {
    document.addEventListener("getItem", this.getItemEvent);
  }

  clear() {
    super.clear()
    document.removeEventListener("getItem", this.getItemEvent);
    this.mesh?.geometry.dispose();
    if (this.mesh) {
      let material = this.mesh.material as Material;
      for (let key in material) {
        if ((material as any)[key] instanceof Texture) {
          (material as any)[key].dispose(); // 释放纹理
        }
      }
    }

    (this.mesh?.material as Material).dispose();
    this.colliderMesh?.geometry.dispose();
    (this.colliderMesh?.material as Material).dispose();
    this.colliderMesh = null;
  }

  /**
   * 获得道具事件
   * @param e 
   */
  getItem(e: Event) {
    let ev = e as CustomEvent
    // 获得道具的名字与该道具名字相同，表明获得的道具为该道具本身
    if (ev.detail.name == this.name) {
      this.unVisible();
    }
  }

  /**
   * 将该道具置为不可见
   */
  unVisible() {
    if (this.mesh) {
      this.mesh.visible = false;
    }
    if (this.colliderMesh) {
      this.colliderMesh.position.y = -100;
    }
  }

  /**
   * 生成道具
   */
  generateItem(visible: boolean = true, pos?: Vector3) {
    let geometry = new BoxBufferGeometry(this.size, this.size, this.size);
    // 执行load方法，加载纹理贴图成功后，返回一个纹理对象Texture
    let material = new MeshLambertMaterial({
      // 设置颜色纹理贴图：Texture对象作为材质map属性的属性值
      map: this.texture,//设置颜色贴图属性值
    }); //材质对象Material
    let mesh = new Mesh(geometry, material); //网格模型对象Mesh
    mesh.name = this.name;
    mesh.visible = visible;
    if (pos) {
      mesh.position.set(pos.x, pos.y, pos.z);
    }
    mesh.position.y = this.size / 2 + this.height;
    this.mesh = mesh;
    this.sceneRender.add(mesh, false); //网格模型添加到场景中
    let colliderGeometry = new BoxBufferGeometry(this.size, this.size, this.size);
    let collidermaterial = new MeshLambertMaterial(); //材质对象Material
    this.colliderMesh = new Mesh(colliderGeometry, collidermaterial);
    this.colliderMesh.name = this.name;
    // 将碰撞体的坐标下沉，使其在初始化时不会被碰撞
    this.colliderMesh.position.y = -100;
    if (pos) {
      this.colliderMesh.position.set(pos.x, 0, pos.z);
    }
    this.sceneRender.setCollider(this.colliderMesh);


  }

  setPosition(pos: Vector3) {
    if (this.mesh) {
      this.mesh.visible = true;
      this.mesh.position.set(pos.x, this.mesh.position.y, pos.z);
    }
    if (this.colliderMesh) {
      this.colliderMesh.position.set(pos.x, 0, pos.z);
    }
  }

  update() {
    this.move();
    this.rotate();
  }

  /**
   * 物体上下移动
   */
  move() {
    if (this.isUpper && this.mesh) {
      // 物体向上移动
      this.mesh.position.y += this.moveSpeed * this.deltaTime;
      // 达到最高高度，开始向下移动
      if (this.mesh.position.y >= this.maxHeight) {
        this.isUpper = false;
      }
    }
    else if (this.mesh) {
      // 物体向下移动
      this.mesh.position.y -= this.moveSpeed * this.deltaTime;
      // 达到最低高度，开始向上移动
      if (this.mesh.position.y <= this.minHeight) {
        this.isUpper = true;
      }
    }
  }

  /**
   * 物体自旋转
   */
  rotate() {
    this.mesh?.rotateY(this.rotateSpeed * this.deltaTime)
  }
}