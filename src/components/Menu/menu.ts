import { Game } from "@/game";
import { GameState } from "@/main";
import { ObjectManager } from "@components/ObjectManager";
import { Button, ButtonClickEvent } from "@components/Primitives/Button/Button";
import { Label, LabelWithBorderStyle } from "@primitives/Label/Label";
import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
import { StateManager } from "@components/StateManager";
import { Playfield } from "@components/Playfield/playfield";
import { LogI } from "@/console";
import { mMENU_Z } from "@/utils/zLayers";

export class GameMenu extends StateManager<GameState> {
    menuLabel: Label;
    startButton: Button;
    static DefaultID = "menu";

    mapSize = 10;

    get defaultID() {
        return GameMenu.DefaultID;
    }
    constructor(manager: ObjectManager<GameState>, zIndex = mMENU_Z) {
        super(GameMenu.DefaultID, manager, GameState.MENU);

        const buttonStyle: LabelWithBorderStyle = {
            label: {
                font: "normal 1.5em auto",
            },
        };
        const labelStyle: LabelWithBorderStyle = {
            label: {
                font: "25px Arial bold",
            },
            border: {
                strokeColor: "transparent",
            },
        };

        this.menuLabel = new Label(
            "menu_label",
            new RectangleBounds(0, 0, Game.WIDTH, 100),
            "BlockPuzzler",
            labelStyle,
            zIndex
        );

        this.startButton = new Button(
            "start_button",
            new RectangleBounds(
                Game.getWidth() / 2 - 50,
                Game.getHeight() / 2 - 225,
                100,
                50
            ),
            {
                onclick: (e) => this.onClickStart(e),
                onenter: (e) => {
                    e.target.label.border.style.fillColor = "blue";
                },
                onleave: (e) => {
                    e.target.label.border.style.fillColor = "transparent";
                },
            },
            "START  ",
            buttonStyle,
            zIndex
        );
    }
    onClickStart(_ev: ButtonClickEvent) {
        this.manager.currentState = GameState.GAME;
        LogI("Starting the game");
        const playfield = this.manager.getStateManager<Playfield>(
            Playfield.DefaultID
        );
        if (!playfield) return;
        playfield.startGame(this.mapSize);
        playfield.registerObjects();
    }
    removeObjects(): void {
        this.removeObject(this.menuLabel, this.startButton);
    }
    registerObjects(): void {
        this.registerObject(this.menuLabel, this.startButton);
    }
    async update() {}
}
