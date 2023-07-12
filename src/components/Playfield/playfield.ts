import { GameState } from "@/main";
import { ObjectManager } from "@components/ObjectManager";
import { StateManager } from "@components/StateManager";
import { PlayMap } from "@components/Playfield/Playmap/playmap";
import { Tile, TileColor } from "./Tile/tile";
import { getRandomWeightedNumber, randomInt } from "@utils";
import { GameSettings } from "@/UI";
import { GameOverScreen } from "./gameOverScreen";
import { BreakingAnimation } from "@components/Animation/Break/break";
import { MovingAnimation } from "@components/Animation/Move/move";
import { Game } from "@/game";

export class Playfield extends StateManager<GameState> {
    static DefaultID = "playfield";
    get defaultID() {
        return Playfield.DefaultID;
    }

    map: PlayMap;
    gameOverScreen: GameOverScreen;

    constructor(manager: ObjectManager<GameState>) {
        super(Playfield.DefaultID, manager, GameState.GAME);
        this.map = new PlayMap({ x: "center", y: 75 }, this);
        this.gameOverScreen = new GameOverScreen(this);
        this.manager.addStateManager(this.gameOverScreen);
    }

    private init(mapSize: number) {
        this.map.createAMap(mapSize, mapSize);
    }

    static randomTileColor = () => {
        const rand = randomInt(0, Object.values(TileColor).length - 2);
        return Object.values(TileColor).filter((t) => t !== TileColor.NONE)[
            rand
        ];
    };

    static randomTileColor_EASY = (
        t: Tile,
        alreadyColored: number,
        remainingTiles: number,
        moveNum: number
    ) => {
        if (moveNum === 0) {
            // start randomizing
        }

        if (t.color !== TileColor.NONE) return t.color;
        if (alreadyColored >= 5) return null;

        const weightMap: [number, TileColor][] =
            GameSettings.instance.tileColorsForLvl.map((color, i) => {
                if (color === TileColor.NONE) return [80, color];
                return [
                    i < 4
                        ? 0.5 + GameSettings.instance.level
                        : 0.5 + GameSettings.instance.level - 3 + 0.5 * (5 - i),
                    color,
                ];
            });

        console.log(weightMap.flat(1));

        if (alreadyColored === 0 && remainingTiles < 1) {
            const atLeastOneColorWeights =
                GameSettings.instance.tileColorsForLvl
                    .filter((c) => c !== TileColor.NONE)
                    .map((q, i) => [i < 3 ? 5 : 0.5, q] as [number, TileColor]);
            console.log("aocw", atLeastOneColorWeights);
            return getRandomWeightedNumber([...atLeastOneColorWeights]);
        }

        const randomColor = getRandomWeightedNumber<TileColor>(weightMap);

        return randomColor;
    };

    animations: number[] = [];

    getFreeAnimationID = () => {
        const nA = [...this.animations];
        nA.sort((a, b) => a - b);
        return (nA[nA.length - 1] || 0) + 1;
    };

    playDestroyAnimation(c: Tile[]) {
        const animNum = this.getFreeAnimationID();
        const animID = "break" + animNum;
        const anim = new BreakingAnimation.animation(
            animID,
            () => {
                this.manager.removeStateManager(animID);
                this.animations = this.animations.filter((a) => a !== animNum);
            },
            c[0]
        );
        this.animations.push(animNum);
        this.manager.addStateManager(anim);
        anim.registerObjects();
    }

    playMovingAnimation(p: Tile[], onStart: () => void, onEnd: () => void) {
        const animNum = this.getFreeAnimationID();
        const animID = "move" + animNum;
        const anim = new MovingAnimation.animation(
            animID,
            onStart,
            () => {
                this.manager.removeStateManager(animID);
                this.animations = this.animations.filter((a) => a !== animNum);
                onEnd();
            },
            p
        );
        this.animations.push(animNum);
        this.manager.addStateManager(anim);
        anim.registerObjects();
    }

    startGame(ms: number) {
        this.init(ms);
        GameSettings.instance.gameRestarted();
        this.map.start();
    }

    restartGame(mapSize: number) {
        this.gameOverScreen.removeObjects();
        this.startGame(mapSize);
    }

    gameOver() {
        this.gameOverScreen.registerObjects();
        GameSettings.instance.gameOver();
    }
    removeObjects(): void {
        this.map.eachTile((t) => this.removeObject(t));
        this.removeObject(this.map.border);
        this.map.destroy();
    }
    registerObjects(): void {
        this.map.eachTile((t) => this.registerObject(t));
        this.registerObject(this.map.border);
    }
    addPoints(pts: number): void {
        GameSettings.instance.addPoints(pts);
    }
    async update(time: number) {
        if (
            !this.map.gameOver &&
            Game.input.isCtrl() === "Left" &&
            Game.input.isPressed("KeyA")
        ) {
            this.map.gameOver = true;
            this.gameOver();
        }
        await this.map.update(time);
    }
}
