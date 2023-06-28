import { GameState } from "@/main";
import { ObjectManager } from "@component/ObjectManager";
import { StateManager } from "@component/StateManager";
import { PlayMap } from "@component/Playfield/Playmap/playmap";

export class Playfield extends StateManager<GameState> {
    static DefaultID = "playfield";

    map: PlayMap;

    constructor(manager: ObjectManager<GameState>) {
        super(Playfield.DefaultID, manager, GameState.GAME);
        this.map = new PlayMap({ x: 0, y: 50 });
    }

    private init() {
        this.map.createAMap(9, 9);
        this.map.eachTile(this.registerObject.bind(this));
    }

    startGame(timeout: number = 100) {
        setTimeout(() => {
            this.init();
        }, timeout);
    }
    update(): void {
        this.map.update();
    }
}
