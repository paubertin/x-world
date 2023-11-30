import { Graph } from "./math/graph";
import { Envelope } from "./primitives/envelope";
import { Polygon } from "./primitives/polygon";
import { Segment } from "./primitives/segment";
import { SceneNode } from "./scene-node";
import { TimeStep } from "./time";

export class World extends SceneNode {

  private _graph: Graph;
  private _roadWidth: number;
  private _roadRoundness: number;

  private _envelopes: Envelope[] = [];
  private _roadBorders: Segment[] = [];

  public constructor (graph: Graph, roadWidth: number = 100, roadRoundness: number = 10) {
    super('world');
    this._graph = graph;
    this._roadWidth = roadWidth;
    this._roadRoundness = roadRoundness;
    this._generate();
  }

  private _generate () {
    this._envelopes.length = 0;
    for (const seg of this._graph.segments) {
      const envelope = new Envelope(seg, this._roadWidth, this._roadRoundness);
      this.addChild(envelope);
      seg.width = 4;
      seg.color = 'white';
      seg.lineDash = [10, 10];
      this.addChild(seg);
      this._envelopes.push(envelope);
    }

    this._roadBorders = Polygon.union(this._envelopes.map((e) => e.polygon));

    this._roadBorders.forEach((border) => {
      border.color = 'white',
      border.width = 4;
      this.addChild(border);
    });
  }

  public override update (step: TimeStep) {
    this.removeChildren();
    this._generate();
  }

  public override render () {
    super.render();
    // let path = new Path2D();
    // this._envelopes.forEach((e) => path.addPath(e.path));
    // this.context.stroke(path);
  }
}