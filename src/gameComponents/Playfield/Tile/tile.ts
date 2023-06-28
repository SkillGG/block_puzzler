import { LogI } from "@/game";
import { BoundedGameObject } from "@component/GameObject";
import { RectangleBounds } from "@component/Primitives/Rectangle/RectangleBounds";
import { Vector2, Vector_2 } from "@utils/utils";

export enum TileColor {
    NONE = "transparent",
    BLUE = "blue",
    RED = "red",
    YELLOW = "yellow",
}

export type TileCoords = { col: number; row: number };

export class Tile extends BoundedGameObject {
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
        [width, height]: Vector2 = [25, 25]
    ) {
        const [row, col] = coords;
        LogI(`Creating a tile #${id} @ ${col}/${row}`);
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
        ctx.strokeStyle = this.selected ? "green" : "black";
        ctx.lineWidth = 1;
        if (this.selected) ctx.lineWidth = 3;
        ctx.rect(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            this.bounds.height
        );
        ctx.fill();
        ctx.stroke();
        ctx.font = "5px";
        ctx.fillStyle = "black";
        const tNW = ctx.measureText(this.tileNumberStr);
        ctx.fillText(
            `${this.tileNumberStr}`,
            this.bounds.x,
            this.bounds.y +
                tNW.actualBoundingBoxAscent +
                tNW.actualBoundingBoxDescent +
                2,
            this.bounds.width
        );
    }
    update(time: number): void {}
}
