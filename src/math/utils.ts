import { Point } from "../primitives/point";

export function getNearestPoint (position: Point, points: Point[], threshold = Number.MAX_SAFE_INTEGER) {
  let minDist = Infinity;
  let nearest: Point | null = null;
  for (const point of points) {
    const dist = distance(point, position);
    if (dist < minDist && dist < threshold) {
      minDist = dist;
      nearest = point;
    }
  }
  return nearest;
}

export function distance (a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function clamp (value: number, min: number, max: number) {
  if (value < min) return 0;
  if (value > max) return max;
  return value;
}