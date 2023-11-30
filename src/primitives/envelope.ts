import { Vector } from "../math/vector";
import { SceneNode } from "../scene-node";
import { Point } from "./point";
import { Polygon } from "./polygon";
import { Segment } from "./segment";

export class Envelope extends SceneNode {

  private _skeleton: Segment;
  private _polygon: Polygon;
  private _width: number;
  private _roundness: number;

  public constructor (skeleton: Segment, width: number, roundness: number = 1, opts?: { stroke?: string; lineWidth?: number; fill?: string }) {
    super('envelope');
    this._skeleton = skeleton;
    this._width = width;
    this._roundness = roundness;
    this._polygon = this._generatePolygon(opts);
    this.addChild(this._polygon);
  }

  public get polygon () {
    return this._polygon;
  }

  private _generatePolygon (opts?: { stroke?: string; lineWidth?: number; fill?: string }) {
    const { from, to } = this._skeleton;
    const radius = this._width * 0.5;
    const alpha = Vector.sub(from.position, to.position).heading;
    const alphaCW = alpha + Math.PI * 0.5;
    const alphaCCW = alpha - Math.PI * 0.5;

    const points: Vector[] = [];
    const step = Math.PI / Math.max(1, this._roundness);
    const epsilon = step * 0.5;
    for (let i = alphaCCW; i <= alphaCW + epsilon; i += step) {
      points.push(Vector.translate(from.position, i, radius));
    }
    for (let i = alphaCCW; i <= alphaCW + epsilon; i += step) {
      points.push(Vector.translate(to.position, Math.PI + i, radius));
    }

    return new Polygon(points.map((p) => new Point(p)), { fill: opts?.fill ?? '#BBB', stroke: opts?.stroke ?? '#BBB', lineWidth: opts?.lineWidth ?? 15 });
  }

  public get path () {
    const { from, to } = this._skeleton;
    const radius = this._width * 0.5;
    const alpha = Vector.sub(from.position, to.position).heading;
    const alphaCW = alpha + Math.PI * 0.5;
    const alphaCCW = alpha - Math.PI * 0.5;
    const fromCW = Vector.translate(from.position, alphaCW, radius);
    const toCW = Vector.translate(to.position, alphaCW, radius);
    const fromCCW = Vector.translate(from.position, alphaCCW, radius);
    const toCCW = Vector.translate(to.position, alphaCCW, radius);
    const path = new Path2D();
    path.moveTo(fromCW.x, fromCW.y);
    path.lineTo(toCW.x, toCW.y);
    path.arc(to.x, to.y, radius, Vector.sub(toCW, to.position).heading, Vector.sub(toCCW, to.position).heading);
    path.lineTo(fromCCW.x, fromCCW.y);
    path.arc(from.x, from.y, radius, Vector.sub(fromCCW, from.position).heading, Vector.sub(fromCW, from.position).heading);
    path.closePath();
    return path;
  }

  public override render () {
    this.context.save();
    /*
    this.context.fillStyle = this.polygon.fill;
    this.context.strokeStyle = this.polygon.stroke;
    this.context.lineWidth = this.polygon.lineWidth;
    const path = this.path;
    this.context.stroke(path);
    this.context.fill(path);
    */
    this._polygon.render(); 
    this.context.restore();
  }
}