import { SceneNode } from "../scene-node";
import { Point } from "./point";

export class Segment extends SceneNode {

  public from: Point;
  public to: Point;

  public width: number;
  public color: string;
  public lineDash: number[];

  public constructor (p1: Point, p2: Point, opts?: { width?: number; color?: string; lineDash?: number[] }) {
    super('segment');
    this.from = p1;
    this.to = p2;
    this.width = opts?.width ?? 2;
    this.color = opts?.color ?? 'black';
    this.lineDash = opts?.lineDash ?? [];
  }

  public override render () {
    this.context.save();
    this.context.beginPath();
    this.context.lineWidth = this.width;
    this.context.strokeStyle = this.color;
    this.context.moveTo(this.from.x, this.from.y);
    this.context.lineTo(this.to.x, this.to.y);
    this.context.setLineDash(this.lineDash);
    this.context.stroke();
    this.context.restore();
  }

  public equals (other: Segment) {
    return this.has(other.from) && this.has(other.to);
  }

  public has (point: Point) {
    return this.from.equals(point) || this.to.equals(point);
  }
}