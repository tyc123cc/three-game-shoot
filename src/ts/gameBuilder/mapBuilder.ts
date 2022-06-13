import * as THREE from "three";
import SceneRender from "../scene/sceneRender";
import BaseThree from "../common/baseThree";
import Map, { Enemies } from "../apis/map";
import { Walls } from "../apis/map";
import { Group, Material, Mesh, Texture } from "three";

export default class MapBuilder extends BaseThree {
  public sceneRender: SceneRender;

  public map: Map;

  public group: Mesh | null = null;

  public wallColor: number = 0x0099ff;

  public wallHeight: number = 10;

  public wallOpacity: number = 0.4;

  public mapGroup: Group | null = null;

  public playerInitPos: THREE.Vector3 = new THREE.Vector3();

  public enemies: Array<Enemies> = []

  constructor(map: Map, sceneRender: SceneRender) {
    super();
    this.map = map;
    this.sceneRender = sceneRender;
    this.enable();
  }

  start(): void {
    this.mapGroup = new Group();
    // 建造地板
    this.createGroup();
    this.createWalls();
    if (this.mapGroup) {
      this.sceneRender.add(this.mapGroup)
    }
    this.setPlayerInitPos();
    this.setEnemies();
  }

  /**
   * 设置敌人信息
   */
  setEnemies() {
    this.enemies = this.map.enemies;
  }


  /**
   * 设置主角初始位置
   */
  setPlayerInitPos() {
    this.playerInitPos = new THREE.Vector3(
      this.map.initPos.x,
      0,
      this.map.initPos.y
    );
  }

  /**
   * 建造地板
   */
  createGroup() {
    var geometry = new THREE.PlaneGeometry(this.map.width, this.map.height);
    var material = new THREE.MeshLambertMaterial({
      color: 0x555555 /*side: THREE.DoubleSide*/,
    });
    var groud = new THREE.Mesh(geometry, material);
    groud.name = "groud"
    // 地板需要面向天空
    groud.rotateX((-90 / 180) * Math.PI);
    this.sceneRender.add(groud, false);
    this.group = groud;
    //this.mapGroup?.add(groud);
  }

  /**
   * 建造墙壁
   */
  createWalls() {
    // 建造边缘墙壁
    this.createLimitWalls();
    this.createMapWalls();
  }

  /**
   * 建造地图墙壁
   */
  createMapWalls() {
    let walls: Walls[] = this.map.walls;
    walls.forEach((wallDate) => {
      var box = new THREE.BoxGeometry(
        wallDate.width,
        this.wallHeight,
        wallDate.height
      );
      var material = new THREE.MeshLambertMaterial({
        color: this.wallColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: this.wallOpacity,
      });
      var wall = new THREE.Mesh(box, material);
      wall.position.set(
        wallDate.position.x,
        this.wallHeight / 2,
        wallDate.position.y
      );
      wall.name = "walls";
      //this.sceneRender.add(wall);
      this.mapGroup?.add(wall);
    });
  }

  /**
   * 建造地图边缘墙壁
   */
  createLimitWalls() {
    // 上边缘墙壁
    var geometry = new THREE.PlaneGeometry(this.map.width, this.wallHeight);
    var material = new THREE.MeshLambertMaterial({
      color: this.wallColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: this.wallOpacity,
    });
    var walls = new THREE.Mesh(geometry, material);
    walls.position.z -= this.map.height / 2;
    walls.position.y += this.wallHeight / 2;
    walls.name = "walls";
    //this.sceneRender.add(walls);
    this.mapGroup?.add(walls);

    // 下边缘墙壁
    var geometry = new THREE.PlaneGeometry(this.map.width, this.wallHeight);
    var material = new THREE.MeshLambertMaterial({
      color: this.wallColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: this.wallOpacity,
    });
    var walls = new THREE.Mesh(geometry, material);
    walls.position.z += this.map.height / 2;
    walls.position.y += this.wallHeight / 2;
    walls.name = "walls";
    //this.sceneRender.add(walls);
    this.mapGroup?.add(walls);

    // 左边缘墙壁
    var geometry = new THREE.PlaneGeometry(this.map.height, this.wallHeight);
    var material = new THREE.MeshLambertMaterial({
      color: this.wallColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: this.wallOpacity,
    });
    var walls = new THREE.Mesh(geometry, material);
    walls.rotateY((-90 / 180) * Math.PI);
    walls.position.x -= this.map.width / 2;
    walls.position.y += this.wallHeight / 2;
    walls.name = "walls";
    //this.sceneRender.add(walls);
    this.mapGroup?.add(walls);

    // 右边缘墙壁
    var geometry = new THREE.PlaneGeometry(this.map.height, this.wallHeight);
    var material = new THREE.MeshLambertMaterial({
      color: this.wallColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: this.wallOpacity,
    });
    var walls = new THREE.Mesh(geometry, material);
    walls.rotateY((-90 / 180) * Math.PI);
    walls.position.x += this.map.width / 2;
    walls.position.y += this.wallHeight / 2;
    walls.name = "walls";
    //this.sceneRender.add(walls);
    this.mapGroup?.add(walls);
  }

  clear() {
    super.clear()
    if (this.mapGroup) {
      this.mapGroup.traverse(function (item) {
        if (item instanceof Mesh) {
          item.geometry.dispose(); // 删除几何体
          for (let key in item.material) {
            if (item.material[key] instanceof Texture) {
              item.material[key].dispose(); // 释放纹理
            }
          }
          item.material.dispose(); // 删除材质
        }
      });
    }
    this.group?.geometry.dispose();
    (this.group?.material as Material).dispose();
    this.mapGroup = null;
  }
  update(): void { }
}
