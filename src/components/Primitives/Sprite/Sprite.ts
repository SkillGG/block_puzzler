import { TileColor } from "@components/Playfield/Tile/tile";
import {
    Renderable,
    applyTintToBitmap,
    colorDataToString,
    colorToRGBA,
} from "@utils";
import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
import { LoadedTexture } from "@primitives/Texture/loadedTexture";

export class Sprite implements Renderable {
    private texture: LoadedTexture;
    private sourceBounds: RectangleBounds;
    private destinationBounds: RectangleBounds;
    private cachedImage: HTMLImageElement;
    tint: string;
    staleCache = true;

    static imageCache: Map<string, HTMLImageElement> = new Map();

    static getImageFromCache(id: string) {
        const ret = Sprite.imageCache.get(id);
        return ret;
    }

    static saveImageToCache(id: string, img: HTMLImageElement) {
        Sprite.imageCache.set(id, img);
        return img;
    }

    constructor(
        t: LoadedTexture,
        source: RectangleBounds,
        dest?: RectangleBounds,
        tint?: string
    );
    /**
     * Copying constructor
     * @param s Sprite to copy
     */
    constructor(s: Sprite);
    constructor(
        texOrSprite: LoadedTexture | Sprite,
        sourceOrID?: RectangleBounds,
        destinationBounds?: RectangleBounds,
        tint?: string
    ) {
        if (texOrSprite instanceof Sprite) {
            this.texture = texOrSprite.texture;
            this.sourceBounds = new RectangleBounds(texOrSprite.sourceBounds);
            this.destinationBounds = new RectangleBounds(
                texOrSprite.destinationBounds
            );
            this.tint = texOrSprite.tint;
            this.cachedImage = new Image();
        } else if (
            texOrSprite instanceof LoadedTexture &&
            typeof sourceOrID === "object"
        ) {
            this.texture = texOrSprite;
            this.sourceBounds = sourceOrID;
            this.destinationBounds =
                destinationBounds ||
                new RectangleBounds(0, 0, sourceOrID.width, sourceOrID.height);
            this.tint = colorDataToString(colorToRGBA(tint)) || "transparent";
            this.cachedImage = new Image();
            this.recache();
            this.staleCache = false;
            this.cachedImage.onerror = () => (this.staleCache = true);
        } else {
            throw "";
        }
    }
    async recache() {
        this.cacheColoredImages(true);
    }
    async cacheColoredImages(force = false) {
        const pTint = this.tint;
        const colors = Object.values(TileColor);
        for (let i = 0; i < colors.length; i++) {
            this.tint = colors[i];
            await this.cacheImage(this.tint, force);
        }
        this.tint = pTint;
        this.staleCache = true;
    }
    async cacheImage(tint?: string, force: boolean = false) {
        const imgFromCache = Sprite.getImageFromCache(this.getCacheID(tint));
        if (imgFromCache && !force) {
            this.cachedImage = imgFromCache;
        } else {
            const textureImg = await this.texture.toImage(
                this.sourceBounds.x,
                this.sourceBounds.y,
                this.sourceBounds.width,
                this.sourceBounds.height
            );
            const img = new Image();
            img.src = await this.applyTint(textureImg, tint);
            this.cachedImage = Sprite.saveImageToCache(
                this.getCacheID(tint),
                img
            );
        }
    }

    async applyTint(img: ImageBitmap, tint?: string) {
        return applyTintToBitmap(img, tint || this.tint);
    }

    getCacheID(tint?: string) {
        return `${this.texture.id}:${this.sourceBounds.x}/${
            this.sourceBounds.y
        }/${this.sourceBounds.width}/${this.sourceBounds.height}_${
            tint || this.tint
        }`;
    }

    getFromStorageSync() {
        return Sprite.getImageFromCache(this.getCacheID()) || this.cachedImage;
    }

    async setTint(t: string) {
        if (colorToRGBA(t)) this.tint = t;
        await this.cacheImage(t);
    }

    moveTo(r: RectangleBounds): void;
    moveTo(x: number, y: number, w: number, h: number): void;
    moveTo(
        xOrBounds: number | RectangleBounds,
        y?: number,
        w?: number,
        h?: number
    ) {
        if (xOrBounds instanceof RectangleBounds) {
            this.destinationBounds = xOrBounds;
        } else if (
            typeof xOrBounds !== "undefined" &&
            typeof y !== "undefined" &&
            typeof w !== "undefined" &&
            typeof h !== "undefined"
        ) {
            this.destinationBounds = new RectangleBounds(xOrBounds, y, w, h);
        }
    }
    changeCrop(sx: number, sy: number, sw: number, sh: number) {
        this.sourceBounds = new RectangleBounds(sx, sy, sw, sh);
        this.staleCache = true;
    }
    async render(ctx: CanvasRenderingContext2D) {
        if (this.staleCache) {
            await this.cacheImage();
        }
        const { x, y, width: w, height: h } = this.destinationBounds;
            ctx.drawImage(this.cachedImage, x, y, w, h);
    }
}
