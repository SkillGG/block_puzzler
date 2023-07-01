import { Game } from "@/game";
import { RectangleBounds } from "@primitive/Rectangle/RectangleBounds";
import { Renderable, Updateable } from "./interfaces";

export abstract class GameObject implements Updateable, Renderable {
    id: string;
    zIndex: number;
    constructor(id: string, zIndex = 0) {
        this.id = id;
        this.zIndex = zIndex;
    }
    safeCTXRender(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.render(ctx);
        ctx.restore();
    }
    abstract render(ctx: CanvasRenderingContext2D): void;
    abstract update(time: number): void;
}

export abstract class BoundedGameObject extends GameObject {
    bounds: RectangleBounds;
    constructor(id: string, bounds: RectangleBounds, zIndex?: number) {
        super(id, zIndex);
        this.bounds = bounds;
    }
    getRelativeBounds() {
        if (!Game.instance) throw "GameObject created outside of a game!";
        const relV = Game.getRelativeVector(this.bounds.getPosition());
        return { ...this.bounds, x: relV[0], y: relV[1] };
    }
}
