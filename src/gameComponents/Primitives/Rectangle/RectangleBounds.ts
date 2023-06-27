import { Game } from "@/game";
import { Vector2 } from "@utils/utils";

export class RectangleBounds {
    constructor(
        x: number | Vector2,
        y: number | Vector2,
        w?: number,
        h?: number
    ) {
        if (
            Array.isArray(x) &&
            Array.isArray(y) &&
            w === undefined &&
            h === undefined
        ) {
            this.x = x[0];
            this.y = x[1];
            this.width = y[0];
            this.height = y[1];
        } else if (
            !Array.isArray(x) &&
            !Array.isArray(y) &&
            w !== undefined &&
            h !== undefined
        ) {
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
        } else throw "Incorrect constructor!";
        this.normalize();
    }
    x: number;
    y: number;
    width: number;
    height: number;
    getSize(): Vector2 {
        return [this.width, this.height];
    }
    getPosition(): Vector2 {
        return [this.x, this.y];
    }
    intersects(r: RectangleBounds) {
        const r1 = new RectangleBounds(
            Game.getRelativeVector(this.getPosition()),
            this.getSize()
        );

        var quickCheck =
            r1.x <= r.x + r.width &&
            r.x <= r1.x + r1.width &&
            r1.y <= r.y + r.height &&
            r.y <= r1.y + r1.height;

        if (quickCheck) return true;
        var x_overlap = Math.max(
            0,
            Math.min(r1.x + r1.width, r.x + r.width) - Math.max(r1.x, r.x)
        );
        var y_overlap = Math.max(
            0,
            Math.min(r1.y + r1.height, r.y + r.height) - Math.max(r1.y, r.y)
        );
        var overlapArea = x_overlap * y_overlap;
        return overlapArea === 0;
    }
    hasPoint(v: Vector2) {
        const [x, y] = v;
        return (
            x > this.x &&
            x < this.x + this.width &&
            y > this.y &&
            y < this.y + this.height
        );
    }
    normalize() {
        if (this.width < 0) this.x -= this.width = Math.abs(this.width);
        if (this.height < 0) this.y -= this.height = Math.abs(this.height);
    }
}

export interface RotatedRectangleBounds {
    /**
     * TODO: Rotated Rectangles
     */
}
