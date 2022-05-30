import gsap from "gsap";
import * as THREE from "three";
import AnimationInput from "../apis/animationInput";
import Character from "../apis/character";
import CharacterHpInfo from "../apis/characterHpInfo";
import { AniEffectScope, CharacterStatus } from "../apis/enum";
import bulletBufferPool from "../bullet/bulletBufferPool";
import BaseThree from "../common/baseThree";
import Confs from "../common/confs/confs";
import SceneRender from "../scene/sceneRender";
import ThreeMath from "../tool/threeMath";
import AStar from "./AStar";
import CharacterBuilder from "./characterBuilder";
import MapBuilder from "./mapBuilder";
import PlayerAndEnemyCommonBuilder from "./playerAndEnemyCommonBuilder";

export default class EnemyBuilder extends PlayerAndEnemyCommonBuilder {
  enemy: CharacterBuilder | null = null;
  collider: THREE.Mesh | null = null;
  mousePoint: THREE.Vector2 = new THREE.Vector2();
  mapBuilder: MapBuilder;
  target: PlayerAndEnemyCommonBuilder;
  lookPoint: THREE.Vector3 = new THREE.Vector3();

  tweenTarget: gsap.core.Tween | null = null;


  name: string

  onUpKeyDown: boolean = false;
  onDownKeyDown: boolean = false;
  onLeftKeyDown: boolean = false;
  onRightKeyDown: boolean = false;

  /**
   * 玩家的血量信息
   */
  characterHpInfo: CharacterHpInfo | null = null;

  navigation: AStar | null = null;


  constructor(name: string, target: PlayerAndEnemyCommonBuilder, sceneRender: SceneRender, camera: THREE.Camera, bulletPool: bulletBufferPool, mapBuilder: MapBuilder, initPos?: THREE.Vector3) {
    super(
      name,
      "character/Enemy.fbx",
      "character/animate/player/Run Forward.fbx",
      "character/animate/player/Walk Backward.fbx",
      "character/animate/player/hit reaction.fbx",
      "character/animate/player/rifle aiming idle.fbx",
      "character/animate/player/Dying.fbx",
      sceneRender,
      camera,
      (object) => {
        this.enemy = this.characterBuilder
        if (this.enemy?.character) {
          // 关闭敌人的碰撞功能，使敌人在移动时不检测碰撞
          this.enemy.character.colliderSwitch = false;

        }
        this.navigation = new AStar(this.mapBuilder.map, this.sceneRender.collideMeshList, this.name, target.name, 1)

      },
      bulletPool,
      initPos
    );
    this.name = name;
    this.mapBuilder = mapBuilder;
    this.target = target;
    this.enable();
  }



  start() {
    super.start();
  }


  update() {
    super.update();
    if (this.characterStatus == CharacterStatus.Alive) {
      this.updateLookPoint();
      let isShoot = this.shoot();
      if (!isShoot) {
        // 不可射击时进行寻路操作
        this.navi();
      }
    }

  }

  updateLookPoint() {

    if (this.enemy?.character?.targetPos && this.enemy.character.group &&
      this.enemy.character.group.position.distanceTo(this.enemy.character.targetPos) > 0.02) {
      // 在移动过程中，面向移动点，播放跑步动画
      this.characterBuilder?.play("run");
    }
    else if (this.target.characterBuilder?.character?.group) {
      // 非移动过程中，面向目标点，播放待机动画
      // 停止转向动画，直接面向角色
      if (this.tweenTarget) {
        gsap.killTweensOf(this.tweenTarget)
        this.tweenTarget = null;
      }
      this.lookPoint = this.target.characterBuilder.character.group.position;
      this.characterBuilder?.lookAt(this.lookPoint);
      this.characterBuilder?.play("idle");
    }


  }


  shoot() {
    if (this.canShoot()) {

      return true;
    }
    return false;
  }

