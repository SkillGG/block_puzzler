import { GameState } from "@/main";
import { Tile } from "@components/Playfield/Tile/tile";
import { StateManager } from "@components/StateManager";
import { Vector2 } from "@utils";
import { AnimatableTile } from "./animatedTile";
import { Game } from "@/game";
import { AnimatedSprite } from "./animatedSprite";

export interface CanAnimate {
    render(ctx: CanvasRenderingContext2D, frame: number): void;
    moveOffsetBy(x: number, y: number): void;
    moveOffsetBy(v: Vector2): void;
    resizeOffsetBy(x: number, y: number): void;
    resizeOffsetBy(v: Vector2): void;
}

export abstract class GameAnimation extends StateManager<GameState> {
    tiles: (AnimatableTile | AnimatedSprite)[];
    frame: number;
    defaultID = "animation";
    animating = false;
    startAnimation() {
        this.animating = true;
    }
    onend: (id: string) => void;
    constructor(
        id: string,
        end: (id: string) => void,
        ...tiles: Tile[]
    ) {
        super(id, Game.instance!.manager, GameState.GAME);
        this.tiles = tiles
            .slice(0, 4)
            .map((t) => new AnimatableTile(this.id, t));
        this.frame = 0;
        this.onend = end;
    }
    abstract render(_: CanvasRenderingContext2D): void;
    abstract update(dt: number): Promise<void>;

    end() {
        this.removeObjects();
        this.onend(this.id);
    }

    removeObjects(): void {
        this.tiles.forEach((t) => {
            this.removeObject(t);
        });
    }
    registerObjects(): void {
        this.tiles.forEach((t) => this.registerObject(t));
    }
}
