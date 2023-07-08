import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";

import spriteSet from "./assets/pika.png";
// import breakAnimData from "./assets/Break.json";
import { Vector2, Vector_2, randomInt } from "@utils";
import { Tile, TileSize } from "@components/Playfield/Tile/tile";
// import { PixellAnimData } from "../utils";
import { AnimatedSprite } from "../animatedSprite";
import { GameAnimation } from "../animation";
import { Texture } from "@primitives/Texture/texture";
import {
    // SpriteAnimationLoaderFunction,
    SpriteLoader,
    SpriteLoaderFunction,
} from "@components/Primitives/Sprite/SpriteLoader";
import { Sprite } from "@components/Primitives/Sprite/Sprite";
import { LoadedTexture } from "@components/Primitives/Texture/loadedTexture";

// const breakAnimationJSON = breakAnimData as PixellAnimData;

export namespace BreakingAnimation {
    export const ID = "breaking";
    export class sprite extends AnimatedSprite {
        static readonly breakFrameSize = TileSize * 2 + (1 / 11) * TileSize;

        private static texture: Texture = new Texture();

        static loadSprites: SpriteLoaderFunction = async () => {
            const url = spriteSet;
            if (!this.texture.isLoaded) await this.texture.load(url);
            const lT = new LoadedTexture(this.texture, ID + "_anim");
            return new Sprite(lT, {
                source: new RectangleBounds(
                    0,
                    0,
                    this.texture.width,
                    this.texture.height
                ),
            });
        };

        constructor(
            id: string,
            x: number,
            y: number,
            onfinish: () => Promise<void>
        ) {
            const sprites = SpriteLoader.getSprite(ID);
            super(
                id,
                new RectangleBounds(
                    x,
                    y,
                    sprite.texture.width,
                    sprite.texture.height
                ),
                [sprites],
                [],
                async () => {},
                onfinish,
                60 // fps
            );
        }
    }

    export class animation extends GameAnimation {
        origin: Vector2;

        sprites: { sprite: AnimatedSprite; vel: Vector_2 }[] = [];

        constructor(id: string, end: (id: string) => void, ltTile: Tile) {
            super(id, end);
            this.origin = [...ltTile.bounds.getPosition()];
            const velocities: Vector2[] = [
                [randomInt(-4, 4), randomInt(-10, -1)],
                [randomInt(-4, 4), randomInt(-10, -1)],
                [randomInt(-4, 4), randomInt(-10, -1)],
                [randomInt(-4, 4), randomInt(-10, -1)],
                [randomInt(-4, 4), randomInt(-10, -1)],
                [randomInt(-4, 4), randomInt(-10, -1)],
            ];
            this.sprites = velocities.map((vel, i) => {
                return {
                    sprite: new sprite(
                        id + "_" + i,
                        ltTile.bounds.x,
                        ltTile.bounds.y,
                        async () => {}
                    ),
                    vel: { x: vel[0], y: vel[1] },
                };
            });
            this.tiles = this.sprites.map(({ sprite }) => sprite);
        }
        async render() {}

        async update(dT: number) {
            this.frame++;
            const dS = (dT / 1000) * 60;
            for (let i = 0; i < this.sprites.length; i++) {
                this.sprites[i].vel.y += dS * 0.5;
                this.sprites[i].sprite.bounds.setPosition(
                    this.sprites[i].sprite.bounds.x +
                        dS * this.sprites[i].vel.x,
                    this.sprites[i].sprite.bounds.y + dS * this.sprites[i].vel.y
                );
                if (this.sprites[i].sprite.bounds.y > 500 + 50) {
                    this.removeObject(this.sprites[i].sprite);
                    this.sprites = this.sprites.filter(
                        (x) => x !== this.sprites[i]
                    );
                }
            }

            if (this.sprites.length <= 0) {
                this.end();
            }
        }
    }
}
