import { Vector2 } from "@utils/utils";
import { GameObject } from "@component/GameObject";
import { Label } from "@primitive/Label/Label";
import { RectangleBounds } from "@primitive/Rectangle/RectangleBounds";

export class FpsCounter extends GameObject {
    label: Label;

    constructor(pos: Vector2) {
        super("fpsCounter");
        this.label = new Label("fpsLabel", new RectangleBounds(pos, [0, 0]));
    }
    upsCount: number = 0;
    upsDelta: number = 0;
    fpsCount: number = 0;
    fpsValues: number[] = [];
    static readonly fpsAverageCount: number = 5;
    update(timeStep: number) {
        this.upsCount++;
        this.upsDelta += timeStep;
        if (this.upsDelta > 1000) {
            this.fpsValues.push(this.fpsCount);
            if (this.fpsValues.length > FpsCounter.fpsAverageCount)
                this.fpsValues = this.fpsValues.filter(
                    (_, i, a) => i > a.length - FpsCounter.fpsAverageCount
                );
            this.upsCount = 0;
            this.upsDelta = 0;
            this.fpsCount = 0;
        }
    }
    addRender() {
        this.fpsCount++;
    }
    getAverageFPS() {
        if (this.fpsValues.length > 0)
            return Math.round(this.fpsValues.reduce((p, n) => (p + n) / 2));
        return 0;
    }
    render(ctx: CanvasRenderingContext2D) {
        this.fpsCount++;
        this.label.text = "FPS: " + this.getAverageFPS();
        this.label.render(ctx);
    }
}
