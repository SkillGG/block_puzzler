import { DevConsole } from "@/console";
import { InputManager } from "@components/KeyboardManager";
import { ObjectManager } from "@components/ObjectManager";
import { Renderable, Updateable } from "@utils";
import { GameOptions } from "@/options";
import { Vector2 } from "@utils";
import { GameState } from "@/main";

export const normalizeVector2RelativeToElement = (
    elem: HTMLElement,
    v: Vector2
): Vector2 => [v[0] + elem.offsetLeft, v[1] + elem.offsetTop];

export const denormalizeVector2RelativeToElement = (
    elem: HTMLElement,
    v: Vector2
): Vector2 => [v[0] - elem.offsetLeft, v[1] - elem.offsetTop];

export const CTXSavedProperties: Set<keyof CanvasRenderingContext2D> = new Set([
    "lineWidth",
    "lineCap",
    "lineJoin",
    "miterLimit",
    "lineDashOffset",
    "font",
    "textAlign",
    "textBaseline",
    "direction",
    "fontKerning",
    "fillStyle",
    "strokeStyle",
    "shadowBlur",
    "shadowColor",
    "shadowOffsetX",
    "shadowOffsetY",
    "globalAlpha",
    "globalCompositeOperation",
    "imageSmoothingEnabled",
    "imageSmoothingQuality",
]);

export class Game<T extends string>
    extends HTMLCanvasElement
    implements Updateable, Renderable
{

    static readonly VERSION = "main v0.0.07"

    static readonly desiredFPS = 60;

    canvasContext: CanvasRenderingContext2D;
    running: boolean = false;
    manager: ObjectManager<T>;
    static readonly WIDTH = 600;
    static readonly HEIGHT = 900;
    readonly gameHeight: number = Game.HEIGHT;
    readonly gameWidth: number = Game.WIDTH;
    readonly devConsole: DevConsole;
    readonly options: GameOptions<T>;

    static input: InputManager = new InputManager();

    static instance: Game<any> | null = null;

    static getRelativeVector(v: Vector2): Vector2 {
        if (!Game.instance) throw "No Game instance present!";
        return Game.instance.getRelativeVector(v);
    }

    static getNormalVector(v: Vector2): Vector2 {
        if (!Game.instance) throw "No Game instance!";
        return Game.instance.getNormalVector(v);
    }

    static getWidth() {
        return this.instance?.width || Game.WIDTH;
    }
    static getHeight() {
        return this.instance?.height || Game.HEIGHT;
    }
    static getSize(): Vector2 {
        return [Game.getWidth(), Game.getHeight()];
    }

    constructor(
        devConsole: DevConsole,
        options: GameOptions<T>,
        defaultState: T
    ) {
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
    getComputedStyle() {
        return window.getComputedStyle(this);
    }
    getRelativeVector(v: Vector2): Vector2 {
        return normalizeVector2RelativeToElement(this, v);
    }
    getNormalVector(v: Vector2): Vector2 {
        return denormalizeVector2RelativeToElement(this, v);
    }
    run() {
        this.running = true;
    }
    stop() {
        this.running = false;
    }
    checkUI() {
        if (this.options.stateManager) {
            if (this.options.isHidden) {
                if (
                    !this.manager.getStateManager(
                        this.options.stateManager.defaultID
                    )
                ) {
                    this.manager.addStateManager(this.options.stateManager);
                }
            } else {
                this.manager.removeStateManager(
                    this.options.stateManager.defaultID
                );
            }
        }
    }
    async update(timeStep: number) {
        await this.manager.update(timeStep);
        await Game.input.update();
        await this.options.refreshUI();
    }
    async render() {
        await this.checkUI();
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        await this.manager.render(this.canvasContext);
    }
}
customElements.define("game-", Game, { extends: "canvas" });
declare global {
    interface Window {
        game: Game<GameState>;
        Game: typeof Game;
    }
}
window.Game = Game;
