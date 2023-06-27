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
        style?: Partial<RectangleStyle>
    ) {
        super(id, bounds);
        this.style = { ...RectangleDefaultStyle, ...style };
    }
    update() {}
    render(ctx: CanvasRenderingContext2D) {
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
