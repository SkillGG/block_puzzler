import { oSLIDER_Z } from "@/utils/zLayers";
import { BoundedGameObject } from "@components/GameObject";
import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
import { Hideable } from "@utils";

export type SliderStyle = {
    foreColor: string;
    bgColor: string;
    borderColor: string;
    borderWidth: number;
};

export class Slider extends BoundedGameObject implements Hideable {
    current = 0;

    static readonly defaultStyle: SliderStyle = {
        foreColor: "white",
        bgColor: "#ccc4",
        borderColor: "black",
        borderWidth: 3,
    };

    style: SliderStyle;

    constructor(
        id: string,
        bounds: RectangleBounds,
        public max: number,
        style: Partial<SliderStyle> = Slider.defaultStyle,
        zIndex = oSLIDER_Z
    ) {
        super(id, bounds, zIndex);
        this.style = { ...Slider.defaultStyle, ...style };
    }

    progressBy(n: number) {
        this.current += n;
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if (this.#hidden) return;
        const { x, y, width: w, height: h } = this.bounds;
        //

        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 5);
        ctx.fillStyle = this.style.bgColor;
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = this.style.borderWidth;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.roundRect(
            x + 1,
            y + 1,
            Math.min(w - 2, w * (this.current / this.max)),
            h - 2,
            5
        );
        ctx.fillStyle = this.style.foreColor;
        ctx.fill();
        ctx.closePath();
    }
    async update(t: number): Promise<void> {
        if (this.#hidden) return;
    }
    #hidden = false;
    hide(): void {
        this.#hidden = true;
    }
    show(): void {
        this.#hidden = false;
    }
}
