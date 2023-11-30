import { Engine } from "./engine";
import { GraphEditor } from "./graph-editor";
import { Inputs } from "./input";
import { Scene } from "./scene";
import { World } from "./world";

async function main () {
  const engine = Engine.create();
  await Engine.initialize();
  
  const scene = new Scene(engine);
  const graphEditor = new GraphEditor();
  const world = new World(graphEditor.graph);
  scene
  .add(world)
    .add(graphEditor)
    .setActive();
  setupButtons(engine, graphEditor);

  Inputs.on('keydown', (evt) => {
    if (evt.key === 'd') {
      world.disable(!world.disabled);
    }
  });

  Engine.run();

}

void main();

function setupButtons (engine: Engine, editor: GraphEditor) {
  document.getElementById('clear')?.addEventListener('click', (evt) => {
    clear(editor);
  });
  document.getElementById('save')?.addEventListener('click', (evt) => {
    Engine.viewport.save();
    save(editor);
  });
  document.getElementById('resetViewport')?.addEventListener('click', (evt) => {
    Engine.viewport.reset();
  });
}

function save (editor: GraphEditor) {
  editor.save();
}

function clear (editor: GraphEditor) {
  editor.clear();
}
