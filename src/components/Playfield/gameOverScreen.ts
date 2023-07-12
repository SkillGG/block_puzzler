import { Game } from "@/game";
import { GameState } from "@/main";
import { StateManager } from "@components/StateManager";
import { Playfield } from "./playfield";
import { Rectangle } from "@primitives/Rectangle/Rectangle";
import { RectangleBounds } from "@primitives/Rectangle/RectangleBounds";
import { Label, LabelWithBorderStyle } from "@primitives/Label/Label";
import { GameObject } from "@components/GameObject";
import { GameSettings } from "@/UI";
import { Button } from "@components/Primitives/Button/Button";
import { mGAMEOVER_Z } from "@/utils/zLayers";
import { Group } from "@primitives/Group/Group";

export class GameOverScreen extends StateManager<GameState> {
    static DefaultID = "gameOver";
    get defaultID(): string {
        return GameOverScreen.DefaultID;
    }

    objects: GameObject[] = [];

    pointsLabel: Label;
    movesLabel: Label;

    static statCount = 0;

    getStatLabels(statName: string, y: number, zIndex?: number): Group {
        const gameOverBoxBounds = new RectangleBounds(
            50,
            30,
            Game.WIDTH - 100,
            250
        );
        const labelStyle: LabelWithBorderStyle = {
            label: {
                halign: "left",
                font: "normal 1.3em auto",
                textColor: "white",
            },
        };
        return new Group(
            "gameover_" + statName,
            zIndex,
            new Label(
                `name`,
                new RectangleBounds(
                    gameOverBoxBounds.x + gameOverBoxBounds.width / 3,
                    gameOverBoxBounds.y + y,
                    gameOverBoxBounds.width / 3,
                    0
                ),
                `${statName}:`,
                {
                    ...labelStyle,
                    label: { ...labelStyle.label, halign: "left" },
                },
                zIndex
            ),
            new Label(
                `value`,
                new RectangleBounds(
                    gameOverBoxBounds.x + gameOverBoxBounds.width / 3,
                    gameOverBoxBounds.y + y,
                    gameOverBoxBounds.width / 3,
                    0
                ),
                `0`,
                {
                    ...labelStyle,
                    label: { ...labelStyle.label, halign: "right" },
                },
                zIndex
            )
        );
    }

    constructor(playfield: Playfield, zIndex = mGAMEOVER_Z) {
        super(GameOverScreen.DefaultID, playfield.manager, playfield.state);
        const gameOverBoxBounds = new RectangleBounds(
            100,
            100,
            Game.WIDTH - 200,
            450
        );
        const getCenteredLabelBoundsAtY = (y: number) =>
            new RectangleBounds(
                [gameOverBoxBounds.x + 30, gameOverBoxBounds.y + y],
                [gameOverBoxBounds.width - 60, 0]
            );

        const statLabels = [
            this.getStatLabels("Points", gameOverBoxBounds.x + 50, zIndex),
            this.getStatLabels("Moves", gameOverBoxBounds.x + 90, zIndex),
        ];
        this.pointsLabel = statLabels[0].getObject("value");
        this.movesLabel = statLabels[1].getObject("value");

        this.objects.push(
            new Rectangle(
                "gameOverWindow",
                gameOverBoxBounds,
                {
                    fillColor: "#444c",
                },
                5
            ),
            new Label(
                "gameOverTopLabel",
                getCenteredLabelBoundsAtY(20),
                "Game Over",
                {
                    label: {
                        font: "bold 2em sans-serif",
                        textColor: "red",
                    },
                },
                10
            ),
            ...statLabels,
            new Button(
                "restartButton",
                new RectangleBounds(
                    gameOverBoxBounds.x + gameOverBoxBounds.width / 2 - 50,
                    gameOverBoxBounds.y + 200,
                    100,
                    50
                ),
                {
                    onenter: (e) => {
                        e.target.label.border.style.fillColor = "green";
                    },
                    onleave: (e) => {
                        e.target.label.border.style.fillColor =
                            e.target.label.initStyle.border?.fillColor ||
                            "transparent";
                    },
                    onclick: () => {
                        const osm = this.manager.getStateManager<Playfield>(
                            Playfield.DefaultID
                        );
                        if (!osm) return;
                        const prevMapSize = osm.map.rowNum;
                        osm.removeObjects();
                        osm.restartGame(prevMapSize);
                        osm.registerObjects();
                    },
                },
                "Restart",
                {
                    label: {
                        font: "normal 1.5em auto",
                    },
                },
                10
            ),
            new Button(
                "backButton",
                new RectangleBounds(
                    gameOverBoxBounds.x + gameOverBoxBounds.width / 2 - 50,
                    gameOverBoxBounds.y + 260,
                    100,
                    50
                ),
                {
                    onenter: (e) => {
                        e.target.label.border.style.fillColor = "red";
                    },
                    onleave: (e) => {
                        e.target.label.border.style.fillColor =
                            e.target.label.initStyle.border?.fillColor ||
                            "transparent";
                    },
                    onclick: () => {
                        const osm = this.manager.getStateManager<Playfield>(
                            Playfield.DefaultID
                        );
                        this.manager.currentState = GameState.MENU;
                        if (!osm) return;
                        osm.removeObjects();
                        this.removeObjects();
                    },
                },
                "Menu",
                {
                    label: {
                        font: "normal 1.5em auto",
                    },
                },
                10
            )
        );
    }
    async update() {
        // handle clicks on GameOverScreen
        this.pointsLabel.text = `${GameSettings.instance.allPoints}`;
        this.movesLabel.text = `${GameSettings.instance.moves}`;
    }
    removeObjects(): void {
        for (const obj of this.objects) this.removeObject(obj);
    }
    registerObjects(): void {
        for (const obj of this.objects) this.registerObject(obj);
    }
}
