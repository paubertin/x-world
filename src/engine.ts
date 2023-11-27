import { Debugger } from './debugger';
import { Timer, TimeStep } from './time';
import { Scene } from './scene';
import { Inputs } from './input';


interface LoopParameters {
  timer: number;
  updateTimer: number;
  updateTick: number;
  updateStep: TimeStep;
  step: TimeStep;
}

export class Engine {
  private _canvas!: HTMLCanvasElement;
  private _context!: CanvasRenderingContext2D;
  private static instance: Engine;

  private gameTime: number = 0;
  private debugger: Debugger = new Debugger();
  private timer: Timer = new Timer(false);
  private loopParameters!: LoopParameters;

  private scenes: Scene[] = [];

  private activeScene?: Scene;

  private constructor() { }

  public static async initialize() {
    return new Promise((resolve, reject) => {
      window.addEventListener('load', () => {
        if (!this.instance) reject('Engine has not been created');
        const canvas = document.getElementById('canvas');
        if (!canvas) throw new Error('no canvas');
        this.instance._canvas = canvas as HTMLCanvasElement;
        this.instance._canvas.width = 600;
        this.instance._canvas.height = 600;
  
        const ctx = this.instance.canvas.getContext('2d');
        if (!ctx) throw new Error('no context');
        this.instance._context = ctx;
        Inputs.initialize(this.instance._canvas);
        resolve(this.instance!);
      });
    });
  }

  public addScene (scene: Scene) {
    this.scenes.push(scene);
  }

  public setActive (scene: Scene, active: boolean = true) {
    if (active) {
      this.activeScene = scene;
    }
    else {
      this.activeScene = undefined;
    }
    console.log('active scene', this.activeScene);
  }

  public static create () {
    if (!this.instance) {
      this.instance = new Engine();
    }
    return this.instance;
  }

  public get context () {
    return this._context;
  }

  public get canvas () {
    return this._canvas;
  }

  public static get context () {
    return this.instance.context;
  }

  public static get canvas () {
    return this.instance.canvas;
  }

  public static run () {
    if (!this.instance) throw new Error('Engine has not been created');
    this.instance.timer.start();
    this.instance.loopParameters = {
      timer: 0.0,
      updateTimer: this.instance.timer.timeMs,
      updateTick: 1000.0 / 60.0,
      updateStep: new TimeStep(this.instance.timer.timeMs),
      step: new TimeStep(this.instance.timer.timeMs),
  };
    this.instance.loop();
  }

  private loop () {
    // begin frame
    const now = this.timer.timeMs;
    this.beginFrame();

    this.loopParameters.step.update(now);

    this.debugger.stats.currFrame.id = this.debugger.stats.prevFrame.id + 1;
    this.debugger.stats.currFrame.delta = this.loopParameters.step.millis;
    this.debugger.stats.currFrame.fps = 1.0 / (this.loopParameters.step.millis / 1000);

    // update
    if (now - this.loopParameters.updateTimer > this.loopParameters.updateTick) {
        this.loopParameters.updateStep.update(now);
        this.timer.tick();
        this.preUpdate(this.loopParameters.updateStep);
        this.update(this.loopParameters.updateStep);
        this.postUpdate(this.loopParameters.updateStep);
        this.debugger.stats.currFrame.duration.update = this.timer.elapsedMs;
        this.loopParameters.updateTimer += this.loopParameters.updateTick;
    }

    // render
    this.timer.tick();
    this.preRender();
    this.render();
    this.postRender();
    this.debugger.stats.currFrame.duration.render = this.timer.elapsedMs;

    // end frame
    this.endFrame();
  
    requestAnimationFrame(this.loop.bind(this));
  }

  private beginFrame () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.canvas!.height = window.innerHeight;
  }

  private endFrame () {}

  private preUpdate (step: TimeStep) {}
  private update (step: TimeStep) {
    this.activeScene?.root.update(step);
  }
  private postUpdate (step: TimeStep) {}

  private preRender () {
    this.activeScene?.root.preRender();
  }

  private render () {
    this.activeScene?.root.render();
  }
  private postRender () {
    this.activeScene?.root.postRender();
  }
}