import { Engine } from "../engine";
import { Vector } from "../math/vector";
import { Polygon } from "../primitives/polygon";
import { SceneNode } from "../scene-node";
import { TimeStep } from "../time";

export class Building extends SceneNode {
  public base: Polygon;
  private _ceiling: Polygon;
  private _sides: Polygon[];
  private _height: number;

  public constructor (basePolygon: Polygon, height = 100) {
    super('bulding');
    this.base = new Polygon(basePolygon, { fill: 'white', stroke: '#AAA' });
    this.addChild(this.base);
    this._height = height;
    this._ceiling = this._generateCeiling();
    
    this._sides = this._generateSides();
    this._sides.forEach((side) => this.addChild(side));
    this.addChild(this._ceiling);

  }

  private _getTopPoint (pos: Vector) {
    return Engine.viewport.getFake3dPoint(pos, this._height);
  }

  private _getTopPoints () {
    return this.base.points.map((p) => this._getTopPoint(p.position));
  }

  private _generateCeiling () {
    const topPoints = this._getTopPoints();
    return new Polygon(topPoints, { fill: 'white', stroke: '#AAA' });
  }

  private _updateCeiling () {
    const topPoints = this._getTopPoints();
    for (let i = 0; i < topPoints.length; ++i) {
      this._ceiling.points[i].position = topPoints[i];
    }
  }

  public override update(step: TimeStep): void {
    this._updateCeiling();
    this.removeChild(this._ceiling);
    this._sides.forEach((side) => this.removeChild(side));
    this._sides = this._generateSides();
    this._sides.forEach((side) => this.addChild(side));
    this.addChild(this._ceiling);
    super.update(step);
  }

  private _generateSides () {
    const sides: Polygon[] = [];
    for (let i = 0; i < this.base.points.length; ++i) {
      const nextI = (i + 1) % this.base.points.length;
      const poly = new Polygon([
        this.base.points[i], this.base.points[nextI],
        this._ceiling.points[nextI], this._ceiling.points[i],
      ], { fill: 'white', stroke: '#AAA' });
      sides.push(poly);
    }
    return sides.sort((a, b) => {
      return b.distanceTo(Engine.viewport.viewPoint) - a.distanceTo(Engine.viewport.viewPoint);
    });
  }
}