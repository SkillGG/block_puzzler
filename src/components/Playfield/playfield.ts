import { GameState } from "@/main";
import { ObjectManager } from "@components/ObjectManager";
import { StateManager } from "@components/StateManager";
import { PlayMap } from "@components/Playfield/Playmap/playmap";
import { Tile, TileColor } from "./Tile/tile";
import { getRandomWeightedNumber, randomInt } from "@utils";
import { GameOptions } from "@/options";
import { GameOverScreen } from "./gameOverScreen";
import { BreakingAnimation } from "@components/Animation/Break/break";
import { MovingAnimation } from "@components/Animation/Move/move";

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
        n: number,
        _a: Tile[][],
        moveNum: number
    ) => {
        if (moveNum === 0) {
            // start randomizing
        }

        if (t.color !== TileColor.NONE) return t.color;
        if (n >= 5) return TileColor.NONE;

        // return "random";

        return getRandomWeightedNumber(
            Object.values(TileColor).map((color) => {
                if (color === TileColor.NONE) return [80, color];
                return [0.05 * moveNum, color];
            })
        );
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
        const osm = GameOptions.instance;
        if (!osm) return;
        osm.gameRestarted();
        this.map.start();
    }

    restartGame(mapSize: number) {
        this.gameOverScreen.removeObjects();
        this.startGame(mapSize);
    }

    gameOver() {
        this.gameOverScreen.registerObjects();
        const osm = GameOptions.instance;
        if (!osm) return;
        osm.gameOver();
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
        const osm = GameOptions.instance;
        if (!osm) return;
        osm.addPoints(pts);
    }
    async update(time: number) {
        await this.map.update(time);
    }
}
