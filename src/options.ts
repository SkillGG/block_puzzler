import { StateManager } from "@component/StateManager";
import { ObjectManager } from "@component/ObjectManager";
import { GameState } from "./main";
import { Label } from "@component/Primitives/Label/Label";
import { RectangleBounds } from "@component/Primitives/Rectangle/RectangleBounds";
import { Game } from "./game";
import { $ } from "@utils/utils";
import { Playfield } from "@component/Playfield/playfield";
import { Button } from "@component/Primitives/Button/button";

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

    areRegistered = false;

    pointsLabel: Label;
    movesLabel: Label;

    dragLabel: Button;

    parent: GameOptions<T>;

    constructor(manager: ObjectManager<T>, state: T, parent: GameOptions<T>) {
        super(OptionsStateManager.DefaultID, manager, state);
        this.pointsLabel = new Label(
            "pointsLabel",
            new RectangleBounds(0, 0, Game.getWidth() - 25, 0),
            "",
            {
                label: { align: "right", font: "normal 1em auto" },
            }
        );
        this.movesLabel = new Label(
            "movesLabel",
            new RectangleBounds(0, 20, Game.getWidth() - 25, 0),
            "",
            {
                label: { align: "right", font: "normal 1em auto" },
            }
        );
        this.dragLabel = new Button(
            "dragLabel",
            new RectangleBounds(
                Game.getWidth() - 200,
                Game.getHeight() - 48,
                150,
                30
            ),
            {
                onclick: () => {
                    this.parent.autoPlaceAfterDrag =
                        !this.parent.autoPlaceAfterDrag;
                },
            },
            "Confirm\nDrag",
            {
                label: { align: "center", font: "normal 1em auto" },
            }
        );
        this.parent = parent;
    }
    refreshUI() {
        this.pointsLabel.text = `Points: ${this.parent.points}`;
        this.movesLabel.text = `Moves: ${this.parent.moves}`;
        if (Game.input.pointerType === "touch")
            this.dragLabel.label.text = this.parent.autoPlaceAfterDrag
                ? "DragConfirm: false"
                : "DragConfirm: true";
        else this.dragLabel.label.text = "";
    }
    removeObjects(): void {
        if (!this.areRegistered) return;
        this.removeObject(this.pointsLabel);
        this.removeObject(this.movesLabel);
        this.removeObject(this.dragLabel);
        this.areRegistered = false;
    }
    registerObjects(): void {
        if (this.areRegistered) return;
        this.registerObject(this.pointsLabel);
        this.registerObject(this.dragLabel);
        this.registerObject(this.movesLabel);
        this.areRegistered = true;
    }
    update(): void {
        this.refreshUI();
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

    autoPlaceAfterDrag: boolean = false;

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

    get isGameOver() {
        return this._gameOver;
    }

    gameOver() {
        this._gameOver = true;
        this.stateManager?.removeObjects();
    }

    gameRestarted() {
        this._gameOver = false;
        this.points = 0;
        this.stateManager?.registerObjects();
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
            if (!this.stateManager?.areRegistered)
                this.stateManager?.registerObjects();
            this.stateManager?.refreshUI();
            return;
        } else {
            this.stateManager?.removeObjects();
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
