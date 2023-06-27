import { DevConsole, LogType } from "@/console";
import { Game } from "@/game";
import { GameState } from "@/main";
import { GameObject, GameObjectManager } from "@component/GameObject";
import { ObjectManager } from "@component/ObjectManager";
import { Button, ButtonClickEvent } from "@primitive/Button/button";
import { Label, LabelWithBorderStyle } from "@primitive/Label/Label";
import { RectangleBounds } from "@primitive/Rectangle/RectangleBounds";

export class GameMenu extends GameObjectManager<GameState> {
    menuLabel: Label;
    startButton: Button;
    tryLog: Button;
    tryAddingOption: Button;
    constructor(manager: ObjectManager<GameState>) {
        super("menu", manager, GameState.MENU);

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
                Game.getHeigth() / 2 - 225,
                100,
                50
            ),
            {
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
        this.tryLog = new Button(
            "log_button",
            new RectangleBounds(
                Game.getWidth() / 2 - 50,
                Game.getHeigth() / 2 - 225 + 75,
                100,
                50
            ),
            {
                onclick: this.onClickStart,
            },
            "LOG",
            buttonStyle
        );
        this.tryAddingOption = new Button(
            "option_button",
            new RectangleBounds(
                Game.getWidth() / 2 - 50,
                Game.getHeigth() / 2 - 225 + 75 + 75,
                100,
                50
            ),
            {},
            "ADD OPTION",
            buttonStyle
        );
        this.registerObject<GameObject>(
            this.menuLabel,
            this.startButton,
            this.tryAddingOption,
            this.tryLog
        );
    }
    onClickStart(ev: ButtonClickEvent) {
        DevConsole.newLog({ message: "log", type: LogType.INFO });
    }
}
