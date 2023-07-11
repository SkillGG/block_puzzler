import { StateManager } from "@components/StateManager";
import { ObjectManager } from "@components/ObjectManager";
import { GameState } from "./main";
import { Label } from "@components/Primitives/Label/Label";
import { RectangleBounds } from "@components/Primitives/Rectangle/RectangleBounds";
import { Game } from "./game";
import { Playfield } from "@components/Playfield/playfield";
import { Button } from "@components/Primitives/Button/Button";

declare global {
    interface Window {
        options: GameSettings<GameState>;
    }
}

export class UIManager<T extends string> extends StateManager<T> {
    static DefaultID = "options";
    get defaultID() {
        return UIManager.DefaultID;
    }
    areRegistered = false;
    pointsLabel: Label;
    movesLabel: Label;
    dragLabel: Button;
    parent: GameSettings<T>;

    constructor(manager: ObjectManager<T>, parent: GameSettings<T>) {
        super(UIManager.DefaultID, manager, "any");
        this.pointsLabel = new Label(
            "pointsLabel",
            new RectangleBounds(0, 10, Game.getWidth() - 25, 0),
            "",
            {
                label: { halign: "right", font: "normal 1em auto" },
            }
        );
        this.movesLabel = new Label(
            "movesLabel",
            new RectangleBounds(0, 30, Game.getWidth() - 25, 0),
            "",
            {
                label: { halign: "right", font: "normal 1em auto" },
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
                label: { halign: "center", font: "normal 1em auto" },
            }
        );
        this.parent = parent;
    }

    refreshUI() {
        if (!this.currentState) return;
        else if (this.currentState === GameState.GAME) {
            this.pointsLabel.show();
            this.movesLabel.show();
            this.pointsLabel.text = `Points: ${this.parent.points}`;
            this.movesLabel.text = `Moves: ${this.parent.moves}`;
            if (Game.input.pointerType === "touch") {
                this.dragLabel.show();
                this.dragLabel.label.text = this.parent.autoPlaceAfterDrag
                    ? "DragConfirm: false"
                    : "DragConfirm: true";
            } else {
                this.dragLabel.hide();
            }
        } else {
            this.pointsLabel.hide();
            this.movesLabel.hide();
        }
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
    async update() {
        this.refreshUI();
    }
}

export class GameSettings<T extends string> {
    static instance: GameSettings<any> | null = null;

    stateManager: UIManager<T> | null = null;
    points: number = 0;

    autoPlaceAfterDrag: boolean = true;

    get moves() {
        const osm = Game.instance?.manager.getStateManager<Playfield>(
            Playfield.DefaultID
        );
        if (!osm) return 0;
        return osm.map.moveCount;
    }

    get manager() {
        if (!this.stateManager)
            throw new Error("UI State manager not created yet!");
        return this.stateManager;
    }

    constructor() {
        GameSettings.instance = this;
    }

    private _gameOver = false;

    get isGameOver() {
        return this._gameOver;
    }

    gameOver() {
        this._gameOver = true;
    }

    gameRestarted() {
        this._gameOver = false;
        this.points = 0;
    }

    addPoints(pts: number) {
        this.points += pts;
    }
    createManager(manager: ObjectManager<T>) {
        this.stateManager = new UIManager(manager, this);
    }
}
