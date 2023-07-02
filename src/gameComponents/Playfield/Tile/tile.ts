import { BoundedGameObject } from "@component/GameObject";
import { RectangleBounds } from "@component/Primitives/Rectangle/RectangleBounds";
import { Vector2, Vector_2 } from "@utils/utils";

export enum TileColor {
    NONE = "transparent",
    BLUE = "#33ce",
    RED = "#f00d",
    YELLOW = "#ff0c",
    GREEN = "#0f0a",
}

export type TileCoords = { col: number; row: number };

export class Tile extends BoundedGameObject {
    static HIGHLIGHT_COLOR = "white";

    item: string | null = null;

    anchor: Vector_2;
    size: Vector2;
    coords: TileCoords;

    color: TileColor = TileColor.NONE;

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

    render(ctx: CanvasRenderingContext2D): void {
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
        // ctx.font = "normal 1.3em auto";
        // ctx.fillStyle = "black";
        // ctx.fillText(
        //     this.id.replace("tile", ""),
        //     this.bounds.x + 3,
        //     this.bounds.y + 20
        // );
    }
    setColor(c: TileColor) {
        if (!c) return;
        this.color = c;
    }
    update(): void {}
}
