import { StateManager } from "@component/StateManager";
import { ObjectManager } from "@component/ObjectManager";
import { GameState } from "./main";
import { Label } from "@component/Primitives/Label/Label";
import { RectangleBounds } from "@component/Primitives/Rectangle/RectangleBounds";
import { Game } from "./game";
import { $ } from "@utils/utils";
import { Playfield } from "@component/Playfield/playfield";

declare global {
    interface Window {
        options: GameOptions<GameState>;
    }
}

export class OptionsStateManager<T extends string> extends StateManager<T> {
    static DefaultID = "options";
    get defaultID() {
        return OptionsStateManager.DefaultID;
    }

    pointsLabel: Label;

    parent: GameOptions<T>;

    constructor(manager: ObjectManager<T>, state: T, parent: GameOptions<T>) {
        super(OptionsStateManager.DefaultID, manager, state);
        this.pointsLabel = new Label(
            "pointsLabel",
            new RectangleBounds(0, 0, Game.getWidth() - 25, 50),
            "",
            {
                label: { align: "right" },
                border: { strokeColor: "transparent" },
            }
        );
        this.parent = parent;
    }
    refreshUI() {
        this.pointsLabel.text = `Points: ${this.parent.points}`;
    }
    removeObjects(): void {
        this.removeObject(this.pointsLabel);
    }
    registerObjects(): void {
        console.log("registering options");
        this.registerObject(this.pointsLabel);
    }
    update(): void {
        this.pointsLabel.text = `Points ${this.parent.points}`;
    }
}

export class GameOptions<T extends string> {
    static instance: GameOptions<any> | null = null;

    optionsBox: HTMLDivElement;
    get isHidden(): boolean {
        return getComputedStyle(this.optionsBox).display === "none";
    }
    stateManager: OptionsStateManager<T> | null = null;
    points: number = 0;
    get moves() {
        const osm = Game.instance?.manager.getStateManager<Playfield>(
            Playfield.DefaultID
        );
        if (!osm) return 0;
        return osm.map.moveCount;
    }
    constructor(box: HTMLDivElement) {
        this.optionsBox = box;
        GameOptions.instance = this;
    }

    private _gameOver = false;

    gameOver() {
        this._gameOver = true;
    }

    gameRestarted() {
        this._gameOver = false;
        this.points = 0;
        // save highscore
    }

    updateOrCreateStat(
        query: [string, string],
        value: string,
        statName: string
    ) {
        const elem = this.optionsBox.querySelector<HTMLSpanElement>(query[0]);
        if (!elem) {
            this.optionsBox.append(
                $`.stat`({
                    children: [
                        $`span`({ _html: statName }),
                        $`${query[1]}`({ _html: value }),
                    ],
                })
            );
        } else {
            elem.innerHTML = value;
        }
    }

    refreshUI() {
        if (this.isHidden) {
            this.stateManager?.refreshUI();
            return;
        }
        if (
            this.stateManager?.manager.currentState === GameState.GAME &&
            !this._gameOver
        ) {
            this.updateOrCreateStat(
                ["span.gamePoints", "span.gamePoints.gameStatValue"],
                `${this.points}`,
                "Points:"
            );
            this.updateOrCreateStat(
                ["span.gameMoves", "span.gameMoves.gameStatValue"],
                `${this.moves}`,
                "Moves:"
            );
        } else {
            this.optionsBox.innerHTML = "";
        }
    }

    addPoints(pts: number) {
        console.log("Adding points!");
        this.points += pts;
    }
    createManager(manager: ObjectManager<T>, state: T) {
        this.stateManager = new OptionsStateManager(manager, state, this);
    }
}
