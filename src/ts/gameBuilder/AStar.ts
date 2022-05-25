import { Object3D, Vector2, Vector3 } from "three";
import { default as GameMap } from "../apis/map";
import ThreeMath from "../tool/threeMath";

/**
 * A*寻路算法
 */
export default class AStar {
  public map: GameMap;

  public colliderList: THREE.Object3D[] = [];

  public start: Object3D | null = null;

  public target: Object3D | null = null;

  /**
   * 寻路精度
   */
  public precision: number = 1;

  constructor(
    map: GameMap,
    colliderList: THREE.Object3D[],
    name: string,
    targetName: string,
    precision?: number
  ) {
    this.map = map;
    this.colliderList = colliderList;
    colliderList.forEach((collider) => {
      if (collider.name == name + "collider") {
        // 找到角色的object
        this.start = collider;
      } else if (collider.name == targetName + "collider") {
        // 找到目标的object
        this.target = collider;
      }
    });
    if (precision) {
      this.precision = precision;
    }
  }

  builder(): Vector3[] {
    if (!this.target || !this.start) {
      return [];
    }
    // 起始坐标
    let startPos = this.start.position;
    // 目标坐标
    let endPos = this.target.position;
    let openList: Node[] = [];
    let closeList: Node[] = [];
    let nodes: Map<string, Node> = new Map();
    // 初始节点
    let startNode = this.getNode(startPos,endPos, nodes);
    // 目标节点
    let targetNode = this.getNode(endPos,endPos, nodes);
    // closeList中先放入初始节点
    closeList.push(startNode);
    // openList中加入初始节点
    openList.push(targetNode);
    this.AStarWayFind(openList, closeList, nodes);

    return [];
  }

  /**
   * A*寻路算法
   */
  AStarWayFind(openList: Node[], closeList: Node[], nodes: Map<string, Node>) {}

  /**
   * 获取节点
   * @param pos 
   * @param targetPos 
   * @param nodes 
   * @param parent 
   * @returns 
   */
  getNode(pos: Vector3,targetPos:Vector3, nodes: Map<string, Node>, parent?: Node): Node {
    let x = ThreeMath.toPrecision(pos.x, this.precision);
    let y = ThreeMath.toPrecision(pos.z, this.precision);
    let name = x + "," + y;
    if (nodes.has(name)) {
      // 存在该节点 直接获取
      return nodes.get(name) as Node;
    } else {
      let node = new Node(new Vector2(x, y),new Vector2(targetPos.x,targetPos.z));
      if (parent) {
        // 设置父节点
        node.parent = parent;
      }
      // 将节点加入节点map中
      nodes.set(node.name, node);

      return node;
    }
  }
}

/**
 * 寻路节点
 */
class Node {
  public name: string;

  public pos: Vector2;

  public parent: Node | null = null;

  /**
   * 从起始节点移动到当前节点的移动代价
   */
  public g: number;

  /**
   * 从当前节点到终点的预估值
   */
  public h: number;

  /**
   * g和h之和
   */
  public f: number;

  constructor(
    pos: Vector2,
    targetPos: Vector2,
    parent?: Node,
    movePrice?: number
  ) {
    this.pos = new Vector2(pos.x, pos.y);
    this.name = this.pos.x + "," + this.pos.y;
    if (parent && movePrice) {
      this.parent = parent;
      // 该节点的g为父节点的g加上移动代价
      this.g = parent.g + movePrice;
    }
    else{
        // 节点没有父节点，则g为0
        this.g = 0;
    }

    // 计算该节点的h
    this.h = Math.abs(targetPos.x - pos.x) + Math.abs(targetPos.y - pos.y);
    // f值为h和g之和
    this.f = this.h + this.g;
  }
}
