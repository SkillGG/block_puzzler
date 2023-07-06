import { Game } from "@/game";
import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
import { Renderable, Updateable } from "@utils";

export abstract class GameObject implements Updateable, Renderable {
    id: string;
    zIndex: number;
    constructor(id: string, zIndex = 0) {
        this.id = id;
        this.zIndex = zIndex;
    }
    async safeCTXRender(ctx: CanvasRenderingContext2D) {
        ctx.save();
        await this.render(ctx);
        ctx.restore();
    }
    abstract render(ctx: CanvasRenderingContext2D): Promise<void>;
    abstract update(time: number): Promise<void>;
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
