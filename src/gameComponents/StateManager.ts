import { GameObject } from "@component/GameObject";
import { ObjectManager } from "@component/ObjectManager";
import { Updateable } from "./utils";

export abstract class StateManager<T extends string> implements Updateable {
    id: string;
    manager: ObjectManager<T>;
    state: T;
    abstract get defaultID(): string;
    constructor(id: string, manager: ObjectManager<T>, state: T) {
        this.id = id;
        this.manager = manager;
        this.state = state;
    }
    registerObject(...obs: GameObject[]) {
        for (const o of obs) this.manager.addObject(o, this.state);
    }
    removeObject(...obs: GameObject[]) {
        for (const o of obs) this.manager.removeObject(o.id, this.state);
    }
    abstract update(t: number): Promise<void>;
    abstract removeObjects(): void;
    abstract registerObjects(): void;
}
