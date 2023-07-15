import { TileSize } from "@components/Playfield/Tile/tile";
import { AnimatedSprite } from "@components/Animation/objects/animatedSprite";
import { Texture } from "@primitives/Texture/texture";
import {
    SpriteAnimationLoaderFunction,
    SpriteLoader,
} from "@primitives/Sprite/SpriteLoader";
import { LoadedTexture } from "@primitives/Texture/loadedTexture";
import { Sprite } from "@primitives/Sprite/Sprite";
import spriteSet from "./assets/Hover.png";
import frameData from "./assets/Hover.json";
import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
import { PixellAnimData } from "../utils";
import { aHOVER_Z } from "@/utils/zLayers";

const hoverAnimationData: PixellAnimData = frameData;

export namespace HoverAnimation {
    export const ID = "hover";
    export class sprite extends AnimatedSprite {
        static readonly frameSize = TileSize;

        private static texture: Texture = new Texture();

        static loadSprites: SpriteAnimationLoaderFunction = async () => {
            const url = spriteSet;
            if (!this.texture.isLoaded) await this.texture.load(url);
            const lT = new LoadedTexture(this.texture, ID + "_anim");
            const sprites: Sprite[] = [];
            for (const frame of Object.values(hoverAnimationData.frames)) {
                const { x, y, w, h } = frame.frame;
                const spr = new Sprite(lT, {
                    source: new RectangleBounds(x, y, w, h),
                });
                sprites.push(spr);
            }
            return sprites;
        };

        constructor(
            id: string,
            x: number,
            y: number,
            onfinish: (as: AnimatedSprite) => Promise<void>,
            fps: number = 60
        ) {
            const sprites = SpriteLoader.getAnimationSprites(ID);
            super(
                id,
                new RectangleBounds(x, y, sprite.frameSize, sprite.frameSize),
                sprites,
                [],
                async () => {},
                async (as: AnimatedSprite) => {
                    as.frame = 0;
                    onfinish(as);
                },
                fps,
                aHOVER_Z
            );
        }

        async render(ctx: CanvasRenderingContext2D): Promise<void> {
            super.render(ctx);
        }
    }
}
