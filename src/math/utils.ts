import { Point } from "../primitives/point";
import { Vector } from "./vector";

export function getNearestPoint (position: Vector, points: Point[], threshold = Number.MAX_SAFE_INTEGER) {
  let minDist = Infinity;
  let nearest: Point | null = null;
  for (const point of points) {
    const dist = point.position.distanceTo(position);
    if (dist < minDist && dist < threshold) {
      minDist = dist;
      nearest = point;
    }
  }
  return nearest;
}

export function clamp (value: number, min: number, max: number) {
  if (value < min) return 0;
  if (value > max) return max;
  return value;
}

export function lerp(a: Vector, b: Vector, t: number): Vector;
export function lerp(a: number, b: number, t: number): number
export function lerp(a: number | Vector, b: number | Vector, t: number) {
  if (a instanceof Vector) {
    return new Vector(lerp(a.x, (b as Vector).x, t), lerp(a.y, (b as Vector).y, t));
  }
  else {
    return a + ((b as number) - a) * t;
  }
}

export const EPSILON = 1e-6;