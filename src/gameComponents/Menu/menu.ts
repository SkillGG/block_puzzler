import { Game } from "@/game";
import { GameState } from "@/main";
import { ObjectManager } from "@component/ObjectManager";
import { Button, ButtonClickEvent } from "@primitive/Button/button";
import { Label, LabelWithBorderStyle } from "@primitive/Label/Label";
import { RectangleBounds } from "@primitive/Rectangle/RectangleBounds";
import { StateManager } from "@component/StateManager";
import { Playfield } from "@component/Playfield/playfield";
import { LogI } from "@/console";

export class GameMenu extends StateManager<GameState> {
    menuLabel: Label;
    startButton: Button;
    static DefaultID = "menu";
    get defaultID() {
        return GameMenu.DefaultID;
    }
    constructor(manager: ObjectManager<GameState>) {
        super(GameMenu.DefaultID, manager, GameState.MENU);

        const buttonStyle: LabelWithBorderStyle = {
            label: {
                font: "15px Arial bold",
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
            labelStyle
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
            "START",
            buttonStyle
        );
    }
    onClickStart(_ev: ButtonClickEvent) {
        this.manager.currentState = GameState.GAME;
        LogI("Starting the game");
        const playfield = this.manager.getStateManager<Playfield>(
            Playfield.DefaultID
        );
        if (!playfield) return;
        playfield.startGame();
        playfield.registerObjects();
    }
    removeObjects(): void {
        this.removeObject(this.menuLabel, this.startButton);
    }
    registerObjects(): void {
        this.registerObject(this.menuLabel, this.startButton);
    }
    update() {}
}
