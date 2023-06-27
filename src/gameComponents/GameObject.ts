import { Game } from "@/game";
import { ObjectManager } from "./ObjectManager";
import { RectangleBounds } from "@primitive/Rectangle/RectangleBounds";
import { Renderable, Updateable } from "./interfaces";

export abstract class GameObjectManager<T extends string> {
    id: string;
    manager: ObjectManager<T>;
    state: T;
    constructor(id: string, manager: ObjectManager<T>, state: T) {
        this.id = id;
        this.manager = manager;
        this.state = state;
    }
    registerObject<T extends GameObject>(...obs: T[]) {
        for (const o of obs) this.manager.addObject(o, this.state);
    }
}

export abstract class GameObject implements Updateable, Renderable {
    id: string;
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
        const relV = Game.getRelativeVector([this.bounds.x, this.bounds.y]);
        return { ...this.bounds, x: relV[0], y: relV[1] };
    }
}
