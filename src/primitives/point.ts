import { Vector } from "../math/vector";
import { SceneNode } from "../scene-node";

export class Point extends SceneNode {

  private _position: Vector;

  public size: number;
  public color: string;

  private _outlined: boolean = false;
  private _filled: boolean = false;

  public constructor (vec: Vector, opts?: { size?: number; color?: string })
  public constructor (x: number, y: number, opts?: { size?: number; color?: string })
  public constructor (x: number | Vector, y?: number | { size?: number; color?: string }, opts?: { size?: number; color?: string }) {
    super('point');
    const posX = typeof x === 'number' ? x : x.x;
    const posY = typeof x === 'number' ? (y as number) : x.y;
    const options = typeof x === 'number' ? opts : y as ({ size?: number; color?: string } | undefined);
    this._position = new Vector(posX, posY);
    this.size = options?.size ?? 18;
    this.color = options?.color ?? 'black';
  }

  public get position (): Vector {
    return this._position;
  }

  public set position (v: Vector | Point) {
    this._position.x = v.x;
    this._position.y = v.y;
  }

  public get x () {
    return this._position.x;
  }

  public get y () {
    return this._position.y;
  }

  public outline (v: boolean = true) {
    this._outlined = v;
  }

  public fill (v: boolean = true) {
    this._filled = v;
  }

  public override render () {
    this.context.save();
    const radius = this.size * 0.5;
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.arc(this.x, this.y, radius, 0, Math.PI * 2);
    this.context.fill();
    if (this._outlined) {
      this.context.beginPath();
      this.context.lineWidth = 2;
      this.context.strokeStyle = 'yellow';
      this.context.arc(this.x, this.y, radius * 0.6, 0, Math.PI * 2);
      this.context.stroke();
    }
    if (this._filled) {
      this.context.beginPath();
      this.context.arc(this.x, this.y, radius * 0.4, 0, Math.PI * 2);
      this.context.fillStyle = 'yellow';
      this.context.fill();
    }
    this.context.restore();
  }

  public equals (other: Point) {
    return this._position.equals(other._position);
  }
}