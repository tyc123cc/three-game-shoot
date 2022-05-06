import gsap from "gsap";
import {
  AnimationAction,
  AnimationActionLoopStyles,
  AnimationClip,
  AnimationMixer,
  Group,
  LoopOnce,
  LoopRepeat,
  Raycaster,
  Vector3,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import BaseThree from "../common/baseThree";
import { Heap } from "../common/heap";
import Animation from "./animation";
import { AniEffectScope, AniStatus } from "./enum";

/**
 * 角色类
 */
export default class Character extends BaseThree {
  /**
   * 模型的url地址
   */
  public url: string;

  /**
   * 该角色的动画组
   */
  public animations: Array<Animation>;

  /**
   * 正在播放的动画
   */
  public playingAnimation: Animation | null = null;

  /**
   * 骨骼模型索引(children下)
   */
  public skinMeshIndex: number;

  /**
   * 动画混合器
   */
  public mixer: AnimationMixer | undefined;

  /**
   * 角色的模型group
   */
  public group: THREE.Group | null = null;

  /**
   * 角色的AnimationAction
   */
  public animationAction: AnimationAction | null = null;

  /**
   * 角色在执行上半身动画结束后的AnimationAction
   */
  public nextAnimation: Animation | null = null;

  /**
   * 该角色的后补动画Set
   */
  public animationSet: Set<Animation>;

  /**
   * 当前动画播放状态
   */
  public AnimationStatus: AniStatus = AniStatus.Null;

  /**
   * 当前角色的前进目标点
   */
  public targetPos: THREE.Vector3 | null = null;

  /**
   * 角色的移动速度
   */
  public moveSpeed: number = 0;

  /**
   * 角色朝向点
   */
  public lookPoint:THREE.Vector3 = new Vector3()

  public colliderMeshList: THREE.Object3D[] = [];

  constructor(
    url: string,
    animations: Array<Animation>,
    skinMeshIndex: number,
    onLoad: (object: Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ) {
    super();
    this.url = url;
    this.animations = animations;
    this.skinMeshIndex = skinMeshIndex;
    this.animationSet = new Set();
    let loader = new FBXLoader();
    loader.load(
      url,
      (object) => {
        this.group = object;
        this.mixer = new AnimationMixer(object.children[skinMeshIndex]);
        onLoad(object);
      },
      onProgress,
      onError
    );

    this.enable();
  }

  start(): void { }

  public moveTo(
    pos: THREE.Vector3,
    speed: number,
  ) {
    this.targetPos = pos;
    this.moveSpeed = speed;
    console.log(this.colliderMeshList)
  }

  public lookAt(pos: THREE.Vector3) {
    this.group?.lookAt(pos)
    this.lookPoint = pos;
  }

  update(): void {
    this.upAnimationEnd();
    this.move();
  }

  /**
   * 角色移动函数
   */
  private move() {
    if (this.group && this.targetPos) {
      let moveVec = this.targetPos.clone();
      // 角色移动方向的方向向量
      moveVec.sub(this.group.position).normalize();
      // 角色移动前坐标
      let originPostion = this.group.position;
      // 方向向量乘以速度
      moveVec.multiplyScalar(this.moveSpeed)

      if (this.intersect(moveVec)) {
        console.log("碰撞")
        // 碰撞，停止移动
        this.targetPos = null;
        return;
      }
      this.group.position.add(moveVec)
      if (this.group.position.distanceTo(this.targetPos) < 0.01) {
        // 到达目的地
        this.targetPos = null;
      }
    }
  }

  /**
   * 检测角色是否与其他物体碰撞
   * @returns 
   */
  intersect(dir: Vector3): boolean {

    //声明一个变量用来表示是否碰撞
    var bool = false;
    // threejs的几何体默认情况下几何中心在场景中坐标是坐标原点。

    // vertices[i]获得几何体索引是i的顶点坐标，
    // 注意执行.clone()返回一个新的向量，以免改变几何体顶点坐标值
    // 几何体的顶点坐标要执行该几何体绑定模型对象经过的旋转平移缩放变换
    // 几何体顶点经过的变换可以通过模型的本地矩阵属性.matrix或世界矩阵属性.matrixWorld获得



    //Raycaster构造函数创建一个射线投射器对象，参数1、参数2改变的是该对象的射线属性.ray
    // 参数1：射线的起点
    // 参数2：射线的方向，注意归一化的时候，需要先克隆,否则后面会执行dir.length()计算向量长度结果是1
    var raycaster = new Raycaster(this.group?.position, dir.clone().normalize());


    // 计算射线和参数1中的模型对象是否相交，参数1数组中可以设置多个模型模型对象，下面参数只设置了立方体网格模型
    var intersects = raycaster.intersectObjects(this.colliderMeshList);
    for (let intersect of intersects) {
      if (intersect.distance < 2.0) {
        //循环遍历几何体顶点，每一个顶点都要创建一个射线，进行一次交叉拾取计算，只要有一个满足上面的距离条件，就发生了碰撞
        //console.log(intersect.point, intersect.distance, dir.length())
        return true;
      }
    }

    return false;
  }

  /**
   * 上半身动画播放完毕时执行函数
   * @returns
   */
  private upAnimationEnd(): void {
    //clock.getDelta()方法获得两帧的时间间隔
    if (!this.animationAction) {
      return;
    }
    // 上半身动画停止
    // this.animationAction.time >= (this.playingAnimation?.animationClip?.duration as number)
    if (
      !this.animationAction.isRunning() &&
      this.playingAnimation?.effectScope == AniEffectScope.Upper
    ) {
      // 重置当前播放动画
      if (this.nextAnimation) {
        let action = this.mixer?.clipAction(
          this.nextAnimation.animationClip as AnimationClip
        ) as AnimationAction;
        if (this.nextAnimation.effectScope == AniEffectScope.All) {
          // 全身动画需要从头播放
          action.stop();
        }
        action.play();
        this.animationAction.stop();
        this.animationAction = action;
        this.playingAnimation = this.nextAnimation;
        this.AnimationStatus = Animation.changeAnimationEffectScopeToStatus(
          this.nextAnimation.effectScope
        );
        this.nextAnimation = null;
        // 播放上半身停止后动画
        //this.play(this.nextAnimation.name);

        this.animationSet.forEach((ani) => {
          if (ani.name != this.playingAnimation?.name) {
            // 停止其他动画 防止出现攻击-移动-静止时依旧播放移动动画的情况
            this.mixer?.clipAction(ani.animationClip as AnimationClip).stop();
          }
        });
        this.animationSet.clear();
      }
      this.nextAnimation = null;
    }
    // 更新混合器相关的时间
    this.mixer?.update(this.deltaTime);
  }

  /**
   *  播放动画
   * @param name 要播放动画的名称
   * @param loop 是否循环
   */
  public play(name: string) {
    let animation = this.animations.filter((value) => value.name == name)[0];
    let clip = animation.animationClip;
    if (clip) {
      let animationAction: AnimationAction | null = null;
      // 混合器中不存在该clip，需要设置初始属性
      if (!this.mixer?.existingAction(clip)) {
        animationAction = this.mixer?.clipAction(clip) as AnimationAction;
        animationAction.loop = animation.loop;
        animationAction.weight = animation.weight;
      } else {
        animationAction = this.mixer?.clipAction(clip) as AnimationAction;
      }
      this.playMixAnimation(animation, animationAction);
    }
  }

  /**
   * 播放混合动画
   */
  private playMixAnimation(animation: Animation, action: AnimationAction) {
    // 当前未在播放动画，直接播放当前动画
    if (this.AnimationStatus == AniStatus.Null) {
      action.stop().play();
      this.animationAction = action;
      this.playingAnimation = animation;
      this.AnimationStatus = Animation.changeAnimationEffectScopeToStatus(
        animation.effectScope
      );
      return;
    }
    // 当前正在播放下半身动画，且需要播放上半身动画时（或相反情况），进行动画融合操作
    if (
      animation.effectScope == AniEffectScope.Upper &&
      this.AnimationStatus == AniStatus.Lower
    ) {
      // 不停止下半身动画，直接播放上半身动画进行动画融合
      // 克隆出该上半身动画数据，进行骨骼点裁剪，再将新动画与正在播放的下半身动画融合
      let animationClipTemp = animation.animationClip?.clone() as AnimationClip;
      // 上半身动画只保留上半身骨骼动画
      animationClipTemp.tracks.splice(45);
      animationClipTemp.tracks[1] = (
        this.playingAnimation?.animationClip as AnimationClip
      ).tracks[1];
      // 裁剪完毕，生成新的Action
      let newAnimationAction = this.mixer?.clipAction(
        animationClipTemp
      ) as AnimationAction;
      // 配置初始值
      newAnimationAction.loop = animation.loop;
      newAnimationAction.weight = animation.weight;
      // 播放裁剪后的上半身动作
      newAnimationAction.stop().play();
      // 设置当前Action为裁剪过的动作Action
      this.animationAction = newAnimationAction;
      // 设置结束后的动作为当前的下半身动作
      this.nextAnimation = this.playingAnimation;
      // 将当前动画放在set中，待上半身动画结束后进行统一播放/停止
      if (!this.animationSet.has(this.playingAnimation as Animation)) {
        this.animationSet.add(this.playingAnimation as Animation);
      }
      // 设置当前播放动画
      this.playingAnimation = animation;
      // 当前正在播放上下半身融合动画
      this.AnimationStatus = AniStatus.UpperAndLower;
    }
    // 当前正在播放上半身动画时，插入下半身动画，进行动画融合
    else if (
      animation.effectScope == AniEffectScope.Lower &&
      this.AnimationStatus == AniStatus.Upper
    ) {
      // 不停止上半身动画，直接播放下半身动画进行动画融合

      // 播放当前动画
      action.stop().play();
      // 裁剪当前播放的上半身动画

      // 裁剪当前播放的上半身动画的克隆
      let animationClipTemp =
        this.playingAnimation?.animationClip?.clone() as AnimationClip;
      // 上半身动画只保留上半身骨骼动画
      animationClipTemp.tracks.splice(45);
      animationClipTemp.tracks[1] = (
        animation.animationClip as AnimationClip
      ).tracks[1];
      // 正在播放的上半身动画action
      let oldAnimationAction = this.animationAction as AnimationAction;
      // 生成裁剪后的action
      this.animationAction = this.mixer?.clipAction(
        animationClipTemp
      ) as AnimationAction;
      // 配置初始值
      this.animationAction.loop = oldAnimationAction.loop;
      this.animationAction.weight = oldAnimationAction.weight;
      // 将裁剪后的动画时间与与当前播放的上半身动画同步
      this.animationAction.syncWith(oldAnimationAction);
      // 播放裁剪后的上半身动画
      this.animationAction.play();
      // 正在播放的上半身动画停止
      oldAnimationAction.stop();

      // 此时正在播放播放动画还是原先的上半身动画，不修改playingAnimation

      // 将下半身动作放入set中
      if (!this.animationSet.has(animation)) {
        this.animationSet.add(animation);
      }
      // 设置上半身动画结束后的动画
      this.nextAnimation = animation;
      // 当前动画播放状态为上下半身动画融合
      this.AnimationStatus = AniStatus.UpperAndLower;

      // }
    } else if (
      animation.name == this.playingAnimation?.name &&
      animation.effectScope != AniEffectScope.Upper
    ) {
      // 非上半身重复播放，不执行
    } else if (
      animation.effectScope == AniEffectScope.All &&
      this.AnimationStatus == AniStatus.Upper
    ) {
      // 上半身动作无法被全身动作覆盖，将该动作放入set和next中

      this.nextAnimation = animation;
      // 将当前动画放在set中，待上半身动画结束后进行统一播放/停止
      if (!this.animationSet.has(this.playingAnimation as Animation)) {
        this.animationSet.add(this.playingAnimation as Animation);
      }
    }
    // 在执行上下半身融合动画时，播放上半身动画，刷新上半身动画，逻辑与播放下半身时播放上半身逻辑相同
    else if (
      this.AnimationStatus == AniStatus.UpperAndLower &&
      animation.effectScope == AniEffectScope.Upper
    ) {
      // 不停止下半身动画，直接播放上半身动画进行动画融合
      // 克隆出该上半身动画数据，进行骨骼点裁剪，再将新动画与正在播放的下半身动画融合
      let animationClipTemp = animation.animationClip?.clone() as AnimationClip;
      // 上半身动画只保留上半身骨骼动画
      animationClipTemp.tracks.splice(45);
      // 当前为上半身融合动画，因此当前动画实际为上半身动画，为了取得下半身的骨骼动画，需要从下一动画中取得
      animationClipTemp.tracks[1] = (
        this.nextAnimation?.animationClip as AnimationClip
      ).tracks[1];
      // 裁剪完毕，生成新的Action
      let newAnimationAction = this.mixer?.clipAction(
        animationClipTemp
      ) as AnimationAction;
      // 配置初始值
      newAnimationAction.loop = animation.loop;
      newAnimationAction.weight = animation.weight;
      // 播放裁剪后的上半身动作
      newAnimationAction.stop().play();
      // 刷新动画，需要停止当前播放的上半身
      this.animationAction?.stop();
      // 设置当前Action为裁剪过的动作Action
      this.animationAction = newAnimationAction;
      // 不同处：无需设置下一动画，因为当前播放动画实际为上半身动画，继承下一动画即可

      // 设置当前播放动画
      this.playingAnimation = animation;
      // 当前正在播放上下半身融合动画
      this.AnimationStatus = AniStatus.UpperAndLower;
    }
    // 当正在播放上下半身融合动作时，进行下半身动作
    else if (
      this.AnimationStatus == AniStatus.UpperAndLower &&
      animation.effectScope == AniEffectScope.Lower
    ) {
      // 当前下半身动作与需要播放的下半身动作不同时，进行刷新下半身动画操作，否则不进行操作
      if (animation.name != this.nextAnimation?.name) {
        // 需要将上半身动画的骨骼动画主脊髓骨骼动画改为新播放的下半身动画的主脊椎骨骼动画，因此需要重新生成上半身骨骼动画，
        // 并同步时间后替换当前上半身动画

        // 裁剪当前播放的上半身动画的克隆
        let animationClipTemp =
          this.playingAnimation?.animationClip?.clone() as AnimationClip;
        // 上半身动画只保留上半身骨骼动画
        animationClipTemp.tracks.splice(45);
        animationClipTemp.tracks[1] = (
          animation.animationClip as AnimationClip
        ).tracks[1];
        // 正在播放的上半身动画action
        let oldAnimationAction = this.animationAction as AnimationAction;
        // 生成裁剪后的action
        this.animationAction = this.mixer?.clipAction(
          animationClipTemp
        ) as AnimationAction;
        // 配置初始值
        this.animationAction.loop = oldAnimationAction.loop;
        this.animationAction.weight = oldAnimationAction.weight;
        // 将裁剪后的动画时间与与当前播放的上半身动画同步
        this.animationAction.syncWith(oldAnimationAction);
        // 播放裁剪后的上半身动画
        this.animationAction.play();
        // 正在播放的上半身动画停止
        oldAnimationAction.stop();

        // 获得正在播放的下半身动画
        let oldLowAnimationAction = this.mixer?.clipAction(
          this.nextAnimation?.animationClip as AnimationClip
        );
        // 播放新的下半身动画
        action.play();
        // 停止原来的下半身动画
        oldLowAnimationAction?.stop();

        // 更新当前播放动画信息 不更新正在播放的动画（正在播放的依然是上半身动画）
        this.nextAnimation = animation;
        // 将当前动画放在set中，待上半身动画结束后进行统一播放/停止
        if (!this.animationSet.has(animation as Animation)) {
          this.animationSet.add(animation as Animation);
        }
        this.AnimationStatus = AniStatus.UpperAndLower;
      }
    }
    // 当前正在执行上下半身融合动画时，进行全身动作
    else if (
      this.AnimationStatus == AniStatus.UpperAndLower &&
      animation.effectScope == AniEffectScope.All
    ) {
      // 获取上半身动画（未裁剪过）的Action
      let upperAnimationAction = this.mixer?.clipAction(
        this.playingAnimation?.animationClip as AnimationClip
      ) as AnimationAction;
      // 将未裁剪过的上半身动画时间和当前裁剪过的动画同步
      upperAnimationAction.syncWith(this.animationAction as AnimationAction);
      // 停止当前裁剪后的动画，并播放未裁剪动画
      upperAnimationAction.play();
      this.animationAction?.stop();

      // 获得下半身动画的Action
      let lowerAnimationAction = this.mixer?.clipAction(
        this.nextAnimation?.animationClip as AnimationClip
      ) as AnimationAction;
      lowerAnimationAction.stop();

      // 提前播放全身动画，避免出现闪顿现象（上半身动画播放完毕到全身动作播放的一帧空闲状态）
      action.play();

      this.animationAction = upperAnimationAction;
      //this.playingAnimation = animation;
      this.nextAnimation = animation;
      // 将当前动画放在set中，待上半身动画结束后进行统一播放/停止
      if (!this.animationSet.has(animation as Animation)) {
        this.animationSet.add(animation as Animation);
      }
    } else {
      // 其他情况直接播放动画
      // 播放当前动画
      action.stop().play();

      // 当前播放上半身动画，需要存储当前动作
      if (
        animation.effectScope == AniEffectScope.Upper &&
        this.AnimationStatus != AniStatus.Upper
      ) {
        // 设置上半身动画结束后的动画
        this.nextAnimation = this.playingAnimation;
        // 将当前动作放入set中
        if (!this.animationSet.has(this.playingAnimation as Animation)) {
          this.animationSet.add(this.playingAnimation as Animation);
        }
      }
      // 直接播放上半身动作时，不停止当前动画
      // 当前播放上半身动画时，需要重置动画，同样不停止
      else if (this.AnimationStatus != AniStatus.Upper) {
        // 需要停止当前动作
        this.animationAction?.stop();
      }

      // 设置当前播放动画和action
      this.animationAction = action;
      this.playingAnimation = animation;
      this.AnimationStatus = Animation.changeAnimationEffectScopeToStatus(
        animation.effectScope
      );
    }
  }
}
