import { Renderable } from "@utils";
import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
import { LoadedTexture } from "@primitives/Texture/loadedTexture";

type FilterFunction = (ctx: CanvasRenderingContext2D) => void;

type SpriteFilter = {
    id: string;
    pre?: FilterFunction;
    post?: FilterFunction;
};

type SpriteFilters = SpriteFilter[];

export type SpriteOptions = {
    cacheTints?: true | string[];
    source: RectangleBounds;
    destinationBounds?: RectangleBounds;
    filters?: SpriteFilters;
};
export class Sprite implements Renderable {
    private texture: LoadedTexture;
    private sourceBounds: RectangleBounds;
    private destinationBounds: RectangleBounds;

    filters: SpriteFilters = [];

    cachedData: ImageBitmap | null = null;

    get destination() {
        return this.destinationBounds;
    }

    get source() {
        return this.sourceBounds;
    }

    constructor(t: LoadedTexture, options?: SpriteOptions);
    /**
     * Copying constructor
     * @param s Sprite to copy
     */
    constructor(s: Sprite, options?: Partial<SpriteOptions>);
    constructor(
        texOrSprite: LoadedTexture | Sprite,
        options?: SpriteOptions | Partial<SpriteOptions>
    ) {
        if (texOrSprite instanceof Sprite) {
            this.texture = texOrSprite.texture;
            this.sourceBounds =
                options?.source ||
                new RectangleBounds(texOrSprite.sourceBounds);
            this.destinationBounds = new RectangleBounds(
                texOrSprite.destinationBounds
            );
            this.filters = options?.filters || texOrSprite.filters;
            this.cache();
        } else if (texOrSprite instanceof LoadedTexture && options) {
            this.texture = texOrSprite;
            if (!options.source)
                throw "Source should be provided if you use LoadedTexture sprite constructor!";
            this.sourceBounds = options.source;
            this.destinationBounds =
                options.destinationBounds ||
                new RectangleBounds(
                    0,
                    0,
                    this.sourceBounds.width,
                    this.sourceBounds.height
                );
            this.filters = options.filters || [];
            this.cache();
        } else {
            throw "Incorrect Sprite constructor";
        }
    }

    async cache() {
        return (this.cachedData = await this.texture.toImage(
            this.source.x,
            this.source.y,
            this.source.width,
            this.source.height
        ));
    }

    addFilter(
        id: string,
        { pre, post }: { pre?: FilterFunction; post?: FilterFunction }
    ) {
        if (this.filters.find((x) => x.id === id)) return;
        this.filters.push({ id, pre, post });
    }

    removeFilter(id: string) {
        this.filters = this.filters.filter((f) => f.id !== id);
    }

    moveTo(x: number, y: number): void;
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
            typeof y !== "undefined"
        ) {
            this.destinationBounds = new RectangleBounds(
                xOrBounds,
                y,
                w || this.destinationBounds.width,
                h || this.destinationBounds.height
            );
        }
    }
    clip(sx: number, sy: number, sw: number, sh: number) {
        this.sourceBounds = new RectangleBounds(sx, sy, sw, sh);
        this.cache();
    }

    async render(ctx: CanvasRenderingContext2D) {
        if (!this.cachedData) this.cachedData = await this.cache();
        const { x, y, width: w, height: h } = this.destinationBounds;
        ctx.save();
        ctx.rect(x, y, w, h);
        ctx.clip();
        this.filters.forEach((c) => {
            c.pre?.(ctx);
        });
        ctx.drawImage(this.cachedData, x, y, w, h);
        this.filters.forEach((c) => {
            c.post?.(ctx);
        });
        ctx.restore();
    }
}
