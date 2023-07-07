import { Tile } from "./tile";

export class RainbowTile extends Tile {
    phase = 0;
    async update(_dT: number) {
        this.phase++;
    }
    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        super.render(ctx);
    }
}
