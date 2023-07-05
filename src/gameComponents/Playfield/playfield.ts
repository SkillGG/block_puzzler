import { GameState } from "@/main";
import { ObjectManager } from "@component/ObjectManager";
import { StateManager } from "@component/StateManager";
import { PlayMap } from "@component/Playfield/Playmap/playmap";
import { Tile, TileColor } from "./Tile/tile";
import { getRandomWeightedNumber, randomInt } from "@utils/utils";
import { GameOptions } from "@/options";
import { GameOverScreen } from "./gameOverScreen";

export class Playfield extends StateManager<GameState> {
    static DefaultID = "playfield";
    get defaultID() {
        return Playfield.DefaultID;
    }

    map: PlayMap;
    gameOverScreen: GameOverScreen;

    constructor(manager: ObjectManager<GameState>) {
        super(Playfield.DefaultID, manager, GameState.GAME);
        this.map = new PlayMap({ x: 0, y: 50 }, this);
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

        return getRandomWeightedNumber(
            Object.values(TileColor).map((color) => {
                if (color === TileColor.NONE) return [80, color];
                return [0.05 * moveNum, color];
            })
        );
    };

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
        this.map.destroy();
    }
    registerObjects(): void {
        this.map.eachTile((t) => this.registerObject(t));
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
