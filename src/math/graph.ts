import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";
import { SceneNode } from "../scene-node";

export class Graph extends SceneNode {

  public points: Point[] = [];
  public segments: Segment[] = [];

  public constructor (points: Point[] = [], segments: Segment[] = []) {
    super('graph');
    points.forEach((p) => this.addPoint(p));
    segments.forEach((s) => this.addSegment(s));
  }

  public addPoint (p: Point | null) {
    if (!p) return;
    this.points.push(p);
    this.addChild(p);
  }

  public tryAddPoint (p: Point) {
    if (!this.contains(p)) {
      this.addPoint(p);
      return true;
    }
    return false;
  }

  public addSegment (s: Segment | null) {
    if (!s) return;
    this.segments.push(s);
    this.addChild(s);
  }

  public tryAddSegment (s: Segment | null) {
    if (!s) return;
    if (!this.contains(s) && !s.to.equals(s.from)) {
      this.addSegment(s);
      return true;
    }
    return false;
  }

  public removeSegment (s: Segment | null) {
    if (!s) return;
    if (!this.contains(s)) {
      console.log('segment not in graph');
      return;
    }
    this.removeSegmentAtIndex(this.segments.indexOf(s));
  }

  public removeSegmentAtIndex (idx: number) {
    if (idx < 0 || idx >= this.segments.length) {
      console.log('index out of range');
      return;
    }
    const removed = this.segments.splice(idx, 1);
    for (const segment of removed) {
      this.removeChild(segment);
    }
  }

  public removePoint (pt: Point) {
    if (!this.contains(pt)) {
      console.log('point not in graph');
      return;
    }
    this.removePointAtIndex(this.points.indexOf(pt));
  }

  public removePointAtIndex (idx: number) {
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

  public getSegmentsContainingPoint (pt: Point) {
    return this.segments.filter((s) => s.has(pt));
  }

  public contains (point: Point): boolean;
  public contains (segment: Segment): boolean;
  public contains (point: Point | Segment) {
    if (point instanceof Point) {
      return this.points.find((p) => p.equals(point)) ? true : false;
    }
    else {
      return this.segments.find((s) => s.equals(point)) ? true : false;
    }
  }

  public clear () {
    this.points.length = 0;
    this.segments.length = 0;
  }
}