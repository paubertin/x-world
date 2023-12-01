import { Engine } from "./engine";
import { Building } from "./items/building";
import { Tree } from "./items/tree";
import { Graph } from "./math/graph";
import { EPSILON, lerp } from "./math/utils";
import { Vector } from "./math/vector";
import { Envelope } from "./primitives/envelope";
import { Polygon } from "./primitives/polygon";
import { Segment } from "./primitives/segment";
import { SceneNode } from "./scene-node";
import { TimeStep } from "./time";
import { DeepRequired } from "./utils";

export interface WorldOptions {
  graph: Graph;
  roads?: {
    width?: number;
    roundness?: number;
  };
  buildings?: {
    width?: number;
    minLength?: number;
    spacing?: number;
    minOffset?: number;
    maxOffset?: number;
  };
  trees?: {
    density?: number;
    minRadius?: number;
    maxRadius?: number;
  },
}

export class World extends SceneNode {
  private _options: DeepRequired<WorldOptions>;

  private _envelopes: Envelope[] = [];
  private _roadBorders: Segment[] = [];
  private _buildings: Building[] = [];
  private _trees: Tree[] = [];

  private _graphHash: string;

  public get graph () {
    return this._options.graph;
  }

  public constructor (options: WorldOptions) {
    super('world');
    this._options = {
      graph: options.graph,
      roads: {
        width: options.roads?.width ?? 100,
        roundness: options.roads?.roundness ?? 10,
      },
      buildings: {
        width: options.buildings?.width ?? 150,
        minLength: options.buildings?.minLength ?? 150,
        spacing: options.buildings?.spacing ?? 50,
        minOffset: options.buildings?.minOffset ?? 0,
        maxOffset: options.buildings?.maxOffset?? 0,
      },
      trees: {
        minRadius: options.trees?.minRadius ?? 50,
        maxRadius: options.trees?.maxRadius ?? 80,
        density: options.trees?.density ?? 3,
      },
    };
    this._graphHash = this.graph.hash;
    this._generate();
  }