  canShoot(): boolean {
    if (this.characterBuilder?.character?.group && this.target.characterBuilder?.character?.group) {

      let enemyPos = this.characterBuilder.character.group.position;
      let targetPos = this.target.characterBuilder.character.group.position;
      let directLength = targetPos.distanceTo(enemyPos);
      if (directLength > Confs.enemyRange) {
        // 目标与该敌人距离超过射程，无法射击
        return false;
      }

      let directVec = targetPos.clone().sub(enemyPos).normalize();


      let raycaster = new THREE.Raycaster(enemyPos, directVec, 0, directLength);
      let meshList = this.sceneRender.collideMeshList.filter((obj) => {
        // 去除该敌人和目标，判断当前敌人和目标之间是否有障碍物
        return obj.name != this.name + "collider" && obj.name != this.target.name + "collider";
      });
      let intersects = raycaster.intersectObjects(meshList)
      if (intersects.length > 0) {
        return false;
      }

      let rayWidth = Confs.characterColliderSize / 2;
      let originPos1 = new THREE.Vector3(enemyPos.x + rayWidth, enemyPos.y, enemyPos.z + rayWidth)
      let raycaster1 = new THREE.Raycaster(originPos1, directVec, 0, directLength);
      intersects = raycaster1.intersectObjects(meshList)
      if (intersects.length > 0) {
        return false;
      }

      let originPos2 = new THREE.Vector3(enemyPos.x + rayWidth, enemyPos.y, enemyPos.z - rayWidth)
      let raycaster2 = new THREE.Raycaster(originPos2, directVec, 0, directLength);
      intersects = raycaster2.intersectObjects(meshList)
      if (intersects.length > 0) {
        return false;
      }

      let originPos3 = new THREE.Vector3(enemyPos.x - rayWidth, enemyPos.y, enemyPos.z - rayWidth)
      let raycaster3 = new THREE.Raycaster(originPos3, directVec, 0, directLength);
      intersects = raycaster3.intersectObjects(meshList)
      if (intersects.length > 0) {
        return false;
      }

      let originPos4 = new THREE.Vector3(enemyPos.x - rayWidth, enemyPos.y, enemyPos.z - rayWidth)
      let raycaster4 = new THREE.Raycaster(originPos4, directVec, 0, directLength);
      intersects = raycaster4.intersectObjects(meshList)
      if (intersects.length > 0) {
        return false;
      }


      return true;
    }
    return false;
  }

  /**
   * 敌人向主角寻路
   */
  navi() {
    if (this.enemy?.character?.group && this.navigation) {
      //console.log(this.enemy?.character.targetPos)
      if ((!this.enemy.character.targetPos || (this.enemy.character.targetPos &&
        this.enemy.character.targetPos.distanceTo(this.enemy.character.group.position) < 0.2))) {

        let naviPath = this.navigation?.builder();
        // 可能出现下一节点坐标与当前坐标过于接近，此时不更新角色朝向，避免出现闪顿现象
        if (naviPath.length > 0 && naviPath[0].distanceTo(this.enemy.character.group.position) >= 0.2) {
          this.enemy?.moveTo(naviPath[0], Confs.backSpeed * this.deltaTime);
          // 使用gsap做补间动画，使转向动作连贯
          let originPos = { x: this.lookPoint.x, y: this.lookPoint.y, z: this.lookPoint.z }
          // 先杀死之前如果未做完的动画，避免出现两个动画同时渲染导致闪屏现象
          if (this.tweenTarget) {
            gsap.killTweensOf(this.tweenTarget)
          }
          // 使用gsap平滑转向动作
          this.tweenTarget = gsap.to(originPos, {
            duration: 0.3, x: naviPath[0].x, y: naviPath[0].y, z: naviPath[0].z, onUpdate: () => {
              this.characterBuilder?.lookAt(new THREE.Vector3(originPos.x, originPos.y, originPos.z))
            }
          });
          this.lookPoint = naviPath[0];


        }
      }
    }
  }

}
