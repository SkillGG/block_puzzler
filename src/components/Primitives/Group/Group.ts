import { oGROUP_Z } from "@/utils/zLayers";
import { GameObject } from "@components/GameObject";
import { Hideable } from "@utils";

export class Group extends GameObject implements Hideable {
    objects: GameObject[];
    constructor(id: string, zIndex = oGROUP_Z, ...objects: GameObject[]) {
        super(id, zIndex);
        this.objects = objects;
    }

    #hidden = false;
    show = () => (this.#hidden = false);
    hide = () => (this.#hidden = true);

    getObject<T extends GameObject>(id: string) {
        const o = this.objects.find((r) => r.id === id);
        if (!o)
            throw new Error("Object with that ID doesn't exist in this group");
        return o as T;
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if (this.#hidden) return;
        for (const o of this.objects) await o.render(ctx);
    }
    async update(time: number): Promise<void> {
        if (this.#hidden) return;
        for (const o of this.objects) await o.update(time);
    }
}
