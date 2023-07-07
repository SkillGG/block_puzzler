import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
import { Sprite, SpriteOptions } from "@primitives/Sprite/Sprite";
import {
    MultiSpriteLoaderFunction,
    SpriteLoaderFunction,
} from "@primitives/Sprite/SpriteLoader";
import { LoadedTexture } from "@primitives/Texture/loadedTexture";
import { Texture } from "@primitives/Texture/texture";

export const genericSpriteLoader = (
    id: string,
    url: string
): SpriteLoaderFunction => {
    return async () => {
        const texture = new Texture();
        await texture.load(url);
        const lT = new LoadedTexture(texture, id);
        return new Sprite(lT, {
            source: new RectangleBounds(0, 0, texture.width, texture.height),
        });
    };
};

export const genericMultiSpriteLoader = (
    urls: Record<string, string>,
    options?: SpriteOptions
): MultiSpriteLoaderFunction => {
    return async (id: string) => {
        const texture = new Texture();
        await texture.load(urls[id]);
        const lT = new LoadedTexture(texture, id);
        return new Sprite(lT, {
            source: new RectangleBounds(0, 0, texture.width, texture.height),
            ...options,
        });
    };
};
