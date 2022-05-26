import { Object3D, Vector2, Vector3 } from "three";
import { default as GameMap } from "../apis/map";
import Confs from "../common/confs/confs";
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
    let endPos = new Vector3(
      ThreeMath.toPrecision(this.target.position.x, this.precision),
      0,
      ThreeMath.toPrecision(this.target.position.z, this.precision)
    );
    let openList: Node[] = [];
    let closeList: Node[] = [];
    let nodes: Map<string, Node> = new Map();
    // 初始节点
    let startNode = this.getNode(startPos, endPos, nodes);
    // 目标节点
    let targetNode = this.getNode(endPos, endPos, nodes);
    // closeList中先放入初始节点
    //closeList.push(startNode);
    // openList中加入初始节点
    openList.push(startNode);
    let hasPath = this.AStarWayFind(openList, closeList, targetNode, nodes);

    console.log(targetNode, hasPath)
    return [];
  }

  /**
   * A*寻路算法
   */
  AStarWayFind(
    openList: Node[],
    closeList: Node[],
    targetNode: Node,
    nodes: Map<string, Node>
  ): boolean {
    // 找到openList中F值最小的节点
    let minFNode = this.findMinFNode(openList);
    // openList中无值，无路径可以到达目的地
    if (!minFNode) {
      return false;
    }
    // 从openList中移除该节点
    this.removeNode(openList, minFNode);
    // 将找到的f最小的节点加入closeList中
    closeList.push(minFNode);
    // 找到该节点周围8个节点中可用节点
    if (
      this.findSurroundNodes(minFNode, targetNode, openList, closeList, nodes)
    ) {
      return true;
    }
    return this.AStarWayFind(openList, closeList, targetNode, nodes);
  }

  private findSurroundNodes(
    node: Node,
    targetNode: Node,
    openList: Node[],
    closeList: Node[],
    nodes: Map<string, Node>
  ): boolean {
    console.log(node)
    // 试探周围的8个点
    for (
      let x = -1 / this.precision;
      x < 1 / this.precision;
      x += 1 / this.precision
    ) {
      for (
        let y = -1 / this.precision;
        y < 1 / this.precision;
        y += 1 / this.precision
      ) {
        if (x == 0 && y == 0) {
          // 节点本身，不做操作
          continue;
        }
        // 移动代价
        let movePrice = 1 / this.precision;
        if (x != 0 || y != 0) {
          movePrice *= 1.4;
        }
        // 获得此周围节点
        let surroundNode = this.getNode(
          new Vector3(node.pos.x + x, 0, node.pos.y + y),
          targetNode,
          nodes,
          node,
          movePrice
        );
        // 该节点为有效节点
        if (this.nodeIsValid(surroundNode, closeList)) {
          let index = this.getNodeIndex(openList, surroundNode);
          if (index == -1) {
            // 该节点不在openList中，将其加入openList
            openList.push(surroundNode);
          } else {
            // 该节点存在openList中，更新parent
            this.updateParent(openList, index, surroundNode, movePrice);
          }
          if (surroundNode.equals(targetNode)) {
            console.log("target", surroundNode)
            targetNode.parent = surroundNode.parent
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * 更新节点的parent
   * @param openList
   * @param index
   * @param node
   */
  private updateParent(
    openList: Node[],
    index: number,
    newNode: Node,
    movePrice: number
  ) {
    // 获得节点
    let oldNode = openList[index];
    if (newNode.f < oldNode.f) {
      // 新节点的f比原节点小，更新父节点
      oldNode.updateParent(newNode.parent as Node, movePrice);
    }
  }

  /**
   * 节点是否为有效节点
   * @param node
   * @param closeList
   * @returns
   */
  private nodeIsValid(node: Node, closeList: Node[]) {
    // 节点超过地图范围（需考虑碰撞体体积）
    if (
      node.pos.x - Confs.characterColliderSize / 2 <= -this.map.width / 2 ||
      node.pos.x + Confs.characterColliderSize / 2 >= this.map.width / 2 ||
      node.pos.y - Confs.characterColliderSize / 2 <= -this.map.height / 2 ||
      node.pos.y + Confs.characterColliderSize / 2 >= this.map.height / 2
    ) {
      return false;
    }
    // closeList中已存在该节点/撞到墙/撞到其他角色
    if (
      this.getNodeIndex(closeList, node) != -1 ||
      this.isCollideWall(node) ||
      this.isCollideCollider(node)
    ) {
      return false;
    }
    return true;
  }

  /**
   * 该节点是否碰到其他碰撞体
   * @param node
   */
  isCollideCollider(node: Node): boolean {
    this.colliderList.forEach((collider) => {
      // 角色碰撞体
      if (collider.name.endsWith("collider")) {
        // 该节点与其他角色的碰撞体相撞
        if (
          (node.pos.x - Confs.characterColliderSize / 2 >=
            collider.position.x - Confs.characterColliderSize / 2 &&
            node.pos.x + Confs.characterColliderSize / 2 <=
            collider.position.x + Confs.characterColliderSize / 2) ||
          (node.pos.y - Confs.characterColliderSize / 2 >=
            collider.position.y - Confs.characterColliderSize / 2 &&
            node.pos.y + Confs.characterColliderSize / 2 <=
            collider.position.y + Confs.characterColliderSize / 2)
        ) {
          return true;
        }
      }
    });
    return false;
  }

  /**
   * 该节点是否已碰撞到墙壁
   * @param node
   */
  isCollideWall(node: Node): boolean {
    let walls = this.map.walls;
    walls.forEach((wall) => {
      // 节点在墙内
      if (
        (node.pos.x - Confs.characterColliderSize / 2 >=
          wall.position.x - wall.width / 2 &&
          node.pos.x + Confs.characterColliderSize / 2 <=
          wall.position.x + wall.width / 2) ||
        (node.pos.y - Confs.characterColliderSize / 2 >=
          wall.position.y - wall.height / 2 &&
          node.pos.y + Confs.characterColliderSize / 2 <=
          wall.position.y + wall.height / 2)
      ) {
        return true;
      }
    });
    return false;
  }

  /**
   * 获得节点在list中的索引
   * @param list
   * @param target
   * @returns 索引值，-1表示节点不在list中
   */
  private getNodeIndex(list: Node[], target: Node): number {
    for (let i = 0; i < list.length; i++) {
      if (list[i].name == target.name) {
        return i;
      }
    }

    return -1;
  }

  /**
   * 移除节点
   * @param list
   */
  private removeNode(list: Node[], target: Node) {
    var index = this.getNodeIndex(list, target);
    //debugger
    if (index > -1) {
      // list中删除节点
      list.splice(index, 1);
    }
  }

  /**
   * 找到openList中F值最小的节点
   * @param openList
   */
  private findMinFNode(openList: Node[]): Node | null {
    if (openList.length == 0) {
      return null;
    }

    let minNode = openList[0];
    let minF = minNode.f;

    openList.forEach((node) => {
      if (node.f < minF) {
        minF = node.f;
        minNode = node;
      }
    });

    return minNode;
  }

  /**
   * 获取节点
   * @param pos
   * @param targetPos
   * @param nodes
   * @param parent
   * @returns
   */
  private getNode(
    pos: Vector3,
    targetPos: Vector3 | Node,
    nodes: Map<string, Node>,
    parent?: Node,
    movePrice?: number
  ): Node {
    // 将坐标精细化
    let x = ThreeMath.toPrecision(pos.x, this.precision);
    let y = ThreeMath.toPrecision(pos.z, this.precision);
    let name = x + "," + y;
    if (nodes.has(name)) {
      // 存在该节点 直接获取
      return nodes.get(name) as Node;
    } else {
      let node: Node | null = null;
      if (targetPos instanceof Vector3) {
        node = new Node(
          new Vector2(x, y),
          new Vector2(targetPos.x, targetPos.z),
          parent,
          movePrice
        );
      } else {
        node = new Node(
          new Vector2(x, y),
          new Vector2(targetPos.pos.x, targetPos.pos.y),
          parent,
          movePrice
        );
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

  public targetPos: Vector2;

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
    this.targetPos = targetPos;
    if (parent && movePrice) {
      this.parent = parent;
      // 该节点的g为父节点的g加上移动代价
      this.g = parent.g + movePrice;
    } else {
      // 节点没有父节点，则g为0
      this.g = 0;
    }

    // 计算该节点的h
    this.h = Math.abs(targetPos.x - pos.x) + Math.abs(targetPos.y - pos.y);
    // f值为h和g之和
    this.f = this.h + this.g;
  }

  updateParent(parent: Node, movePrice: number) {
    this.parent = parent;
    // 该节点的g为父节点的g加上移动代价
    this.g = parent.g + movePrice;
    // 节点的h不变
    // f值为h和g之和
    this.f = this.h + this.g;
  }

  /**
   * 判断该节点与另一节点/坐标是否相同
   * @param other 节点或坐标
   * @returns 布尔值
   */
  equals(other: Node | Vector2): boolean {
    if (other instanceof Node) {
      return this.name == other.name;
    } else {
      return this.name == other.x + "," + other.y;
    }
  }
}
