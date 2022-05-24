export default class Map {
  public width: number = 0;
  public height: number = 0;

  public walls: Array<Walls> = []

  public initPos:Vector2 = new Vector2(0,0);

  public enemies:Array<Enemies> = [];

}

export class Enemies{
  public name:string = "";
  public initPos:Vector2 = new Vector2(0,0);

}

export class Walls {
  public width: number = 0;
  public height: number = 0;

  public position: Vector2 = new Vector2(0, 0);

}

class Vector2 {
  public x: number = 0;
  public y: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}