import { Engine } from "./engine";
import { GraphEditor } from "./graph-editor";
import { Graph } from "./math/graph";
import { Point } from "./primitives/point";
import { Segment } from "./primitives/segment";
import { Scene } from "./scene";

async function main () {
  const engine = Engine.create();
  await Engine.initialize();


  const p1 = new Point(200, 200);
  const p2 = new Point(500, 200);
  const p3 = new Point(400, 400);
  const p4 = new Point(200, 300);

  const s1 = new Segment(p1, p2);
  const s2 = new Segment(p1, p3);
  const s3 = new Segment(p1, p4);
  const s4 = new Segment(p2, p3);
  
  const scene = new Scene(engine);
  const graph = new Graph([p1, p2, p3, p4], [ s1, s2, s3, s4 ]);
  const graphEditor = new GraphEditor(graph);
  scene.add(graphEditor).setActive();
  setupButtons(engine, graph);


  Engine.run();

}


void main();

function setupButtons (engine: Engine, graph: Graph) {
  document.getElementById('addRandomPoint')?.addEventListener('click', (evt) => {
    addRandomPoint(graph, engine);
  });
  document.getElementById('addRandomSegment')?.addEventListener('click', (evt) => {
    addRandomSegment(graph, engine);
  });
  document.getElementById('removeRandomPoint')?.addEventListener('click', (evt) => {
    removeRandomPoint(graph, engine);
  });
  document.getElementById('removeRandomSegment')?.addEventListener('click', (evt) => {
    removeRandomSegment(graph, engine);
  });
  document.getElementById('clearGraph')?.addEventListener('click', (evt) => {
    clearGraph(graph, engine);
  });
}

function addRandomPoint (graph: Graph, engine: Engine) {
  const success = graph.tryAddPoint(
    new Point(Math.random() * engine.canvas.width, Math.random() * engine.canvas.height),
  );
  console.log('success', success);
  engine.context.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
  graph.render();
}

function addRandomSegment (graph: Graph, engine: Engine) {
  if (graph.points.length < 2) {
    console.log('not enough points in graph');
    return;
  }
  const i = Math.floor(Math.random() * graph.points.length);
  const j = Math.floor(Math.random() * graph.points.length);
  const success = graph.tryAddSegment(
    new Segment(graph.points[i], graph.points[j]),
  );
  console.log('success', success);
  engine.context.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
  graph.render();
}

function removeRandomPoint (graph: Graph, engine: Engine) {
  if (graph.points.length === 0) {
    console.log('no points');
    return;
  }
  else {
    const idx = Math.floor(Math.random() * graph.points.length);
    graph.removePointAtIndex(idx);
  }
  engine.context.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
  graph.render();
}

function removeRandomSegment (graph: Graph, engine: Engine) {
  if (graph.segments.length === 0) {
    console.log('no segments');
    return;
  }
  else {
    const idx = Math.floor(Math.random() * graph.segments.length);
    graph.removeSegmentAtIndex(idx);
  }
  engine.context.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
  graph.render();
}

function clearGraph (graph: Graph, engine: Engine) {
  graph.clear();
  engine.context.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
  graph.render();
}