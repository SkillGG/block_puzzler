import { Sprite } from "./Sprite";

export type SpriteAnimationLoader = () => Promise<Sprite[]>;

export class SpriteLoader {
    static laoded = false;
    static animationLoaders: Map<string, SpriteAnimationLoader> = new Map();

    static animations: Map<string, Sprite[]> = new Map();

    static getAnimationSprites(anim: string): Sprite[] {
        return (
            this.animations.get(anim)?.map((q) => {
                return new Sprite(q);
            }) || []
        );
    }

    static addAnimation(id: string, loader: SpriteAnimationLoader) {
        this.animationLoaders.set(id, loader);
    }

    static async loadAllSprites() {
        for (const [id, loader] of SpriteLoader.animationLoaders) {
            const loadedSprites = await loader();
            SpriteLoader.animations.set(id, loadedSprites);
        }
    }
}

declare global {
    interface Window {
        SpriteLoader: SpriteLoader;
    }
}

window.SpriteLoader = SpriteLoader;
