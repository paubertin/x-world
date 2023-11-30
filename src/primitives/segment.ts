import { EPSILON, lerp } from "../math/utils";
import { Vector } from "../math/vector";
import { SceneNode } from "../scene-node";
import { Point } from "./point";

export class Segment extends SceneNode {

  private _from: Point;
  private _to: Point;

  public width: number;
  public color: string;
  public lineDash: number[];

  public constructor (p1: Vector, p2: Vector, opts?: { width?: number; color?: string; lineDash?: number[] })
  public constructor (p1: Point, p2: Point, opts?: { width?: number; color?: string; lineDash?: number[] })
  public constructor (p1: Point | Vector, p2: Point | Vector, opts?: { width?: number; color?: string; lineDash?: number[] }) {
    super('segment');
    this._from = p1 instanceof Point ? p1 : new Point(p1);
    this._to = p2 instanceof Point ? p2 : new Point(p2);
    this.width = opts?.width ?? 2;
    this.color = opts?.color ?? 'black';
    this.lineDash = opts?.lineDash ?? [];
  }

  public override render () {
    this.context.save();
    this.context.beginPath();
    this.context.lineWidth = this.width;
    this.context.strokeStyle = this.color;
    this.context.moveTo(this._from.x, this._from.y);
    this.context.lineTo(this._to.x, this._to.y);
    this.context.setLineDash(this.lineDash);
    this.context.stroke();
    this.context.restore();
  }

  public equals (other: Segment) {
    return this.has(other._from) && this.has(other._to);
  }

  public has (point: Point) {
    return this._from.equals(point) || this._to.equals(point);
  }

  public get length () {
    return this._from.position.distanceTo(this._to.position);
  }

  public get perp () {
    return Vector.sub(this._to.position, this._from.position).perp;
  }

  public get vector () {
    return Vector.sub(this._to.position, this._from.position);
  }

  public distanceTo (position: Vector) {
    const projection = this.projectPoint(position);
    if (projection.offset > 0 && projection.offset < 1) {
      return position.distanceTo(projection.point);
    }
    const distToP1 = position.distanceTo(this.from.position);
    const distToP2 = position.distanceTo(this.to.position);
    return Math.min(distToP1, distToP2);
  }

  public projectPoint (p: Vector) {
    const a = Vector.sub(p, this.from.position);
    const b = Vector.sub(this.to.position, this.from.position);
    const normB = Vector.normalize(b);
    const scaler = a.dot(normB);
    return {
      point: Vector.add(this.from.position, Vector.scale(normB, scaler)),
      offset: scaler / b.length,
    };
  }

  public get directionVector () {
    return Vector.sub(this._to.position, this._from.position).normalize();
  }

  public get from (): Point {
    return this._from;
  }

  public set from (p: Point | Vector) {
    const point = p instanceof Point ? p : new Point(p.x, p.y);
    this._from = point;
  }

  public get to (): Point {
    return this._to;
  }

  public set to (p: Point | Vector) {
    const point = p instanceof Point ? p : new Point(p.x, p.y);
    this._to = point;
  }

  public static getIntersection (a: Segment, b: Segment) {
    const A = a.from.position;
    const B = a.to.position;
    const C = b.from.position;
    const D = b.to.position;
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);
 
    if (Math.abs(bottom) > EPSILON) {
       const t = tTop / bottom;
       const u = uTop / bottom;
       if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
          return {
             x: lerp(A.x, B.x, t),
             y: lerp(A.y, B.y, t),
             offset: t,
          };
       }
    }
 
    return null;

  }
}