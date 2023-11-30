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

export function lerp(a: number, b: number, t: number) {
   return a + (b - a) * t;
}