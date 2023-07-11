import { BoundedGameObject } from "@components/GameObject";
import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
import { Rectangle, RectangleStyle } from "@primitives/Rectangle/Rectangle";
import { getTextMeasures } from "@utils";

type AlignText = "center" | "right" | "left";
type JustifyText = "center" | "top" | "bottom";

export interface LabelWithBorderStyle {
    label?: Partial<LabelTextStyle>;
    border?: Partial<RectangleStyle>;
}

export interface LabelTextStyle {
    textColor: string;
    font: string;
    halign: AlignText;
    valign: JustifyText;
}

export const LabelDefaultStyle: LabelTextStyle = {
    halign: "center",
    font: "",
    valign: "center",
    textColor: "black",
};

export class Label extends BoundedGameObject {
    border: Rectangle;
    style: LabelTextStyle;
    initStyle: LabelWithBorderStyle;
    constructor(
        id: string,
        bounds: RectangleBounds,
        public text: string = "",
        style?: LabelWithBorderStyle,
        zIndex?: number
    ) {
        super(id, bounds, zIndex);
        this.style = { ...LabelDefaultStyle, ...style?.label };
        this.border = new Rectangle(`${id}_border`, this.bounds, {
            ...style?.border,
        });
        this.initStyle = { ...style };
    }
    async render(ctx: CanvasRenderingContext2D) {
        await this.border.render(ctx);
        ctx.font = this.style.font;
        const textBounds = getTextMeasures(ctx, this.text);
        const textWidth = textBounds.width;
        const textHeight = textBounds.height;
        const boundHeight = this.bounds.height || textHeight;
        const boundWidth = this.bounds.width || textWidth;
        const textX =
            this.style.halign === "left"
                ? this.bounds.x
                : this.style.halign === "right"
                ? this.bounds.x + this.bounds.width - textWidth
                : this.bounds.x + (boundWidth - textWidth) / 2;
        const textY =
            this.style.valign === "top"
                ? this.bounds.y + textBounds.ascent
                : this.style.valign === "bottom"
                ? this.bounds.y + this.bounds.height - textBounds.descent
                : this.bounds.y + (boundHeight + textHeight) / 2;
        ctx.fillStyle = this.style.textColor;
        ctx.fillText(
            this.text,
            textX,
            textY,
            this.bounds.width
                ? this.bounds.width - this.border.style.strokeWidth * 2
                : undefined
        );
    }
    async update() {}
}
