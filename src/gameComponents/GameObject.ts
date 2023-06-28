import { Game } from "@/game";
import { RectangleBounds } from "@primitive/Rectangle/RectangleBounds";
import { Renderable, Updateable } from "./interfaces";

export abstract class GameObject implements Updateable, Renderable {
    id: string;
    zIndex: number = 0;
    constructor(id: string) {
        this.id = id;
    }
    abstract render(ctx: CanvasRenderingContext2D): void;
    abstract update(time: number): void;
}

export abstract class BoundedGameObject extends GameObject {
    bounds: RectangleBounds;
    constructor(id: string, bounds: RectangleBounds) {
        super(id);
        this.bounds = bounds;
    }
    getRelativeBounds() {
        if (!Game.instance) throw "GameObject created outside of a game!";
        const relV = Game.getRelativeVector(this.bounds.getPosition());
        return { ...this.bounds, x: relV[0], y: relV[1] };
    }
}
