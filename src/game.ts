import { DevConsole } from "./console";
import { FpsCounter } from "./fpsCounter";
import { GameOptions } from "./options";
export class Game extends HTMLCanvasElement {
    canvasContext: CanvasRenderingContext2D;
    fpsCounter: FpsCounter;
    readonly gameHeight: number = 800;
    readonly gameWidth: number = 600;
    readonly devConsole: DevConsole;
    readonly options: GameOptions;
    constructor(
        stop: () => void,
        devConsole: DevConsole,
        options: GameOptions
    ) {
        super();
        this.options = options;
        this.devConsole = devConsole;
        this.fpsCounter = new FpsCounter();
        const cC = this.getContext("2d");
        if (!cC) {
            this.canvasContext = new CanvasRenderingContext2D();
            stop();
            return;
        }
        this.canvasContext = cC;
        this.width = this.gameWidth;
        this.height = this.gameHeight;
    }
    run() {
        if (this.canvasContext) this.setupGameLoop();
    }
    addDrawCall(drawFn: (ctx: CanvasRenderingContext2D) => void) {
        drawFn(this.canvasContext);
    }
    update(timeStep: number) {
        this.fpsCounter.update(timeStep);
    }
    render() {
        this.fpsCounter.addRender();
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        this.canvasContext.fillText(
            "FPS: " + this.fpsCounter.getAverageFPS(),
            100,
            100
        );
    }
    setupGameLoop() {}
}
customElements.define("game-", Game, { extends: "canvas" });
