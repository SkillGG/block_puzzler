import { GameState } from "@/main";
import { Tile } from "@components/Playfield/Tile/tile";
import { StateManager } from "@components/StateManager";
import { Vector2 } from "@utils";
import { AnimatableTile } from "@components/Animation/objects/animatedTile";
import { Game } from "@/game";
import { AnimatedSprite } from "@components/Animation/objects/animatedSprite";
import { GameObject } from "@components/GameObject";

export interface CanAnimate {
    render(ctx: CanvasRenderingContext2D, frame: number): void;
    moveOffsetBy(x: number, y: number): void;
    moveOffsetBy(v: Vector2): void;
    resizeOffsetBy(x: number, y: number): void;
    resizeOffsetBy(v: Vector2): void;
}

export abstract class GameAnimation<
    T extends GameObject[]
> extends StateManager<GameState> {
    objects: T;
    frame: number;
    defaultID = "animation";
    animating = false;
    startAnimation() {
        this.animating = true;
    }
    onend: (id: string) => void;
    constructor(id: string, end: (id: string) => void, ...objs: T) {
        super(id, Game.instance!.manager, GameState.GAME);
        this.frame = 0;
        this.onend = end;
        this.objects = objs;
    }

    abstract renderAnimation(_: CanvasRenderingContext2D): Promise<void>;
    abstract updateAnimation(_: number): Promise<void>;

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if (this.animating) await this.renderAnimation(ctx);
    }
    async update(dt: number): Promise<void> {
        if (this.animating) await this.updateAnimation(dt);
    }

    end() {
        this.removeObjects();
        this.onend(this.id);
    }

    removeObjects(): void {
        this.objects.forEach((t) => {
            this.removeObject(t);
        });
    }
    registerObjects(): void {
        this.objects.forEach((t) => this.registerObject(t));
    }
}
