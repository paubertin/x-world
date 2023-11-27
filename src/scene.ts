import { Engine } from './engine';
import { SceneNode } from './scene-node';
import { TimeStep } from './time';

export class Scene {
  private uniqueIdCounter: number = 0;
  private _engine: Engine;
  private rootNode: SceneNode = new SceneNode(this, 'root');

  public constructor (engine: Engine) {
    this._engine = engine;
    this._engine.addScene(this);
  }

  public setActive (active: boolean = true) {
    this.engine.setActive(this, active);
  }

  public generateUniqueId(): number {
    const result = this.uniqueIdCounter;
    this.uniqueIdCounter++;
    return result;
  }

  public add (node: SceneNode) {
    node.children.forEach((child) => this.add(child));
    (node as any).scene = this;
    (node as any).id = this.generateUniqueId();
    if (node.parent === undefined && node.name !== 'root') {
      this.rootNode.addChild(node);
    }
    return this;
  }

  public get engine () {
    return this._engine;
  }

  public get nodes () {
    return this.rootNode.children;
  }

  public get root () {
    return this.rootNode;
  }

  public getNodes (cb: (node: SceneNode) => boolean, pool: SceneNode[] = this.rootNode.children) {
    const nodes: SceneNode[] = [];
    for (const node of pool) {
      const subNodes = this.getNodes(cb, node.children);
      if (cb(node)) {
        nodes.push(node);
      }
      nodes.push(...subNodes);
    }
    return nodes;
  }

  public update (step: TimeStep) {
    this.rootNode.update(step);
  }

  public render () {
    this.rootNode.render();
  }

  public preRender () {
    this.rootNode.preRender();
  }

  public postRender () {
    this.rootNode.postRender();
  }

}