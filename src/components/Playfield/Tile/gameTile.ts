import { Vector2, Vector_2, noop } from "@utils";
import { Tile, TileColor } from "./tile";
import { AnimatableTile } from "@components/Animation/objects/animatedTile";
import { HoverAnimation } from "@components/Animation/Hover/hover";
import { AnimatedSprite } from "@components/Animation/objects/animatedSprite";
import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
import { oTILE_Z } from "@/utils/zLayers";
export class GameTile extends AnimatableTile {
    constructor(
        id: string,
        gridPosition: Vector_2,
        coords: Vector2,
        [width, height]: Vector2 = [40, 40],
        zIndex = oTILE_Z
    ) {
        super(
            "",
            new Tile(id, {
                gridPosition,
                coords,
                size: [width, height],
                events: { onenter: noop, onleave: noop },
                zIndex,
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
            if (this.selected)
                this.sprite.addFilter("selected", {
                    post: (c) => {
                        c.globalCompositeOperation = "darken";
                        c.globalAlpha = 0.2;
                        c.fillStyle = "black";
                        c.rect(
                            x + this.padding,
                            y + this.padding,
                            w - 2 * this.padding,
                            h - 2 * this.padding
                        );
                        c.fill();
                        c.globalCompositeOperation = "source-over";
                    },
                });
            else this.sprite.removeFilter("selected");
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

        if (this.isHovered && this.color !== TileColor.NONE) {
            this.hoverAnimation.bounds = this.bounds;
            await this.hoverAnimation.render(ctx);
        }

        if (
            this.willBecome !== TileColor.NONE &&
            this.color === TileColor.NONE
        ) {
            ctx.beginPath();
            ctx.fillStyle = this.willBecome;
            ctx.arc(x + w / 2, y + h / 2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }

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