  private _generate () {
    this._envelopes.length = 0;
    for (const seg of this.graph.segments) {
      const envelope = new Envelope(seg, this._options.roads.width, this._options.roads.roundness);
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

    this._buildings = [];
    this._trees = [];
    const buildings = this._generateBuildings();
    const trees = this._generateTrees(buildings);

    const items = [...buildings, ...trees].sort((a, b) => {
      return b.base.distanceTo(Engine.viewport.viewPoint) - a.base.distanceTo(Engine.viewport.viewPoint);
    });;

    items.forEach((item) => {
      if (item instanceof Building) {
        this._buildings.push(item);
      }
      else {
        this._trees.push(item);
      }
      this.addChild(item);
    });
  }

  public override update (step: TimeStep) {
    if (this.graph.hash !== this._graphHash) {
      this._graphHash = this.graph.hash;
      this.removeChildren();
      this._generate();
    }
    super.update(step);
  }

  public override render () {
    this._children.forEach((child) => {
      if (child instanceof Building || child instanceof Tree) {
        this.removeChild(child);
      }
    });
    const items = [...this._buildings, ...this._trees].sort((a, b) => {
      return b.base.distanceTo(Engine.viewport.viewPoint) - a.base.distanceTo(Engine.viewport.viewPoint);
    });;

    items.forEach((item) => {
      this.addChild(item);
    });
    super.render();
    // let path = new Path2D();
    // this._envelopes.forEach((e) => path.addPath(e.path));
    // this.context.stroke(path);
  }

  private _generateTrees (buildings: Building[]) {
    const points = [
      ...this._roadBorders.map((s) => [s.to, s.to]).flat(),
      ...this._buildings.map((s) => s.base.points).flat(),
    ];

    const left = Math.min(...points.map((p) => p.x)) - this._options.trees.maxRadius;
    const right = Math.max(...points.map((p) => p.x)) + this._options.trees.maxRadius
    const bottom = Math.max(...points.map((p) => p.y)) + this._options.trees.maxRadius;
    const top = Math.min(...points.map((p) => p.y)) - this._options.trees.maxRadius;

    const area = (bottom - top) * (right - left);
    const count = this._options.trees.density * area / 1000000;

    const illegalPolygons = [
      ...buildings.map((b) => b.base),
      ...this._envelopes.map((e) => e.polygon),
    ];

    const trees: Tree[] = [];
    while (trees.length < count) {
      const radius = lerp(this._options.trees.minRadius, this._options.trees.maxRadius, Math.random());
      const tree = new Tree(
        new Vector(
          lerp(left, right, Math.random()),
          lerp(bottom, top, Math.random()),
        ),
        radius * 2,
      );
      let keep = true;
      for (const poly of illegalPolygons) {
        if (poly.contains(tree.center) || poly.distanceTo(tree.position) < tree.size * 0.75) {
          keep = false;
          break;
        }
      }
      if (keep) {
        for (const t of trees) {
          if (t.position.distanceTo(tree.position) < 0.5 * (t.size + tree.size) + 10) {
            keep = false;
            break;
          }
        }
      }
      if (keep) {
        let close = false;
        for (const poly of illegalPolygons) {
          if (poly.distanceTo(tree.position) < tree.size * 2) {
            close = true;
            break;
          }
        }
        keep = close;
      }
      if (keep) {
        trees.push(tree);
      }
    }

    return trees;
  }

  private _generateBuildings () {
    const envelopes: Envelope[] = [];
    for (const seg of this.graph.segments) {
      envelopes.push(
        new Envelope(seg, this._options.roads.width + this._options.buildings.width + this._options.buildings.spacing * 2, this._options.roads.roundness),
      );
    }

    const guides = Polygon.union(envelopes.map((e) => e.polygon));

    for (let i = 0; i < guides.length; ++i) {
      const seg = guides[i];
      if (seg.length < this._options.buildings.minLength) {
        guides.splice(i, 1);
        i--;
      }
    }

    const supports: Segment[] = [];

    for (const seg of guides) {
      const len = seg.length + this._options.buildings.spacing;
      const count = Math.floor(len / (this._options.buildings.minLength + this._options.buildings.spacing));
      const buildingLength = len / count - this._options.buildings.spacing;

      const dir = seg.directionVector;
      let q1 = seg.from.position;
      let q2 = Vector.add(q1, Vector.scale(dir, buildingLength));
      let support = new Segment(q1, q2);
      let perp = support.vector.perp.normalize();
      let angle = perp.heading;
      let translation = lerp(this._options.buildings.minOffset, this._options.buildings.maxOffset, Math.random());
      let from = Vector.translate(support.from.position, angle, translation);
      let to = Vector.translate(support.to.position, angle, translation);
      support.from = from;
      support.to = to;
      supports.push(support);

      for (let i = 2; i <= count; ++i) {
        q1 = q2.add(Vector.scale(dir, this._options.buildings.spacing));
        q2 = Vector.add(q1, Vector.scale(dir, buildingLength));
        support = new Segment(q1, q2);
        perp = support.vector.perp.normalize();
        angle = perp.heading;
        translation = lerp(this._options.buildings.minOffset, this._options.buildings.maxOffset, Math.random());
        from = Vector.translate(support.from.position, angle, translation);
        to = Vector.translate(support.to.position, angle, translation);
        support.from = from;
        support.to = to;
        supports.push(support);
      }
    }

    const bases: Polygon[] = [];

    for (const seg of supports) {
      bases.push(
        new Envelope(seg, this._options.buildings.width).polygon,
      );
    }

    for (let i = 0; i < bases.length - 1; ++i) {
      for (let j = i+1; j < bases.length ; ++j) {
        if (bases[i].intersects(bases[j]) || bases[i].distanceTo(bases[j]) < this._options.buildings.spacing - EPSILON) {
          bases.splice(j, 1);
          j--;
        }
      }
    }

    return bases.map((b) => new Building(b));
  }
}