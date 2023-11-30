import { Vector } from "../math/vector";
import { SceneNode } from "../scene-node";
import { Point } from "./point";
import { Segment } from "./segment";

export class Polygon extends SceneNode {

  private _points: Point[];
  private _segments: Segment[] = [];

  private _lineWidth: number;
  private _stroke: string;
  private _fill: string;

  public constructor (polygon: Polygon, opts?: { stroke?: string; lineWidth?: number; fill?: string }) 
  public constructor (points: Vector[], opts?: { stroke?: string; lineWidth?: number; fill?: string }) 
  public constructor (points: Point[], opts?: { stroke?: string; lineWidth?: number; fill?: string }) 
  public constructor (points: (Point | Vector)[] | Polygon, opts?: { stroke?: string; lineWidth?: number; fill?: string }) {
    super('polygon');
    this._points = Array.isArray(points)
      ? points[0] instanceof Point
        ? [...points] as Point[]
        : [...points.map((v) => new Point(v as Vector))]
      : [...points.points];
    for (let i = 1; i <= this._points.length; ++i) {
      this._segments.push(
        new Segment(this._points[i-1], this._points[i % this._points.length]),
      );
    }
    this._stroke = opts?.stroke ?? 'blue';
    this._lineWidth = opts?.lineWidth ?? 2;
    this._fill = opts?.fill ?? 'rgba(0, 0, 255, 0.3)';
  }

  public get lineWidth () {
    return this._lineWidth;
  }

  public get stroke () {
    return this._stroke;
  }

  public get fill () {
    return this._fill;
  }

  public get points () {
    return this._points;
  }

  public distanceTo (other: Polygon): number;
  public distanceTo (position: Vector): number;
  public distanceTo (position: Vector | Polygon) {
    if (position instanceof Vector) {
      return Math.min(...this._segments.map((s) => s.distanceTo(position)));
    }
    else {
      return Math.min(...this.points.map((p) => position.distanceTo(p.position)));
    }
  }

  public override render () {
    this.context.save();
    this.context.beginPath();
    this.context.fillStyle = this._fill;
    this.context.strokeStyle = this._stroke;
    this.context.lineWidth = this._lineWidth;
    this.context.moveTo(this._points[0].x, this._points[0].y);
    for (let i = 1; i < this._points.length; ++i) {
      this.context.lineTo(this._points[i].x, this._points[i].y);
    }
    this.context.closePath();
    this.context.fill();
    this.context.stroke();
    this.context.restore();
  }

  public intersects (other: Polygon) {
    for (let seg of this._segments) {
      for (let seg2 of other._segments) {
        if (Segment.getIntersection(seg, seg2)) {
          return true;
        }
      }
    }
    return false;
  }

  public contains (segment: Segment): boolean;
  public contains (point: Point): boolean;
  public contains (point: Point | Segment) {
    if (point instanceof Point) {
      const outerPoint = new Point(-10000, -10000);
      let intersectionCount = 0;
      for (const seg of this._segments) {
        const intersection = Segment.getIntersection(new Segment(outerPoint, point), seg);
        if (intersection) {
          intersectionCount++;
        }
      }
      return intersectionCount % 2 === 1;
    }
    else {
      const midPoint = Vector.midPoint(point.from.position, point.to.position);
      return this.contains(new Point(midPoint));
    }
  }

  public static union (polygons: Polygon[]) {
    this.multiBreak(polygons);
    const keptSegments: Segment[] = [];
    for (let i = 0; i< polygons.length; ++i) {
      for (const seg of polygons[i]._segments) {
        let keep = true;
        for (let j = 0; j < polygons.length; ++j) {
          if (i !== j) {
            if (polygons[j].contains(seg)) {
              keep = false;
              break;
            }
          }
        }
        if (keep) {
          keptSegments.push(seg);
        }
      }
    }
    return keptSegments;
  }

  public static multiBreak (polygons: Polygon[]) {
    for (let i = 0; i < polygons.length; ++i) {
      for (let j = i + 1; j < polygons.length; ++j) {
        this.break(polygons[i], polygons[j]);
      }
    }
  }

  public static break (poly1: Polygon, poly2: Polygon) {
    const segs1 = poly1._segments;
    const segs2 = poly2._segments;
    for (let i = 0; i < segs1.length; ++i) {
      for (let j = 0; j < segs2.length; ++j) {
        const intersection = Segment.getIntersection(segs1[i], segs2[j]);

        if (intersection && intersection.offset !== 1 && intersection.offset !== 0) {
          const point = new Point(intersection.x, intersection.y);
          let aux = segs1[i].to;
          segs1[i].to = point;
          segs1.splice(i + 1, 0, new Segment(point, aux));
          aux = segs2[j].to;
          segs2[j].to = point;
          segs2.splice(j + 1, 0, new Segment(point, aux));
        }
      }
    }
  }
}