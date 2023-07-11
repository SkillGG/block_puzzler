import { Game } from "@/game";
import { GameObject } from "@components/GameObject";
import { Renderable, Updateable } from "@utils";
import { StateManager } from "@components/StateManager";

export class ObjectManager<AvailableStates extends string>
    implements Updateable, Renderable
{
    game: Game<AvailableStates>;

    stateObjects: Map<AvailableStates | "any", GameObject[]>;
    stateManagers: StateManager<any>[] = [];
    currentState: AvailableStates;

    constructor(g: Game<AvailableStates>, defaultState: AvailableStates) {
        this.game = g;
        this.stateObjects = new Map([["any", []]]);
        this.currentState = defaultState;
    }
    registerGameState(...states: AvailableStates[]) {
        for (const s of states)
            if (!this.stateObjects.has(s)) this.stateObjects.set(s, []);
    }
    addStateManager<T extends string>(om: StateManager<T>) {
        this.stateManagers.push(om);
    }
    getStateManager<T extends StateManager<any>>(omid: string): T | null {
        return (this.stateManagers.find((f) => f.id === omid) as T) || null;
    }

    removeObject(objid: string, state: AvailableStates | "any") {
        this.stateObjects = new Map(
            [...this.stateObjects].map((stateData) => {
                if (stateData[0] === state) {
                    return [
                        stateData[0],
                        stateData[1].filter((o) => {
                            return o.id !== objid;
                        }),
                    ];
                } else return stateData;
            })
        );
    }

    removeStateManager<T extends string>(omid: T) {
        const omToRemove = this.stateManagers.find((f) => f.id === omid);
        if (!omToRemove) return;
        omToRemove.removeObjects();
        this.stateManagers = this.stateManagers.filter((f) => f.id !== omid);
    }

    private divideByZ = (objects: GameObject[]): GameObject[][] => {
        const zLayers: Map<number, GameObject[]> = new Map();

        for (let i = 0; i < objects.length; i++) {
            const o = objects[i];
            if (zLayers.has(o.zIndex)) {
                zLayers.get(o.zIndex)!.push(o);
            } else {
                zLayers.set(o.zIndex, [o]);
            }
        }

        return [...zLayers]
            .sort((a, b) => a[0] - b[0])
            .map((layer) => layer[1]);
    };

    async render(ctx: CanvasRenderingContext2D) {
        const objectsFromThisState = this.getStateObjects(this.currentState);
        if (objectsFromThisState) {
            for (const zLayer of this.divideByZ(objectsFromThisState)) {
                for (const obj of zLayer) {
                    ctx.beginPath();
                    await obj.safeCTXRender(ctx);
                    ctx.closePath();
                }
            }
        }
    }

    getStateObjects(state: AvailableStates) {
        const fromAny = this.stateObjects.get("any");
        if (!fromAny) {
            console.error("Any array doesn't exist!");
            return null;
        }

        const sObjs = this.stateObjects.get(state);
        if (!sObjs) {
            console.error("Unknown game state!");
            return null;
        }
        return [...sObjs, ...fromAny];
    }

    getStateManagers(state: AvailableStates) {
        const managers = this.stateManagers.filter(
            (m) => m.state === state || m.state === "any"
        );
        managers.forEach((m) => (m.currentState = this.currentState));
        return managers;
    }

    addObject<T extends GameObject>(
        obj: T,
        state: AvailableStates | "any"
    ): T | null {
        const sObjs = this.stateObjects.get(state);
        if (!sObjs) return null;
        if (sObjs.find((o) => obj.id === o.id)) {
            console.error("Object with that id already exists in this state!");
            return null;
        }
        sObjs.push(obj);
        return obj;
    }

    getObject<T extends GameObject>(id: string, state: AvailableStates) {
        const sObjs = this.stateObjects.get(state);
        if (!sObjs) return null;
        return (sObjs.find((o) => o.id === id) as T) || null;
    }
    async update(time: number) {
        for (const om of this.getStateManagers(this.currentState)) {
            await om.update(time);
        }
        for (const obj of this.getStateObjects(this.currentState) || []) {
            await obj.update(time);
        }
    }
}
