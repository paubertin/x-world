export class Vector {
  public constructor (private _x: number = 0, private _y: number = 0) {}

  public get x () {
    return this._x;
  }

  public set x (x: number) {
    this._x = x;
  }

  public get y () {
    return this._y;
  }

  public set y (y: number) {
    this._y = y;
  }

  public set (other: Vector) {
    this._x = other._x;
    this._y = other._y;
    return this;
  }

  public equals (other: Vector) {
    return this._x === other._x && this._y === other._y;
  }

  public distanceTo (other: Vector) {
    return Math.hypot(this._x - other._x, this._y - other._y);
  }

  public add (other: Vector) {
    this._x += other._x;
    this._y += other._y;
    return this;
  }

  public static add (v: Vector, w: Vector) {
    return new Vector(v.x + w.x, v.y + w.y);
  }

  public static sub (v: Vector, w: Vector) {
    return new Vector(v.x - w.x, v.y - w.y);
  }
  public static scale (v: Vector, s: number) {
    return new Vector(v.x * s, v.y * s);
  }

  public static translate (v: Vector, angle: number, offset: number) {
    return new Vector(
      v.x + Math.cos(angle) * offset,
      v.y + Math.sin(angle) * offset,
    );
  }

  public static midPoint (v: Vector, w: Vector) {
    return new Vector((v.x + w.x) * 0.5, (v.y + w.y) * 0.5);
  }

  public get headingDeg () {
    return Math.atan2(this.y, this.x) * 180 / Math.PI;
  }

  public get heading () {
    return Math.atan2(this.y, this.x);
  }
}