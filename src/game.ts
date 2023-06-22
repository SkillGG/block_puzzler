import { FpsCounter } from "./fpsCounter";
export class Game extends HTMLCanvasElement {
    canvasContext: CanvasRenderingContext2D;
    fpsCounter: FpsCounter;
    constructor(stop: () => void) {
        super();
        this.fpsCounter = new FpsCounter();
        const cC = this.getContext("2d");
        if (!cC) {
            this.canvasContext = new CanvasRenderingContext2D();
            stop();
            return;
        }
        this.canvasContext = cC;
        this.width = 800;
        this.height = 600;
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
