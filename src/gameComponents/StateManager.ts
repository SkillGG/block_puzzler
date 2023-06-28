import { GameObject } from "@component/GameObject";
import { ObjectManager } from "@component/ObjectManager";
import { Updateable } from "./interfaces";

export abstract class StateManager<T extends string> implements Updateable {
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
    abstract update(t: number): void;
}
