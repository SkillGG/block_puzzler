import { Sprite } from "./Sprite";

export type SpriteAnimationLoaderFunction = () => Promise<Sprite[]>;
export type SpriteLoaderFunction = () => Promise<Sprite>;
export type MultiSpriteLoaderFunction = (id: string) => Promise<Sprite>;

export class SpriteLoader {
    static laoded = false;
    static animationLoaders: Map<string, SpriteAnimationLoaderFunction> =
        new Map();
    static spriteLoaders: Map<string, SpriteLoaderFunction> = new Map();
    static multiSpriteLoaders: {
        loader: MultiSpriteLoaderFunction;
        ids: string[];
    }[] = [];

    static animations: Map<string, Sprite[]> = new Map();

    static sprites: Map<string, Sprite> = new Map();

    static getAnimationSprites(anim: string): Sprite[] {
        return (
            this.animations.get(anim)?.map((q) => {
                return new Sprite(q);
            }) || []
        );
    }

    static getSprite(id: string): Sprite {
        const s = this.sprites.get(id);
        if (!s) throw "Sprite with this id doesn't exist!";
        return s;
    }

    static addAnimation(id: string, loader: SpriteAnimationLoaderFunction) {
        this.animationLoaders.set(id, loader);
    }

    static addSprite(id: string, loader: SpriteLoaderFunction) {
        this.spriteLoaders.set(id, loader);
    }

    static addSprites(spriteIDs: string[], loader: MultiSpriteLoaderFunction) {
        this.multiSpriteLoaders.push({
            loader,
            ids: spriteIDs,
        });
    }

    static async loadAllSprites() {
        for (const [id, loader] of SpriteLoader.animationLoaders) {
            const loadedSprites = await loader();
            SpriteLoader.animations.set(id, loadedSprites);
        }
        for (const [id, loader] of SpriteLoader.spriteLoaders) {
            const loadedSprite = await loader();
            SpriteLoader.sprites.set(id, loadedSprite);
        }
        for (const { loader, ids } of SpriteLoader.multiSpriteLoaders) {
            for (const id of ids) {
                const loadedSprite = await loader(id);
                SpriteLoader.sprites.set(id, loadedSprite);
            }
        }
    }
}

declare global {
    interface Window {
        SpriteLoader: SpriteLoader;
    }
}

window.SpriteLoader = SpriteLoader;
