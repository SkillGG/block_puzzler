import { Tile } from "@components/Playfield/Tile/tile";
import { CanAnimate } from "./animation";
import { RectangleBounds } from "@components/Primitives/Rectangle/RectangleBounds";
import { Vector2, asyncNonce } from "@utils";

export class AnimatableTile extends Tile implements CanAnimate {
    constructor(animId: string, t: Tile) {
        super(
            t.id + `_anim${animId}`,
            { ...t.originalAnchor },
            [t.coords.col, t.coords.row],
            [...t.size]
        );
        this.color = t.color;
        this.bounds = new RectangleBounds(t.bounds);
        this.zIndex = 9;
    }
    offsetXY: Vector2 = [0, 0];
    offsetSize: Vector2 = [0, 0];
    moveBy(x: number, y: number): void;
    moveBy(v: Vector2): void;
    moveBy(x: number | Vector2, y?: number) {
        if (Array.isArray(x) && typeof y === "undefined") {
            this.offsetXY[0] += x[0];
            this.offsetXY[1] += x[1];
        } else if (typeof x === "number" && typeof y === "number") {
            this.offsetXY[0] += x;
            this.offsetXY[1] += y;
        }
    }
    resizeBy(x: number, y: number): void;
    resizeBy(v: Vector2): void;
    resizeBy(width: number | Vector2, height?: number) {
        if (Array.isArray(width) && typeof height === "undefined") {
            this.offsetSize[0] += width[0];
            this.offsetSize[1] += width[1];
        } else if (typeof width === "number" && typeof height === "number") {
            this.offsetSize[0] += width;
            this.offsetSize[1] += height;
        }
    }

    async render(ctx: CanvasRenderingContext2D, _frame?: number) {
        let { x, y, width: w, height: h } = this.bounds;
        x += this.offsetXY[0];
        y += this.offsetXY[1];
        w += this.offsetSize[0];
        h += this.offsetSize[1];
        ctx.fillStyle = this.color;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.rect(x, y, w, h);
        ctx.fill();
        ctx.stroke();
        this.renderPath(ctx);
    }
    async update() {}
}
