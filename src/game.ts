import { DevConsole } from "@/console";

import { InputManager } from "@component/KeyboardManager";
import { ObjectManager } from "@component/ObjectManager";
import { Renderable, Updateable } from "@component/interfaces";
import { GameOptions } from "@/options";
import { Vector2 } from "@utils/utils";

export const normalizeVector2RelativeToElement = (
    elem: HTMLElement,
    v: Vector2
): Vector2 => [v[0] + elem.offsetLeft, v[1] + elem.offsetTop];

export class Game<T extends string>
    extends HTMLCanvasElement
    implements Updateable, Renderable
{
    canvasContext: CanvasRenderingContext2D;
    running: boolean = false;
    manager: ObjectManager<T>;
    readonly gameHeight: number = 800;
    readonly gameWidth: number = 600;
    readonly devConsole: DevConsole;
    readonly options: GameOptions;

    static readonly WIDTH = 600;
    static readonly HEIGHT = 800;

    static input: InputManager = new InputManager();

    static instance: Game<any> | null = null;

    static getRelativeVector(v: Vector2): Vector2 {
        if (!Game.instance) throw "No Game instance present!";
        return Game.instance.getRelativeVector(v);
    }

    static getWidth() {
        return this.instance?.width || Game.WIDTH;
    }
    static getHeigth() {
        return this.instance?.height || Game.HEIGHT;
    }
    static getSize(): Vector2 {
        return [Game.getWidth(), Game.getHeigth()];
    }

    constructor(devConsole: DevConsole, options: GameOptions, defaultState: T) {
        super();
        this.options = options;
        this.devConsole = devConsole;
        const cC = this.getContext("2d");
        this.manager = new ObjectManager<T>(this, defaultState);
        if (!cC) {
            this.canvasContext = new CanvasRenderingContext2D();
            this.stop();
            return;
        }
        this.canvasContext = cC;
        this.width = this.gameWidth;
        this.height = this.gameHeight;
        Game.instance = this;
    }
    getRelativeVector(v: Vector2): Vector2 {
        return normalizeVector2RelativeToElement(this, v);
    }
    run() {
        this.running = true;
    }
    stop() {
        this.running = false;
    }
    addDrawCall(drawFn: (ctx: CanvasRenderingContext2D) => void) {
        drawFn(this.canvasContext);
    }
    update(timeStep: number) {
        this.manager.update(timeStep);
        Game.input.update();
    }
    render() {
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        this.manager.render(this.canvasContext);
    }
}
customElements.define("game-", Game, { extends: "canvas" });
