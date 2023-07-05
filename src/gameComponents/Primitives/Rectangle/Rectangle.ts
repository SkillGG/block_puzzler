import { BoundedGameObject } from "@component/GameObject";
import { RectangleBounds } from "./RectangleBounds";

export interface RectangleStyle {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
}

export const RectangleDefaultStyle: RectangleStyle = {
    fillColor: "transparent",
    strokeColor: "black",
    strokeWidth: 1,
};

export class Rectangle extends BoundedGameObject {
    style: RectangleStyle;
    constructor(
        id: string,
        bounds: RectangleBounds,
        style?: Partial<RectangleStyle>,
        zIndex?: number
    ) {
        super(id, bounds, zIndex);
        this.style = { ...RectangleDefaultStyle, ...style };
    }
    async update() {}
    async render(ctx: CanvasRenderingContext2D) {
        if (this.bounds.width * this.bounds.height === 0) return;
        ctx.fillStyle = this.style.fillColor;
        ctx.strokeStyle = this.style.strokeColor;
        ctx.lineWidth = this.style.strokeWidth;
        ctx.rect(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            this.bounds.height
        );
        ctx.fill();
        ctx.stroke();
    }
    intersects(bounds: RectangleBounds) {
        return this.bounds.intersects(bounds);
    }
}
