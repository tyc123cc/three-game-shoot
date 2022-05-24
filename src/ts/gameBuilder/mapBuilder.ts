import * as THREE from "three";
import SceneRender from "../scene/sceneRender";
import BaseThree from "../common/baseThree";
import Map, { Enemies } from "../apis/map";
import { Walls } from "../apis/map";

export default class MapBuilder extends BaseThree {
  public sceneRender: SceneRender;

  public map: Map;

  public wallColor: number = 0x0099ff;

  public wallHeight: number = 10;

  public wallOpacity: number = 0.4;

  public playerInitPos: THREE.Vector3 = new THREE.Vector3();

  public Enemies:Array<Enemies> = []

  constructor(map: Map, sceneRender: SceneRender) {
    super();
    this.map = map;
    this.sceneRender = sceneRender;
    this.enable();
  }

  start(): void {
    // 建造地板
    this.createGroup();
    this.createWalls();
    this.setPlayerInitPos();
    this.setEnemies();
  }

  /**
   * 设置敌人信息
   */
  setEnemies(){
    this.Enemies = this.map.enemies;
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
    // 地板需要面向天空
    groud.rotateX((-90 / 180) * Math.PI);
    this.sceneRender.add(groud, false);
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
      this.sceneRender.add(wall);
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
    this.sceneRender.add(walls);

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
    this.sceneRender.add(walls);

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
    this.sceneRender.add(walls);

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
    this.sceneRender.add(walls);
  }
  update(): void {}
}
