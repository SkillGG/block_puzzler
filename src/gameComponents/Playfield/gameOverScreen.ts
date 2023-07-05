import { Game } from "@/game";
import { GameState } from "@/main";
import { StateManager } from "@component/StateManager";
import { Playfield } from "./playfield";
import { Rectangle } from "@component/Primitives/Rectangle/Rectangle";
import { RectangleBounds } from "@component/Primitives/Rectangle/RectangleBounds";
import { Label, LabelWithBorderStyle } from "@component/Primitives/Label/Label";
import { GameObject } from "@component/GameObject";
import { GameOptions } from "@/options";
import { Button } from "@component/Primitives/Button/button";

export class GameOverScreen extends StateManager<GameState> {
    static DefaultID = "gameOver";
    get defaultID(): string {
        return GameOverScreen.DefaultID;
    }

    objects: GameObject[] = [];

    pointsLabel: Label;
    movesLabel: Label;

    static statCount = 0;

    getStatLabels(statName: string, i?: number): [Label, Label] {
        const gameOverBoxBounds = new RectangleBounds(
            50,
            30,
            Game.WIDTH - 100,
            250
        );
        if (!i) i = GameOverScreen.statCount++;
        const labelStyle: LabelWithBorderStyle = {
            label: {
                align: "left",
                font: "normal 1.3em auto",
                textColor: "white",
            },
        };
        return [
            new Label(
                `${statName}Name`,
                new RectangleBounds(
                    gameOverBoxBounds.x + gameOverBoxBounds.width / 3,
                    gameOverBoxBounds.y + 80 + 30 * i,
                    gameOverBoxBounds.width / 3,
                    0
                ),
                `${statName}:`,
                {
                    ...labelStyle,
                    label: { ...labelStyle.label, align: "left" },
                },
                10
            ),
            new Label(
                `${statName}Value`,
                new RectangleBounds(
                    gameOverBoxBounds.x + gameOverBoxBounds.width / 3,
                    gameOverBoxBounds.y + 80 + 30 * i,
                    gameOverBoxBounds.width / 3,
                    0
                ),
                `0`,
                {
                    ...labelStyle,
                    label: { ...labelStyle.label, align: "right" },
                },
                10
            ),
        ];
    }

    constructor(playfield: Playfield) {
        super(GameOverScreen.DefaultID, playfield.manager, playfield.state);
        const gameOverBoxBounds = new RectangleBounds(
            50,
            30,
            Game.WIDTH - 100,
            450
        );
        const getCenteredLabelBoundsAtY = (y: number) =>
            new RectangleBounds(
                [gameOverBoxBounds.x + 30, gameOverBoxBounds.y + y],
                [gameOverBoxBounds.width - 60, 0]
            );

        const statLabels = [
            this.getStatLabels("Points"),
            this.getStatLabels("Moves"),
        ];
        this.movesLabel = statLabels[1][1];
        this.pointsLabel = statLabels[0][1];

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
            ...statLabels.flat(1),
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
        const osm = GameOptions.instance;
        if (!osm) return;
        this.pointsLabel.text = `${osm.points}`;
        this.movesLabel.text = `${osm.moves}`;
    }
    removeObjects(): void {
        for (const obj of this.objects) this.removeObject(obj);
    }
    registerObjects(): void {
        for (const obj of this.objects) this.registerObject(obj);
    }
}
