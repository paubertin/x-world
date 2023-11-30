import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";
import { SceneNode } from "../scene-node";
import { Vector } from "./vector";

export class Graph extends SceneNode {

  public points: Point[] = [];
  public segments: Segment[] = [];

  public constructor(points: Point[] = [], segments: Segment[] = []) {
    super('graph');
    points.forEach((p) => this.addPoint(p));
    segments.forEach((s) => this.addSegment(s));
  }
  public toJSON() {
    return {
      points: this.points.map((p) => p.position),
      segments: this.segments.map((s) => {
        return {
          from: s.from.position,
          to: s.to.position,
        };
      }),
    };
  }

  public get hash () {
    return JSON.stringify(this);
  }

  public addPoint(p: Point | Vector | null) {
    if (!p) return;
    const point = p instanceof Point ? p : new Point(p.x, p.y);
    this.points.push(point);
    this.addChild(point);
    return point;
  }

  public tryAddPoint(p: Point) {
    if (!this.contains(p)) {
      this.addPoint(p);
      return true;
    }
    return false;
  }

  public addSegment(s: Segment | null) {
    if (!s) return;
    this.segments.push(s);
    this.addChild(s);
  }

  public tryAddSegment(s: Segment | null) {
    if (!s) return;
    if (!this.contains(s) && !s.to.equals(s.from)) {
      this.addSegment(s);
      return true;
    }
    return false;
  }

  public removeSegment(s: Segment | null) {
    if (!s) return;
    if (!this.contains(s)) {
      console.log('segment not in graph');
      return;
    }
    this.removeSegmentAtIndex(this.segments.indexOf(s));
  }

  public removeSegmentAtIndex(idx: number) {
    if (idx < 0 || idx >= this.segments.length) {
      console.log('index out of range');
      return;
    }
    const removed = this.segments.splice(idx, 1);
    for (const segment of removed) {
      this.removeChild(segment);
    }
  }

  public removePoint(pt: Point) {
    if (!this.contains(pt)) {
      console.log('point not in graph');
      return;
    }
    this.removePointAtIndex(this.points.indexOf(pt));
  }

  public removePointAtIndex(idx: number) {
    if (idx < 0 || idx >= this.points.length) {
      console.log('index out of range');
      return;
    }
    const removed = this.points.splice(idx, 1);
    for (const point of removed) {
      this.removeChild(point);
      for (const segment of this.getSegmentsContainingPoint(point)) {
        this.removeSegment(segment);
      }
    }
  }

  public getSegmentsContainingPoint(pt: Point) {
    return this.segments.filter((s) => s.has(pt));
  }

  public contains(point: Point): boolean;
  public contains(segment: Segment): boolean;
  public contains(point: Point | Segment) {
    if (point instanceof Point) {
      return this.points.find((p) => p.equals(point)) ? true : false;
    }
    else {
      return this.segments.find((s) => s.equals(point)) ? true : false;
    }
  }

  public clear() {
    while (this.points.length > 0) {
      this.removePointAtIndex(0);
    }
  }

  public static load(graphInfos: { points: { _x: number; _y: number }[]; segments: { from: { _x: number; _y: number }; to: { _x: number; _y: number } }[] }) {
    const points = graphInfos.points.map((i) => new Point(i._x, i._y));
    const segments = graphInfos.segments.map((i) => {
      const from = points.find((p) => p.x === i.from._x && p.y === i.from._y);
      const to = points.find((p) => p.x === i.to._x && p.y === i.to._y);
      return from && to ? new Segment(from, to) : null;
    }).filter(Boolean) as Segment[];
    return new Graph(points, segments);
  }
}