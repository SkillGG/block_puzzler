import { Game } from "@/game";
import { GameObject } from "@component/GameObject";
import { Renderable, Updateable } from "@component/interfaces";
import { StateManager } from "@component/StateManager";

export class ObjectManager<AvailableStates extends string>
    implements Updateable, Renderable
{
    game: Game<AvailableStates>;

    stateObjects: Map<AvailableStates, GameObject[]>;
    objectManagers: StateManager<any>[] = [];
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
    addStateManager<T extends string>(om: StateManager<T>) {
        this.objectManagers.push(om);
    }
    getStateManager<T extends StateManager<any>>(omid: string): T | null {
        return (this.objectManagers.find((f) => f.id === omid) as T) || null;
    }

    removeObject(objid: string, state: AvailableStates) {
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
        const omToRemove = this.objectManagers.find((f) => f.id === omid);
        if (!omToRemove) return;
        omToRemove.removeObjects();
        this.objectManagers = this.objectManagers.filter((f) => f.id !== omid);
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

    render(ctx: CanvasRenderingContext2D) {
        const objectsFromThisState = this.stateObjects.get(this.currentState);
        if (objectsFromThisState) {
            this.divideByZ(objectsFromThisState).forEach((zLayer) => {
                zLayer.forEach((obj) => {
                    ctx.beginPath();
                    obj.safeCTXRender(ctx);
                    ctx.closePath();
                });
            });
        }
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
            console.log(obj);
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
        this.objectManagers
            .filter((om) => om.state === this.currentState)
            .forEach((om) => {
                om.update(time);
            });
        this.stateObjects.get(this.currentState)?.forEach((obj) => {
            obj.update(time);
        });
    }
}
