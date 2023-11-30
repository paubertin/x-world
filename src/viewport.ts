import { Vector } from "./math/vector";

export interface ViewportOptions {
  canvasId: string;
  width?: number;
  height?: number;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

class Drag {
  public constructor (
    private _start: Vector = new Vector(),
    private _end: Vector = new Vector(),
    private _offset = new Vector(),
    private _active: boolean = false) {}

  public set start (v: Vector) {
    this._start.set(v);
  }

  public get start () {
    return this._start;
  }

  public set end (v: Vector) {
    this._end.set(v);
  }

  public get end () {
    return this._end;
  }

  public set offset (v: Vector) {
    this._offset.set(v);
  }

  public get offset () {
    return this._offset;
  }

  public get active () {
    return this._active;
  }

  public set active (a: boolean) {
    this._active = a;
  }

  public reset () {
    this._start.x = 0;
    this._start.y = 0;
    this._end.x = 0;
    this._end.y = 0;
    this._offset.x = 0;
    this._offset.y = 0;
    this._active = false;
  }

}

export class Viewport {
  private _options: ViewportOptions;
  private _canvas: HTMLCanvasElement;
  private _zoom: number;
  private drag: Drag = new Drag();
  private _offset: Vector;
  private _center: Vector;
  private _minZoom: number;
  private _maxZoom: number;

  public constructor (options: ViewportOptions) {
    this._options = options;
    const canvas = document.getElementById(options.canvasId);
    if (!canvas) throw new Error('no canvas');
    this._canvas = canvas as HTMLCanvasElement;
    this.width = options.width ?? 600;
    this.height = options.height ?? 600;
    this._zoom = options.zoom ?? 1;
    this._center = new Vector(this.width / 2, this.height / 2);
    this._offset = Vector.scale(this._center, -1);
    this._minZoom = options.minZoom ?? 1;
    this._maxZoom = options.maxZoom ?? 8;
    this.load();
    this._addEventListeners();
  }

  public get viewPoint () {
    return Vector.scale(this.getOffset(), -1);
  }

  public get canvas () {
    return this._canvas;
  }

  public get width () {
    return this._canvas.width;
  }

  public set width (w: number) {
    this._canvas.width = w;
  }

  public get height () {
    return this._canvas.height;
  }

  public set height (h: number) {
    this._canvas.height = h;
  }

  public clear (ctx: CanvasRenderingContext2D) {
    ctx.restore();
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.translate(this._center.x, this._center.y);
    ctx.scale(1 / this._zoom, 1 / this._zoom);
    const offset = this.getOffset();
    ctx.translate(offset.x, offset.y);
  }

  private _addEventListeners () {
    this._canvas.addEventListener('wheel', this._handleMouseWheel.bind(this));
    this._canvas.addEventListener('mousedown', this._handleMouseDown.bind(this));
    this._canvas.addEventListener('mousemove', this._handleMouseMove.bind(this));
    this._canvas.addEventListener('mouseup', this._handleMouseUp.bind(this));
  }

  public getMouse (evt: MouseEvent, subtractDragOffset: boolean = false) {
    const p = new Vector(
      (evt.offsetX - this._center.x) * this._zoom - this._offset.x,
      (evt.offsetY - this._center.y) * this._zoom - this._offset.y,
    );
    return subtractDragOffset ? Vector.sub(p, this.drag.offset) : p;
  }

  public getOffset () {
    return Vector.add(this._offset, this.drag.offset);
  }

  private _handleMouseDown (evt: MouseEvent) {
    if (evt.button === 1) { // mid button
      this.drag.start = this.getMouse(evt);
      this.drag.active = true;
    }
  }

  private _handleMouseMove (evt: MouseEvent) {
    if (this.drag.active) {
      this.drag.end = this.getMouse(evt);
      this.drag.offset = Vector.sub(this.drag.end, this.drag.start);
    }
  }

  private _handleMouseUp (evt: MouseEvent) {
    if (this.drag.active) {
      this._offset.add(this.drag.offset);
      this.drag.reset();
    }
  }

  private _handleMouseWheel (evt: WheelEvent) {
    const dir = Math.sign(evt.deltaY);
    const step = 0.1;
    this._zoom += dir * step;
    this._zoom = Math.max(this._minZoom, Math.min(this._maxZoom, this._zoom));
  }

  public reset () {
    this._zoom = this._options.zoom ?? 1;
    this._center = new Vector(this.width / 2, this.height / 2);
    this._offset = Vector.scale(this._center, -1);
  }

  public save () {
    localStorage.setItem('viewport', JSON.stringify({ zoom: this._zoom, center: { x: this._center.x, y: this._center.y }, offset: { x: this._offset.x, y: this._offset.y } }));
  }

  public load () {
    const str = localStorage.getItem('viewport');
    const infos = str ? JSON.parse(str) : null;
    if (infos) {
      this._zoom = infos.zoom;
      this._center.x = infos.center.x;
      this._center.y = infos.center.y;
      this._offset.x = infos.offset.x;
      this._offset.y = infos.offset.y;
    }
  }
}