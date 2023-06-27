import { Vector2 } from "@utils/utils";
import { GameObject } from "@component/GameObject";
import { Label } from "@primitive/Label/Label";
import { RectangleBounds } from "@primitive/Rectangle/RectangleBounds";

export class FpsCounter extends GameObject {
    label: Label;

    constructor(pos: Vector2) {
        super("fpsCounter");
        this.label = new Label("fpsLabel", new RectangleBounds(pos, [0, 0]));
        this.createTime = this.curTime = performance.now();
    }
    createTime: number;
    upsDelta: number = 0;
    fpsCount: number = 0;
    fpsValues: number[] = [];
    curTime: number;
    static readonly fpsAverageCount: number = 5;
    update(timeStep: number) {
        var currentFps =
            Math.round(
                (1000 / ((this.curTime - this.createTime) / this.fpsCount)) *
                    100
            ) / 100;
        this.upsDelta += timeStep;
        if (this.upsDelta > 1000) {
            this.fpsValues.push(currentFps);
            if (this.fpsValues.length > FpsCounter.fpsAverageCount)
                this.fpsValues = this.fpsValues.filter(
                    (_, i, a) => i > a.length - FpsCounter.fpsAverageCount
                );
            this.upsDelta = 0;
        }
    }
    getAverageFPS() {
        if (this.fpsValues.length > 0)
            return Math.round(
                this.fpsValues.reduce((p, n) => p + n, 0) /
                    this.fpsValues.length
            );
        return 0;
    }
    render(ctx: CanvasRenderingContext2D) {
        this.fpsCount++;
        this.label.text = "FPS: " + this.getAverageFPS();
        this.label.render(ctx);
    }
}
