import { Vector2, Vector_2, noop } from "@utils";
import { Tile, TileColor } from "./tile";
import { AnimatableTile } from "@components/Animation/animatedTile";
import { HoverAnimation } from "@components/Animation/Hover/hover";
import { AnimatedSprite } from "@components/Animation/animatedSprite";
import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
export class GameTile extends AnimatableTile {
    constructor(
        id: string,
        gridPosition: Vector_2,
        coords: Vector2,
        [width, height]: Vector2 = [40, 40]
    ) {
        super(
            "",
            new Tile(id, {
                gridPosition,
                coords,
                size: [width, height],
                events: { onenter: noop, onleave: noop },
            })
        );
        this.hoverAnimation = new HoverAnimation.sprite(
            this.id + "_hover",
            this.bounds.x,
            this.bounds.y,
            async (as: AnimatedSprite) => {
                as.play();
            },
            12
        );
        this.onenter = () => {
            this.hoverAnimation.play();
        };
        this.onleave = () => {
            this.hoverAnimation.stop();
        };
        this.sprite = null;
    }

    hoverAnimation: HoverAnimation.sprite;

    async render(ctx: CanvasRenderingContext2D) {
        const { x, y, width: w, height: h } = this.bounds;
        if (this.sprite) {
            this.sprite.moveTo(
                new RectangleBounds(
                    x + this.padding,
                    y + this.padding,
                    w - 2 * this.padding,
                    h - 2 * this.padding
                )
            );
            await this.sprite.render(ctx);
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
            ctx.globalCompositeOperation = "darken";
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = "black";
            ctx.fillRect(
                x + this.padding,
                y + this.padding,
                w - 2 * this.padding,
                h - 2 * this.padding
            );
            ctx.globalCompositeOperation = "source-over";
        }

        if (this.isHovered && this.color !== TileColor.NONE) {
            this.hoverAnimation.bounds = this.bounds;
            await this.hoverAnimation.render(ctx);
        }

        if (this.color !== TileColor.NONE) ctx.stroke();

        await this.renderPath(ctx);
    }
    async update(dT: number) {
        super.update(dT);
        if (this.color)
            if (this.isHovered && this.color !== TileColor.NONE) {
                this.hoverAnimation.update(dT);
            }
    }
}
