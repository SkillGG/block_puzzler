import { BoundedGameObject } from "@component/GameObject";
import { RectangleBounds } from "@primitive/Rectangle/RectangleBounds";
import { Rectangle, RectangleStyle } from "@primitive/Rectangle/Rectangle";

type AlignText = "center" | "right" | "left";
type JustifyText = "center" | "top" | "bottom";

export interface LabelWithBorderStyle {
    label?: Partial<LabelTextStyle>;
    border?: Partial<RectangleStyle>;
}

export interface LabelTextStyle {
    textColor: string;
    font: string;
    align: AlignText;
    justify: JustifyText;
}

export const LabelDefaultStyle: LabelTextStyle = {
    align: "center",
    font: "",
    justify: "center",
    textColor: "black",
};

export class Label extends BoundedGameObject {
    text: string;
    border: Rectangle;
    style: LabelTextStyle;
    initStyle: LabelWithBorderStyle;
    constructor(
        id: string,
        bounds: RectangleBounds,
        text: string = "",
        style?: LabelWithBorderStyle,
        zIndex?: number
    ) {
        super(id, bounds, zIndex);
        this.text = text;
        this.style = { ...LabelDefaultStyle, ...style?.label };
        this.border = new Rectangle(`${id}_border`, this.bounds, {
            ...style?.border,
        });
        this.initStyle = { ...style };
    }
    render(ctx: CanvasRenderingContext2D): void {
        this.border.render(ctx);
        ctx.font = this.style.font;
        const textBounds = ctx.measureText(this.text);
        const textWidth =
            textBounds.actualBoundingBoxLeft +
            textBounds.actualBoundingBoxRight;
        const textHeight =
            textBounds.actualBoundingBoxAscent +
            textBounds.actualBoundingBoxDescent;
        const boundHeight = this.bounds.height || textHeight;
        const boundWidth = this.bounds.width || textWidth;
        const textX =
            this.style.align === "left"
                ? this.bounds.x
                : this.style.align === "right"
                ? this.bounds.x + this.bounds.width - textWidth
                : this.bounds.x + (boundWidth - textWidth) / 2;
        const textY =
            this.style.justify === "top"
                ? this.bounds.y + textHeight
                : this.style.justify === "bottom"
                ? this.bounds.y + this.bounds.height - textHeight
                : this.bounds.y + (boundHeight + textHeight) / 2;
        ctx.fillStyle = this.style.textColor;
        ctx.fillText(
            this.text,
            textX,
            textY,
            this.bounds.width - this.border.style.strokeWidth * 2
        );
    }
    update(): void {}
}
