import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";

import b1 from "./assets/Break.png";
import breakAnimData from "./assets/Break.json";
import { Vector2 } from "@utils";
import { Tile, TileColor } from "@components/Playfield/Tile/tile";
import { PixellAnimData } from "../utils";
import { AnimatedSprite } from "../animatedSprite";
import { GameAnimation } from "../animation";
import { Texture } from "@primitives/Texture/texture";
import {
    SpriteAnimationLoader,
    SpriteLoader,
} from "@components/Primitives/Sprite/SpriteLoader";
import { Sprite } from "@components/Primitives/Sprite/Sprite";
import { LoadedTexture } from "@components/Primitives/Texture/loadedTexture";

const breakAnimationJSON = breakAnimData as PixellAnimData;

export namespace BreakingAnimation {
    export const ID = "breaking";
    export class sprite extends AnimatedSprite {
        static readonly breakFrameSize = 100;

        private static texture: Texture = new Texture();

        static loadBreakingSprites: SpriteAnimationLoader = async () => {
            const url = b1;
            if (!this.texture.isLoaded) await this.texture.load(url);
            const lT = new LoadedTexture(this.texture, ID + "_anim");
            const sprites: Sprite[] = [];
            for (const frame of Object.values(breakAnimationJSON.frames)) {
                const { x, y, w, h } = frame.frame;
                const spr = new Sprite(lT, new RectangleBounds(x, y, w, h));
                sprites.push(spr);
            }
            return sprites;
        };

        constructor(
            id: string,
            x: number,
            y: number,
            options: { tint: TileColor },
            onfinish: () => Promise<void>
        ) {
            const sprites = SpriteLoader.getAnimationSprites(ID);
            super(
                id,
                new RectangleBounds(
                    x,
                    y,
                    sprite.breakFrameSize,
                    sprite.breakFrameSize
                ),
                sprites,
                ("2" + ",2".repeat(sprites.length)).split(",").map(Number),
                async () => {
                    for (const sprite of sprites) {
                        await sprite.setTint(options.tint);
                    }
                },
                onfinish,
                18 * 2
            );
        }
    }

    export class animation extends GameAnimation {
        origin: Vector2;
        tint: TileColor;
        constructor(id: string, end: (id: string) => void, ltTile: Tile) {
            super(id, end, 30);
            this.origin = [...ltTile.bounds.getPosition()];
            this.tint = ltTile.color;
            this.frame = 0;
        }
        async render(ctx: CanvasRenderingContext2D) {
            console.log("rendering animation", this.id);
            for (const t of this.tiles) {
                t.render(ctx);
            }
        }
        async update() {
            this.frame++;
            const frame = this.frame;
            if (frame === 1) {
                const newpos = this.origin;
                let newid = "breaking_anim_" + this.id;
                const animation = new sprite(
                    newid,
                    newpos[0] - 5,
                    newpos[1] - 5,
                    { tint: this.tint },
                    async () => {
                        this.end();
                    }
                );
                this.frameNumber = this.frame + animation.frameNumber;
                this.tiles.push(animation);
                this.registerObject(animation);
                await animation.play();
            }
        }
    }
}
