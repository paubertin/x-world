import { Engine } from "./engine";
import { Inputs } from "./input";
import { Graph } from "./math/graph";
import { clamp, getNearestPoint } from "./math/utils";
import { Vector } from "./math/vector";
import { Point } from "./primitives/point";
import { Segment } from "./primitives/segment";
import { SceneNode } from "./scene-node";

export class GraphEditor extends SceneNode {

  private _selected: Point | null = null;
  private _hovered: Point | null = null;
  private _dragging: boolean = false;
  private _mousePosition!: Vector;
  private _tmpSegment: Segment = new Segment(new Point(0, 0), new Point(0, 0), { color: '#000000b8', lineDash: [3, 3] });

  public constructor() {
    super('graph-editor');
    const graph = this._load();
    this.addChild(graph);
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

  private _select(p: Point | null = null) {
    if (!p) return;
    if (this._selected) {
      this.graph.tryAddSegment(new Segment(this._selected, p));
    }
    this.selected = p;
  }

  private _addEventListeners() {
    Inputs.on('mousedown', this._handleMouseDown.bind(this));
    Inputs.on('mousemove', this._handleMouseMove.bind(this));
    Inputs.on('mouseup', () => this._dragging = false);
    Inputs.on('contextmenu', (evt) => evt.preventDefault());
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
      const added = this.graph.addPoint(this._mousePosition) ?? null;
      this._select(added);
    }
  }

  private _handleMouseMove (evt: MouseEvent) {
    this._mousePosition = Engine.viewport.getMouse(evt, true);
    this.hovered = getNearestPoint(this._mousePosition, this.graph.points, 10);
    if (this._dragging && this._selected) {
      this._selected.position = this._mousePosition;
    }
    if (this._selected) {
      const intent = this._hovered ?? this._mousePosition;
      this._tmpSegment.from = this._selected;
      this._tmpSegment.to = intent;
    }
    this._tmpSegment.enable(this._selected !== null);
  }
  
  public clear () {
    this.graph.clear();
    this._selected = null;
    this._hovered = null;
    this._dragging = false;
  }

  public save () {
    localStorage.setItem('graph', JSON.stringify(this.graph.toJSON()));
  }

  private _load () {
    const graphString = localStorage.getItem('graph');
    const graphInfo = graphString ? JSON.parse(graphString) : null;
    const graph = graphInfo ? Graph.load(graphInfo) : new Graph();
    return graph;
  }
}