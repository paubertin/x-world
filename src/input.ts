
export class Inputs {
  private static instance: Inputs;
  private _lastTarget: EventTarget | null = this.canvas;

  private eventsCallbacks: Map<keyof HTMLElementEventMap, ((evt: any) => any)[]> = new Map();

  private constructor(private canvas: HTMLCanvasElement) {
  }

  public static initialize(canvas: HTMLCanvasElement) {
    if (!this.instance) {
      this.instance = new Inputs(canvas);
      document.addEventListener('mousemove', (evt) => this.instance._lastTarget = evt.target);
    }
  }

  public static on <K extends keyof HTMLElementEventMap>(event: K, cb: (evt: HTMLElementEventMap[K]) => any, target: EventTarget = this.instance.canvas) {
    let callbacks = this.instance.eventsCallbacks.get(event);
    if (!callbacks) {
      document.addEventListener(event, (evt) => {
        if (target === this.instance._lastTarget || target === document) {
          this.instance.eventsCallbacks.get(evt.type as keyof HTMLElementEventMap)?.forEach((cb) => cb(evt));
        }
      })
      callbacks = [];
    }
    callbacks.push(cb);
    this.instance.eventsCallbacks.set(event, callbacks);
  }
}
