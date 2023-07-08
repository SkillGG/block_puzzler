import { BoundedGameObject } from "@components/GameObject";
import { RectangleBounds } from "@components/Primitives/Rectangle/RectangleBounds";
import { Sprite } from "@primitives/Sprite/Sprite";
import { SpriteLoader } from "@primitives/Sprite/SpriteLoader";
import { Vector2, Vector_2, noop } from "@utils";

export enum TileColor {
    NONE = "transparent",
    BLUE = "blue",
    RED = "red",
    YELLOW = "yellow",
    GREEN = "green",
}

export enum PathBlock {
    NONE = "none",
    HORIZONTAL = "horiz",
    VERTICAL = "vert",
    END = "end",
    ERR = "err",
    LT = "lt",
    RT = "rt",
    LB = "lb",
    RB = "rb",
}

export type TileCoords = { col: number; row: number };

export const TileSize = 50;

export type TileEvents = {
    onleave: () => void;
    onenter: () => void;
};

export type TileChanges = {
    gridPosition: Vector_2;
    coords: Vector2;
    events: TileEvents;
    size?: Vector2;
    zIndex?: number;
    sprite?: Sprite;
};

export class Tile extends BoundedGameObject {
    static HIGHLIGHT_COLOR = "white";

    anchor: Vector_2;
    size: Vector2;
    coords: TileCoords;
    padding = 0;

    _color: TileColor = TileColor.NONE;

    get color() {
        return this._color;
    }

    set color(c: TileColor) {
        if (c === TileColor.NONE) this.sprite = null;
        else this.setSprite(c);
        this._color = c;
    }

    pathBlockValue: PathBlock = PathBlock.NONE;
    originalAnchor: Vector_2;

    sprite: Sprite | null = null;
    isHovered: boolean = false;
    onenter: () => void;
    onleave: () => void;

    constructor(id: string, t: Tile, o: TileChanges);
    constructor(
        id: string,
        options: TileChanges | Tile,
        copyOptions?: Partial<TileChanges>
    );
    constructor(
        id: string,
        options: TileChanges | Tile,
        copyOptions?: TileChanges
    ) {
        if (options instanceof Tile) {
            const pTile = options;
            const opts = copyOptions;
            super(id, pTile.bounds);
            this.anchor = pTile.anchor;
            this.originalAnchor = opts?.gridPosition || pTile.originalAnchor;
            this.size = opts?.size || pTile.size;
            this.coords =
                opts && opts.coords
                    ? { row: opts.coords[0], col: opts.coords[1] }
                    : null || pTile.coords;
            this.onenter = opts?.events?.onenter || pTile.onenter;
            this.onleave = opts?.events?.onleave || pTile.onleave;
            const sprite = opts?.sprite || pTile.sprite;
            if (sprite) this.sprite = new Sprite(sprite);
            this.zIndex = opts?.zIndex || pTile.zIndex;
            this.isHovered = pTile.isHovered;
        } else if (!(options instanceof Tile)) {
            const [row, col] = options.coords;
            const [width, height] = options.size || [40, 40];
            super(id, new RectangleBounds(0, 0, width, height));
            this.anchor = options.gridPosition;
            this.originalAnchor = { ...options.gridPosition };
            this.size = [width, height];
            this.coords = { col, row };
            this.applyPositionChange();
            this.onenter = options.events.onenter;
            this.onleave = options.events.onleave;
            this.zIndex = options.zIndex || 0;
        } else throw "Incorrect tile constructor!";
    }

    get tileNumberStr() {
        return /(\d+)/.exec(this.id)?.[1] || "tile";
    }

    setSprite(str: string) {
        this.sprite = new Sprite(SpriteLoader.getSprite(str));
    }

    moveTo(pos: Vector_2) {
        this.anchor = pos;
    }
    moveOffsetBy(pos: Vector2) {
        const [x, y] = pos;
        this.anchor = { x: this.anchor.x + x, y: this.anchor.y + y };
        this.applyPositionChange();
    }

