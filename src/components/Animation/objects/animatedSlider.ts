import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
import { Slider, SliderStyle } from "@primitives/Slider/Slider";
import { Sprite } from "@primitives/Sprite/Sprite";

type AnimatedSliderStyle = {
    foreSprite?: Sprite;
    bgSprite?: Sprite;
    animationTick(t: number, s: AnimatedSlider): void;
    foreSpriteStyle: "clip" | "scale";
};

export class AnimatedSlider extends Slider {
    constructor(
        id: string,
        bounds: RectangleBounds,
        max: number,
        public animationStyle: AnimatedSliderStyle,
        style: Partial<SliderStyle> = Slider.defaultStyle,
        zIndex = 0
    ) {
        super(id, bounds, max, style, zIndex);
    }

    #hidden = false;

    show(): void {
        this.#hidden = false;
    }

    hide() {
        this.#hidden = true;
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if (this.#hidden) return;
        const { x, y, width: w, height: h } = this.bounds;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 5);
        ctx.fillStyle = this.style.bgColor;
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = this.style.borderWidth;
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.stroke();
        ctx.closePath();
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(
            x + 1,
            y + 1,
            Math.min(w - 2, w * (this.current / this.max)),
            h - 2,
            5
        );
        ctx.clip();
        if (this.animationStyle.foreSprite) {
            await this.animationStyle.foreSprite.render(ctx);
        } else {
            ctx.fillStyle = this.style.foreColor;
            ctx.fill();
        }
        ctx.closePath();
        ctx.restore();
    }

    async update(t: number): Promise<void> {
        if (!this.#hidden) return;
        this.animationStyle.animationTick(t, this);
    }
}
