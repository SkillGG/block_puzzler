import { BoundedGameObject } from "@components/GameObject";
import { CanAnimate } from "@animation";
import { RectangleBounds } from "@components/Primitives/Rectangle/RectangleBounds";
import { Vector2 } from "@utils";
import { Sprite } from "@primitives/Sprite/Sprite";

export class AnimatedSprite extends BoundedGameObject implements CanAnimate {
    sprites: Sprite[];
    frameTick = 0;
    frame = 0;
    lastFrameTick = 0;
    frameNumber: number;
    frameDelays: number[] = [];

    fps;

    onPlay: () => Promise<void>;
    onFinish: () => Promise<void>;
    constructor(
        id: string,
        bounds: RectangleBounds,
        sprites: Sprite[],
        frameDelays: number[] = [],
        onPlay: () => Promise<void>,
        onFinish: () => Promise<void>,
        fps = 60
    ) {
        super(id, bounds);
        this.sprites = sprites;
        this.frameDelays = frameDelays;
        while (frameDelays.length < sprites.length) {
            this.frameDelays.push(0);
        }
        this.frameNumber = this.frameDelays.reduce(
            (p, n) => (n ? p + n : p + 1),
            0
        );
        this.fps = fps;
        this.onPlay = onPlay;
        this.onFinish = onFinish;
    }
    offsetXY: Vector2 = [0, 0];
    offsetSize: Vector2 = [0, 0];
    async render(ctx: CanvasRenderingContext2D) {
        if (this.frame > this.sprites.length - 1) return;
        const sprite = this.sprites[this.frame];
        sprite.moveTo(this.bounds);
        sprite.render(ctx);
    }
    moveBy(x: number | Vector2, y?: number) {
        if (Array.isArray(x) && typeof y === "undefined") {
            this.offsetXY[0] += x[0];
            this.offsetXY[1] += x[1];
        } else if (typeof x === "number" && typeof y === "number") {
            this.offsetXY[0] += x;
            this.offsetXY[1] += x;
        }
    }
    resizeBy(widthOrSize: number | Vector2, height?: number) {
        if (Array.isArray(widthOrSize) && typeof height === "undefined") {
            this.offsetSize[0] += widthOrSize[0];
            this.offsetSize[1] += widthOrSize[1];
        } else if (
            typeof widthOrSize === "number" &&
            typeof height === "number"
        ) {
            this.offsetSize[0] += widthOrSize;
            this.offsetSize[1] += widthOrSize;
        }
    }
    async play() {
        this.playing = true;
        await this.onPlay();
    }
    private playing = false;
    stop() {
        this.playing = false;
    }

    timeElapsed = 0;

    async update(time: number) {
        const frameInterval = 1000 / this.fps;
        if (this.playing) {
            if (
                this.frameTick - this.lastFrameTick >=
                this.frameDelays[this.frame]
            ) {
                this.frame++;
                this.lastFrameTick = this.frameTick;
            }

            if (this.timeElapsed > frameInterval) {
                this.timeElapsed = 0;
                this.frame++;
            }

            this.timeElapsed += time;

            if (this.frame >= this.sprites.length - 1) {
                this.stop();
                await this.onFinish();
            }
        }
    }
}
