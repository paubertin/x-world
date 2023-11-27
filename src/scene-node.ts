import { Scene } from './scene';
import { TimeStep } from './time';

export class SceneNode {
  protected _name: string = 'default';
  protected id?: number;
  protected scene?: Scene;
  protected _parent?: SceneNode;
  protected _children: SceneNode[] = [];
  protected _disabled: boolean = false;

  public constructor (name?: string)
  public constructor (scene: Scene, name?: string, parent?: SceneNode)
  public constructor (scene?: Scene | string, name?: string, parent?: SceneNode) {
    if (scene instanceof Scene) {
      this._name = name ?? 'default';
      parent?.addChild(this);
      scene.add(this);
    }
    else {
      this._name = scene ?? 'default';
    }
  }

  public addToScene (scene: Scene) {
    scene.add(this);
  }

  public addChild (node: SceneNode) {
    node._parent = this;
    this._children.push(node);
    if (!node.scene) {
      this.scene?.add(node);
    }
    return this;
  }

  public removeChild (node: SceneNode | null) {
    if (!node) return;
    this._children.splice(this._children.indexOf(node), 1);
    node._parent = undefined;
  }

  public get name(): string {
      return this._name;
  }

  public get parent(): SceneNode | undefined {
      return this._parent;
  }

  public get children(): SceneNode[] {
      return this._children;
  }

  public update (step: TimeStep) {
    this._children.forEach((child) => child.update(step));
  }

  public render () {
    this._children.filter((child) => !child._disabled).forEach((child) => child.render());
  }

  public preRender () {
    this._children.forEach((child) => child.preRender());
  }

  public postRender () {
    this._children.forEach((child) => child.postRender());
  }

  public disable (value: boolean = true) {
    this._disabled = value;
  }

  public enable (value: boolean = true) {
    this._disabled = !value;
  }

  protected get context () {
    if (!this.scene) throw new Error();
    return this.scene?.engine.context;
  }

  protected get canvas () {
    if (!this.scene) throw new Error();
    return this.scene?.engine.canvas;
  }

}