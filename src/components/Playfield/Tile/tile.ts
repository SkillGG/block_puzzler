import { BoundedGameObject } from "@components/GameObject";
import { RectangleBounds } from "@components/Primitives/Rectangle/RectangleBounds";
import { Vector2, Vector_2, asyncNonce } from "@utils";

export enum TileColor {
    NONE = "transparent",
    BLUE = "#33ce",
    RED = "#f00d",
    YELLOW = "#ff0c",
    GREEN = "#0f0a",
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

export class Tile extends BoundedGameObject {
    static HIGHLIGHT_COLOR = "white";

    item: string | null = null;

    anchor: Vector_2;
    size: Vector2;
    coords: TileCoords;

    color: TileColor = TileColor.NONE;

    pathBlockValue: PathBlock = PathBlock.NONE;
    originalAnchor: Vector_2;

    get tileNumberStr() {
        return /(\d+)/.exec(this.id)?.[1] || "tile";
    }

    constructor(
        id: string,
        gridPosition: Vector_2,
        coords: Vector2,
        [width, height]: Vector2 = [40, 40]
    ) {
        const [row, col] = coords;
        super(id, new RectangleBounds(0, 0, width, height));
        this.anchor = gridPosition;
        this.originalAnchor = { ...gridPosition };
        this.size = [width, height];
        this.coords = { col, row };
        this.applyPositionChange();
    }

    moveTo(pos: Vector_2) {
        this.anchor = pos;
    }
    moveBy(pos: Vector2) {
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

    private applyPositionChange() {
        const { x, y } = this.anchor;
        this.bounds.setPosition(
            x + this.bounds.width * this.coords.col,
            y + this.bounds.height * this.coords.row
        );
    }

    private selected = false;

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
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.selected ? Tile.HIGHLIGHT_COLOR : "black";
        ctx.lineWidth = 2;
        if (this.selected) ctx.lineWidth = 5;
        ctx.rect(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            this.bounds.height
        );
        ctx.fill();
        ctx.stroke();

        await this.renderPath(ctx);
    }
    setColor(c: TileColor) {
        if (!c) return;
        this.color = c;
    }
    update = asyncNonce;
}
