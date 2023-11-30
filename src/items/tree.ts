import { Engine } from "../engine";
import { lerp } from "../math/utils";
import { Vector } from "../math/vector";
import { Point } from "../primitives/point";
import { Polygon } from "../primitives/polygon";
import { SceneNode } from "../scene-node";
import { TimeStep } from "../time";

export class Tree extends SceneNode {

  private _point: Point;
  private _levels: Polygon[];
  private _heightCoefficient: number;
  private _numLevels: number;
  public base: Polygon;

  public constructor (position: Vector, size: number, heightCoefficient = 0.15, numLevels = 7) {
    super('tree');
    this._point = new Point(position, { size, color: 'green' });
    this._heightCoefficient = heightCoefficient;
    this._numLevels = numLevels;
    const top = this._getTopPoint();
    
    this._levels = this._generateLevels(top);
    this.base = this._levels[0];
    
    this._levels.forEach((level) => this.addChild(level));
  }

  public get position () {
    return this._point.position;
  }

  public get size () {
    return this._point.size;
  }

  public get center () {
    return this._point;
  }

  private _getTopPoint () {
    const diff = Vector.sub(this.position, Engine.viewport.viewPoint);
    return Vector.add(this.position, diff.scale(this._heightCoefficient));
  }

  private _generateLevels (top: Vector) {
    const levels: Polygon[] = [];
    for (let level = 0; level < this._numLevels; level++) {
      const t = level / (this._numLevels - 1);
      const point = lerp(this.position, top, t);
      const size = lerp(this.size, 10, t);
      const color = `rgb(30,${lerp(50, 200, t)}, 70)`;
      const polygon = this._generateLevel(point, size, color);
      levels.push(polygon);
    }
    return levels;
  }

  private _updateLevels (top: Vector) {
    for (let level = 0; level < this._numLevels; level++) {
      const t = level / (this._numLevels - 1);
      const point = lerp(this.position, top, t);
      const size = lerp(this.size, 10, t);
      
      const radius = size * 0.5;
      for (let a = 0, i = 0; a < Math.PI * 2; a += Math.PI / 16, i++) {
        const rand = Math.cos(((a + this.center.x) * this.size) % 17) ** 2;
        const noisyRadius = radius * lerp(0.75, 1, rand);
        const vec = Vector.translate(point, a, noisyRadius);
        this._levels[level].points[i].position = vec;
      }
    }
  }

  public override update(step: TimeStep): void {
    const top = this._getTopPoint();
    this._updateLevels(top);
    super.update(step);
  }

  private _generateLevel (point: Vector, size: number, color: string) {
    const points: Vector[] = [];
    const radius = size * 0.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
      const rand = Math.cos(((a + this.center.x) * this.size) % 17) ** 2;
      const noisyRadius = radius * lerp(0.75, 1, rand);
      points.push(Vector.translate(point, a, noisyRadius));
    }
    return new Polygon(points, { fill: color, stroke: 'rgba(0,0,0,0)' })
  }
}