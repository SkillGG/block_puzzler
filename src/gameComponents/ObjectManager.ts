import { Game } from "@/game";
import { GameObject, GameObjectManager } from "./GameObject";
import { Renderable, Updateable } from "./interfaces";

export class ObjectManager<AvailableStates extends string>
    implements Updateable, Renderable
{
    game: Game<AvailableStates>;

    stateObjects: Map<AvailableStates, GameObject[]>;
    objectManagers: GameObjectManager<any>[] = [];
    currentState: AvailableStates;

    constructor(g: Game<AvailableStates>, defaultState: AvailableStates) {
        this.game = g;
        this.stateObjects = new Map();
        this.currentState = defaultState;
    }
    registerGameState(...states: AvailableStates[]) {
        for (const s of states)
            if (!this.stateObjects.has(s)) this.stateObjects.set(s, []);
    }
    addObjectManager<T extends string>(om: GameObjectManager<T>) {
        this.objectManagers.push(om);
    }
    getObjectManager<T extends GameObjectManager<any>>(omid: string) {
        return (this.objectManagers.find((f) => f.id === omid) as T) || null;
    }
    render(ctx: CanvasRenderingContext2D) {
        this.stateObjects.get(this.currentState)?.forEach((obj) => {
            ctx.beginPath();
            obj.render(ctx);
            ctx.closePath();
        });
    }
    getStateObjects(state: AvailableStates) {
        const sObjs = this.stateObjects.get(state);
        if (!sObjs) {
            console.error("Unknown game state!");
            return null;
        }
        return sObjs;
    }
    addObject<T extends GameObject>(obj: T, state: AvailableStates): T | null {
        const sObjs = this.getStateObjects(state);
        if (!sObjs) return null;
        if (sObjs.find((o) => obj.id === o.id)) {
            console.error("Object with that id already exists in this state!");
            return null;
        }
        sObjs.push(obj);
        return obj;
    }
    getObject<T extends GameObject>(id: string, state: AvailableStates) {
        const sObjs = this.getStateObjects(state);
        if (!sObjs) return null;
        return (sObjs.find((o) => o.id === id) as T) || null;
    }
    update(time: number) {
        this.stateObjects.get(this.currentState)?.forEach((obj) => {
            obj.update(time);
        });
    }
}
