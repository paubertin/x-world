import { Inputs } from "./input";
import { Graph } from "./math/graph";
import { clamp, getNearestPoint } from "./math/utils";
import { Point } from "./primitives/point";
import { Segment } from "./primitives/segment";
import { SceneNode } from "./scene-node";

export class GraphEditor extends SceneNode {

  private _selected: Point | null = null;
  private _hovered: Point | null = null;
  private _dragging: boolean = false;
  private _mousePosition!: Point;
  private _tmpSegment: Segment = new Segment(new Point(0, 0), new Point(0, 0), { color: '#000000b8', lineDash: [3, 3] });

  public constructor(graph?: Graph) {
    super('graph-editor');
    this.addChild(graph ?? new Graph());
    this.graph.addChild(this._tmpSegment);

    this._addEventListeners();
  }

  public get graph() {
    return this._children[0] as Graph;
  }

  public set selected(p: Point | null) {
    this._selected?.outline(false);
    this._selected = p;
    this._selected?.outline();
    if (!this._selected) this._tmpSegment.disable();
  }

  public get selected() {
    return this._selected;
  }

  public set hovered(p: Point | null) {
    this.hovered?.fill(false);
    this._hovered = p;
    this.hovered?.fill();
  }

  public get hovered() {
    return this._hovered;
  }

  private _select(point: Point | null = null) {
    // this.removeChild(this._tmpSegment);
    if (!point) return;
    if (this._selected) {

      // this.graph.removeSegment(this._tmpSegment);
      const added = this.graph.tryAddSegment(new Segment(this._selected, point));
      // console.log('added segment', added);
    }
    this.selected = point;

  }

  private _addEventListeners() {
    Inputs.on('mousedown', this._handleMouseDown.bind(this));
    Inputs.on('mousemove', this._handleMouseMove.bind(this));
    Inputs.on('mouseup', () => this._dragging = false);
    Inputs.on('contextmenu', (evt) => evt.preventDefault());
    Inputs.on('keydown', (evt) => console.log(evt));
  }

  private _handleMouseDown (evt: MouseEvent) {
    if (evt.button === 2) { // right click
      if (this.selected) {
        this.selected = null
      }
      else if (this.hovered) {
        this.graph.removePoint(this.hovered);
        this.hovered = null;
      }
    }
    if (evt.button === 0) { // left click
      if (this._hovered) {
        this._select(this._hovered);
        this._dragging = true;
        return;
      }
      this.graph.addPoint(this._mousePosition);
      this._select(this._mousePosition);
    }
  }

  private _handleMouseMove (evt: MouseEvent) {
    this._mousePosition = new Point(evt.offsetX, evt.offsetY);
    this.hovered = getNearestPoint(this._mousePosition, this.graph.points, 10);
    if (this._dragging && this._selected) {
      this._selected.x = this._mousePosition.x;
      this._selected.y = this._mousePosition.y;
    }
    if (this._selected) {
      const intent = this._hovered ?? this._mousePosition;
      this._tmpSegment.from = this._selected;
      this._tmpSegment.to = intent;
    }
    this._tmpSegment.enable(this._selected !== null);
  }

  public override render(): void {
    super.render();
  }
}