    moveToTile(coords: TileCoords): void;
    moveToTile(coords: Vector2): void;
    moveToTile(coords: Vector2 | TileCoords): void {
        if (Array.isArray(coords)) {
            const [col, row] = coords;
            this.coords = { col, row };
        } else {
            this.coords = coords;
        }
        this.applyPositionChange();
    }

    protected applyPositionChange() {
        const { x, y } = this.anchor;
        this.bounds.setPosition(
            x + this.bounds.width * this.coords.col,
            y + this.bounds.height * this.coords.row
        );
    }

    protected selected = false;

    markSelected() {
        this.selected = true;
        this.zIndex = 1;
    }

    unmarkSelected() {
        this.selected = false;
        this.zIndex = 0;
    }

    async renderPath(ctx: CanvasRenderingContext2D) {
        if (this.pathBlockValue === PathBlock.NONE) return;
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.lineCap = "square";

        const { x, y, width, height } = this.bounds;

        ctx.setLineDash([3, 18, 7, 18, 3]);

        switch (this.pathBlockValue) {
            case PathBlock.VERTICAL:
                ctx.moveTo(x + width / 2, y);
                ctx.lineTo(x + width / 2, y + height);
                ctx.stroke();
                break;
            case PathBlock.HORIZONTAL:
                ctx.moveTo(x, y + height / 2);
                ctx.lineTo(x + width, y + height / 2);
                ctx.stroke();
                break;
            case PathBlock.END:
                ctx.setLineDash([]);
                const radius = width / 2 - 5;
                ctx.ellipse(
                    x + width / 2,
                    y + height / 2,
                    radius,
                    radius,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
                break;
            case PathBlock.ERR:
                ctx.setLineDash([]);
                ctx.lineCap = "round";
                const padding = 10;
                ctx.moveTo(x + padding, y + padding);
                ctx.lineTo(x + width - padding, y + height - padding);
                ctx.moveTo(x + width - padding, y + padding);
                ctx.lineTo(x + padding, y + width - padding);
                ctx.stroke();
                break;
            case PathBlock.LT:
                ctx.moveTo(x + width / 2, y);
                ctx.lineTo(x + width / 2, y + height / 2);
                ctx.lineTo(x, y + height / 2);
                ctx.stroke();
                break;
            case PathBlock.LB:
                ctx.moveTo(x + width / 2, y + height);
                ctx.lineTo(x + width / 2, y + height / 2);
                ctx.lineTo(x, y + height / 2);
                ctx.stroke();
                break;

            case PathBlock.RT:
                ctx.moveTo(x + width / 2, y);
                ctx.lineTo(x + width / 2, y + height / 2);
                ctx.lineTo(x + width, y + height / 2);
                ctx.stroke();
                break;
            case PathBlock.RB:
                ctx.moveTo(x + width / 2, y + height);
                ctx.lineTo(x + width / 2, y + height / 2);
                ctx.lineTo(x + width, y + height / 2);
                ctx.stroke();
                break;
        }
        ctx.closePath();
    }

    async render(ctx: CanvasRenderingContext2D) {
        const { x, y, width: w, height: h } = this.bounds;
        if (this.sprite) {
            this.sprite.moveTo(this.bounds);
            this.sprite.render(ctx);
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
            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "hsl(0,50%,100%)";
            ctx.fillRect(
                x + this.padding,
                y + this.padding,
                w - 2 * this.padding,
                h - 2 * this.padding
            );
            ctx.globalCompositeOperation = "source-over";
        }
        if (this.color !== TileColor.NONE) ctx.stroke();

        if (this.color !== TileColor.NONE && this.isHovered) {
            ctx.fillStyle = "white";
            ctx.fillRect(x + w / 2 - 5, y + h / 2 - 5, 10, 10);
        }

        await this.renderPath(ctx);
    }

    hoverIn() {
        this.isHovered = true;
        this.onenter();
        console.log("entering", this.id);
    }

    hoverOut() {
        this.isHovered = false;
        this.onleave();
        console.log("leaving", this.id);
    }

    async update(dT: number) {}
}
