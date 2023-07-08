import { Tile, TileColor, TileEvents } from "@components/Playfield/Tile/tile";
import { CanAnimate } from "./animation";
import { RectangleBounds } from "@components/Primitives/Rectangle/RectangleBounds";
import { Vector2, noop } from "@utils";
import { Game } from "@/game";

export class AnimatableTile extends Tile implements CanAnimate {
    constructor(
        animId: string,
        t: Tile,
        events: TileEvents = { onenter: noop, onleave: noop },
        zIndex?: number
    ) {
        super(t.id + `_anim${animId}`, t, { events });
        this.color = t.color;
        this.bounds = new RectangleBounds(t.bounds);
        this.zIndex = zIndex || 0;
    }
    frame = 0;
    fps = Game.desiredFPS;
    offsetXY: Vector2 = [0, 0];
    offsetSize: Vector2 = [0, 0];
    moveOffsetBy(x: number, y: number): void;
    moveOffsetBy(v: Vector2): void;
    moveOffsetBy(x: number | Vector2, y?: number) {
        if (Array.isArray(x) && typeof y === "undefined") {
            this.offsetXY[0] += x[0];
            this.offsetXY[1] += x[1];
        } else if (typeof x === "number" && typeof y === "number") {
            this.offsetXY[0] += x;
            this.offsetXY[1] += y;
        }
    }
    resizeOffsetBy(x: number, y: number): void;
    resizeOffsetBy(v: Vector2): void;
    resizeOffsetBy(width: number | Vector2, height?: number) {
        if (Array.isArray(width) && typeof height === "undefined") {
            this.offsetSize[0] += width[0];
            this.offsetSize[1] += width[1];
        } else if (typeof width === "number" && typeof height === "number") {
            this.offsetSize[0] += width;
            this.offsetSize[1] += height;
        }
    }

    timeElapsed = 0;

    async update(dT: number): Promise<void> {
        super.update(dT);

        const frameInterval = 1000 / this.fps;

        if (this.timeElapsed > frameInterval) {
            const framesDelta = Math.floor(this.timeElapsed / frameInterval);
            this.frame += framesDelta;
            this.timeElapsed = 0;
        }

        this.timeElapsed += dT;
    }

    async render(ctx: CanvasRenderingContext2D) {
        let { x, y, width: w, height: h } = this.bounds;

        x += this.offsetXY[0];
        y += this.offsetXY[1];
        w += this.offsetSize[0];
        h += this.offsetSize[1];

        if (this.sprite) {
            this.sprite.moveTo(
                new RectangleBounds(x + this.padding, y + this.padding, w, h)
            );
            this.sprite.render(ctx);
        } else {
            ctx.fillStyle = this.color;
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.rect(
                x + this.padding,
                y + this.padding,
                w - 2 * this.padding,
                h - 2 * this.padding
            );
            ctx.fill();
        }
        if (this.selected) {
            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "hsl(0,50%,100%)";
            ctx.fillRect(
                x + this.padding,
                y + this.padding,
                w - 2 * this.padding,
                h - 2 * this.padding
            );
            ctx.globalCompositeOperation = "source-over";
        }
        if (this.color !== TileColor.NONE) ctx.stroke();

        if (this.color !== TileColor.NONE && this.isHovered) {
            ctx.fillStyle = "white";
            ctx.fillRect(x + w / 2 - 5, y + h / 2 - 5, 10, 10);
        }

        await this.renderPath(ctx);
    }
}
