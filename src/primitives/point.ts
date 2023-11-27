import { SceneNode } from "../scene-node";

export class Point extends SceneNode {

  public size: number;
  public color: string;

  private _outlined: boolean = false;
  private _filled: boolean = false;

  public constructor (public x: number, public y: number, opts?: { size?: number; color?: string }) {
    super('point');
    this.size = opts?.size ?? 18;
    this.color = opts?.color ?? 'black';
  }

  public outline (v: boolean = true) {
    this._outlined = v;
  }

  public fill (v: boolean = true) {
    this._filled = v;
  }

  public override render () {
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
  }

  public equals (other: Point) {
    return this.x === other.x && this.y === other.y;
  }
}