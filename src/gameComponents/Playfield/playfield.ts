import { GameState } from "@/main";
import { ObjectManager } from "@component/ObjectManager";
import { StateManager } from "@component/StateManager";
import { PlayMap } from "@component/Playfield/Playmap/playmap";
import { Tile, TileColor } from "./Tile/tile";
import { randomInt } from "@utils/utils";

export class Playfield extends StateManager<GameState> {
    static DefaultID = "playfield";

    map: PlayMap;

    constructor(manager: ObjectManager<GameState>) {
        super(Playfield.DefaultID, manager, GameState.GAME);
        this.map = new PlayMap({ x: 0, y: 50 });
    }

    private init() {
        this.map.createAMap(6, 6);
        this.map.eachTile(this.registerObject.bind(this));
    }

    static randomTileColor = () => {
        const rand = randomInt(0, 2);
        if (rand === 0) return TileColor.BLUE;
        if (rand === 1) return TileColor.RED;
        else return TileColor.YELLOW;
    };

    static randomTileColor_EASY = (
        t: Tile,
        n: number,
        _a: Tile[][],
        moveNum: number
    ) => {
        if (t.color !== TileColor.NONE) return t.color;
        if (n >= 5) return TileColor.NONE;

        const probabilityOfchangingColor = Math.max(1, 0.3 * moveNum);

        const rand = randomInt(0, 100);

        if (rand > 1 && rand < 1 + probabilityOfchangingColor)
            return TileColor.BLUE;
        if (rand > 31 && rand < 31 + probabilityOfchangingColor)
            return TileColor.RED;
        if (rand > 61 && rand < 61 + probabilityOfchangingColor)
            return TileColor.YELLOW;
        return TileColor.NONE;
    };

    startGame(timeout: number = 100) {
        setTimeout(() => {
            this.init();
        }, timeout);
    }
    update(time: number): void {
        this.map.update(time);
    }
}
