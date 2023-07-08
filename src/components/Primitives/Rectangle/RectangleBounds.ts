import { Game } from "@/game";
import { Vector2, Vector_2, Vector4 } from "@utils";

export class RectangleBounds {
    constructor(x: Vector2, y: Vector2);
    constructor(x: number, y: number, w: number, h: number);
    constructor(x: Vector_2, y: Vector2);
    /**
     * copy constructor
     * @param r RectangleBounds to copy
     */
    constructor(r: RectangleBounds);
    constructor(
        x: Vector2 | Vector_2 | number | RectangleBounds,
        y?: Vector2 | number,
        w?: number,
        h?: number
    ) {
        if (
            Array.isArray(x) &&
            Array.isArray(y) &&
            w === undefined &&
            h === undefined
        ) {
            this.pos = { x: x[0], y: x[1] };
            this.width = y[0];
            this.height = y[1];
        } else if (
            !Array.isArray(x) &&
            typeof x === "object" &&
            typeof y === "number" &&
            typeof w === "number" &&
            h === undefined
        ) {
            this.pos = x;
            this.width = y;
            this.height = w;
        } else if (
            typeof x === "number" &&
            typeof y === "number" &&
            typeof w === "number" &&
            typeof h === "number"
        ) {
            this.pos = { x, y };
            this.width = w;
            this.height = h;
        } else if (x instanceof RectangleBounds) {
            this.pos = {
                x: x.x,
                y: x.y,
            };
            this.width = x.width;
            this.height = x.height;
        } else {
            throw "Incorrect constructor!";
        }
        this.normalize();
    }
    pos: Vector_2;
    get x() {
        return this.pos.x;
    }
    get y() {
        return this.pos.y;
    }
    get asVec4() {
        return [this.pos.x, this.pos.y, this.width, this.height] as Vector4;
    }
    width: number;
    height: number;
    getSize(): Vector2 {
        return [this.width, this.height];
    }
    setSize([w, h]: Vector2) {
        this.width = w;
        this.height = h;
    }
    getPosition(): Vector2 {
        return [this.pos.x, this.pos.y];
    }
    getPositionAsVector(): Vector_2 {
        return this.pos;
    }
    setPosition(pos: Vector_2): void;
    setPosition(pos: Vector2): void;
    setPosition(x: number, y: number): void;
    setPosition(posOrX: Vector2 | Vector_2 | number, y?: number): void {
        if (typeof posOrX === "number" && typeof y === "number") {
            this.pos.x = posOrX;
            this.pos.y = y;
        } else if (Array.isArray(posOrX)) {
            const [x, y] = posOrX;
            this.pos.x = x;
            this.pos.y = y;
        } else if (typeof posOrX !== "number") this.pos = posOrX;
        else
            throw `Incorrect parameters in setPosition! ${typeof posOrX},${typeof y}`;
    }
    moveBy(pos: Vector_2): void;
    moveBy(pos: Vector2): void;
    moveBy(x: number, y: number): void;
    moveBy(posOrX: Vector2 | Vector_2 | number, y?: number): void {
        if (typeof posOrX === "number" && typeof y === "number") {
            this.pos.x += posOrX;
            this.pos.y += y;
        } else if (Array.isArray(posOrX)) {
            const [x, y] = posOrX;
            this.pos.x += x;
            this.pos.y += y;
        } else if (typeof posOrX !== "number") {
            this.pos.x += posOrX.x;
            this.pos.y += posOrX.y;
        } else
            throw `Incorrect parameters in setPosition! ${typeof posOrX},${typeof y}`;
    }
    intersects(r: RectangleBounds) {
        const r1 = new RectangleBounds(
            Game.getRelativeVector(this.getPosition()),
            this.getSize()
        );

        var quickCheck =
            r1.pos.x <= r.pos.x + r.width &&
            r.pos.x <= r1.pos.x + r1.width &&
            r1.pos.y <= r.pos.y + r.height &&
            r.pos.y <= r1.pos.y + r1.height;

        if (quickCheck) return true;
        var x_overlap = Math.max(
            0,
            Math.min(r1.pos.x + r1.width, r.pos.x + r.width) -
                Math.max(r1.pos.x, r.pos.x)
        );
        var y_overlap = Math.max(
            0,
            Math.min(r1.pos.y + r1.height, r.pos.y + r.height) -
                Math.max(r1.pos.y, r.pos.y)
        );
        var overlapArea = x_overlap * y_overlap;
        return overlapArea === 0;
    }
    hasPoint(v: Vector2) {
        const [x, y] = v;
        return (
            x > this.pos.x &&
            x < this.pos.x + this.width &&
            y > this.pos.y &&
            y < this.pos.y + this.height
        );
    }
    normalize() {
        if (this.width < 0) this.pos.x -= this.width = Math.abs(this.width);
        if (this.height < 0) this.pos.y -= this.height = Math.abs(this.height);
    }
}

export interface RotatedRectangleBounds {
    /**
     * TODO: Rotated Rectangles
     */
}
