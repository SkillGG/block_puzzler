import { StateManager } from "@components/StateManager";
import { ObjectManager } from "@components/ObjectManager";
import { GameState } from "./main";
import { Label } from "@components/Primitives/Label/Label";
import { RectangleBounds } from "@components/Primitives/Rectangle/RectangleBounds";
import { Game } from "./game";
import { Playfield } from "@components/Playfield/playfield";
import { Button } from "@components/Primitives/Button/Button";
import { Slider } from "@primitives/Slider/Slider";
import { mUI_Z } from "./utils/zLayers";
import { Hideable } from "@utils";
import { BoundedGameObject } from "@components/GameObject";
import { TileColor } from "@components/Playfield/Tile/tile";

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
    levelLabel: Label;
    levelSlider: Slider;
    parent: GameSettings<T>;

    constructor(
        manager: ObjectManager<T>,
        parent: GameSettings<T>,
        zIndex = mUI_Z
    ) {
        super(UIManager.DefaultID, manager, "any");
        this.pointsLabel = new Label(
            "pointsLabel",
            new RectangleBounds(0, 10, Game.getWidth() - 25, 0),
            "",
            {
                label: { halign: "right", font: "normal 1em auto" },
            },
            zIndex
        );
        this.movesLabel = new Label(
            "movesLabel",
            new RectangleBounds(0, 30, Game.getWidth() - 25, 0),
            "",
            {
                label: { halign: "right", font: "normal 1em auto" },
            },
            zIndex
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
            },
            zIndex
        );
        this.levelSlider = new Slider(
            "levelSlider",
            new RectangleBounds(Game.getWidth() - 300, 600, 250, 20),
            parent.pointsToFinishLevel,
            { borderWidth: 2 },
            zIndex
        );
        this.levelLabel = new Label(
            "levelLabel",
            new RectangleBounds(Game.getWidth() - 320, 603, 0, 0),
            "",
            {},
            zIndex
        );
        this.parent = parent;
    }

    forEach(f: (g: BoundedGameObject & Hideable) => void) {
        [
            this.pointsLabel,
            this.movesLabel,
            this.levelLabel,
            this.levelSlider,
            this.dragLabel,
        ].forEach((o) => f(o));
    }

    refreshUI() {
        if (!this.currentState) return;
        else if (this.currentState === GameState.GAME) {
            this.forEach((o) => o.show());
            this.pointsLabel.hide();
            this.pointsLabel.text = `Points: ${this.parent.allPoints}`;
            this.movesLabel.text = `Moves: ${this.parent.moves}`;
            this.levelSlider.max = this.parent.pointsToFinishLevel;
            this.levelLabel.text = `${this.parent.level}`;
            this.levelSlider.current = this.parent.currentPoints;
            if (Game.input.pointerType === "touch") {
                this.dragLabel.label.text = this.parent.autoPlaceAfterDrag
                    ? "DragConfirm: false"
                    : "DragConfirm: true";
            } else {
                this.dragLabel.hide();
            }
        } else {
            this.forEach((o) => o.hide());
        }
    }
    removeObjects(): void {
        if (!this.areRegistered) return;
        this.forEach((o) => this.removeObject(o));
        this.areRegistered = false;
    }
    registerObjects(): void {
        if (this.areRegistered) return;
        this.forEach((o) => this.registerObject(o));
        this.areRegistered = true;
    }
    async update() {
        this.refreshUI();
    }
}

export class GameSettings<T extends string> {
    static #instance: GameSettings<any> | null = null;

    static get instance() {
        if (!GameSettings.#instance)
            throw new Error("Game Settings not created yet!");

        return GameSettings.#instance as GameSettings<any>;
    }

    stateManager: UIManager<T> | null = null;
    #points: number = 0;
    level = 0;

    get prevLvlPoints() {
        return this.level === 0
            ? 0
            : this.getRequiredPointsForLevel(this.level - 1);
    }

    get allPoints() {
        return this.#points;
    }

    get currentPoints() {
        return this.#points - this.prevLvlPoints;
    }

    get pointsToFinishLevel() {
        return this.getRequiredPointsForLevel(this.level) - this.prevLvlPoints;
    }

    get tileColorsForLvl() {
        return Object.values(TileColor).filter(
            (c, i) =>
                i <= 3 + GameSettings.instance.level / 3 || c === TileColor.NONE
        );
    }

    getRequiredPointsForLevel(l: number): number {
        return l === 0 ? 6 : this.getRequiredPointsForLevel(l - 1) + l * 6;
    }

    autoPlaceAfterDrag: boolean = true;

    get moves() {
        const osm = Game.instance?.manager.getStateManager<Playfield>(
            Playfield.DefaultID
        );
        if (!osm) return 0;
        return osm.map.moveCount;
    }

    static get manager() {
        if (!GameSettings.#instance)
            throw new Error("UI Instance not created yet!");
        if (!GameSettings.#instance.stateManager)
            throw new Error("UI State manager not created yet!");
        return GameSettings.#instance.stateManager;
    }

    constructor() {
        GameSettings.#instance = this;
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
        this.#points = 0;
        this.level = 0;
    }

    addPoints(pts: number) {
        this.#points += pts;
        if (this.pointsToFinishLevel - this.currentPoints <= 0) {
            this.level++;
        }
    }
    createManager(manager: ObjectManager<T>) {
        this.stateManager = new UIManager(manager, this);
    }
}
