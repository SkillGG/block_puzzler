import { Vector_2, randomInt } from "@utils/utils";
import { Tile, TileColor, TileCoords } from "../Tile/tile";
import { Game } from "@/game";
import { Updateable } from "@component/interfaces";
import { LEFT_MOUSE_BUTTON } from "@component/KeyboardManager";
import { Playfield } from "../playfield";
import { LogI, LogE } from "@/console";

export class PlayMap implements Updateable {
    gameOver = false;

    private pos: Vector_2;

    private _tiles: Tile[][] = [];

    private get tiles() {
        const tileRows = new Map<number, Map<number, Tile>>();

        for (let row = 0; row < this._tiles.length; row++) {
            const tileRow = this._tiles[row];
            for (let col = 0; col < tileRow.length; col++) {
                const tile = tileRow[col];
                if (tileRows.has(tile.coords.row)) {
                    tileRows.get(tile.coords.row)!.set(tile.coords.col, tile);
                } else {
                    tileRows.set(
                        tile.coords.row,
                        new Map([[tile.coords.col, tile]])
                    );
                }
            }
        }
        return [...tileRows]
            .sort((a, b) => a[0] - b[0])
            .map((row) =>
                [...row[1]].sort((a, b) => a[0] - b[0]).map((col) => col[1])
            );
    }

    get rowNum() {
        return this._tiles.length;
    }

    get colNum() {
        return this._tiles[0].length;
    }

    private get emptyTiles() {
        return this._tiles.flat(1).filter((t) => t.color === TileColor.NONE);
    }

    private get tilesArr() {
        return this._tiles.flat(1);
    }

    private playable: boolean = false;

    private numberOfMoves = 0;

    get moveCount() {
        return this.numberOfMoves;
    }

    private playfield: Playfield;

    constructor(pos: Vector_2, playfield: Playfield) {
        this.pos = pos;
        this.playfield = playfield;
    }

    createAMap(cols: number, rows: number) {
        for (let row = 0; row < rows; row++) {
            const tileRow: Tile[] = [];
            for (let col = 0; col < cols; col++) {
                tileRow.push(
                    new Tile(
                        `tile${col + cols * row}`,
                        this.pos,
                        [row, col],
                        [50, 50]
                    )
                );
            }
            this._tiles.push(tileRow);
        }

        const colorTiles = randomInt(3, 5);
        for (let i = 0; i < colorTiles; i++) {
            this.getRandomTile().setColor(Playfield.randomTileColor());
        }

        // center the map
        const rowWidth = this.tiles[0][0].bounds.width * cols;
        const newLeft = Game.getWidth() / 2 - rowWidth / 2;
        this.eachTile((t) => {
            t.moveBy([newLeft, 0]);
        });
        this.playable = true;
    }

    start() {
        this.numberOfMoves = 0;
        this.gameOver = false;
    }

    destroy() {
        this._tiles = [];
        this.playable = false;
    }

    getRandomTile() {
        const tiles = this.tiles.flat(1);
        return tiles[randomInt(0, tiles.length - 1)];
    }

    getRandomTileWhich(pred: (t: Tile) => boolean) {
        const predTiles = this.tiles.flat(1).filter(pred);
        return predTiles[randomInt(0, predTiles.length - 1)];
    }

    randomizeTileValues(
        getRandomColor: (
            t: Tile,
            n: number,
            a: Tile[][],
            moveNum: number
        ) => TileColor
    ) {
        LogI("Randomizing colors!");
        let coloredTiles = 0;
        this.eachTile((t) => {
            const randomColor = getRandomColor(
                t,
                coloredTiles,
                this.tiles,
                this.numberOfMoves
            );
            if (randomColor !== TileColor.NONE && t.color !== randomColor) {
                // LogI("swapping colors for tile", t.id, "to ", randomColor);
                t.setColor(randomColor);
                coloredTiles++;
            }
        });
    }

    getTiles() {
        return this.tiles;
    }

    getTile(col: number, row: number): Tile;
    getTile(coord: TileCoords): Tile;
    getTile(colOrCoords: number | TileCoords, possiblyRow?: number) {
        if (!this.playable) throw "Map not constructed yet!";
        let col: number | undefined, row: number | undefined;
        if (typeof colOrCoords === "object") {
            col = colOrCoords.col;
            row = colOrCoords.row;
        } else {
            col = colOrCoords;
            row = possiblyRow;
        }
        if (
            typeof col === "number" &&
            col < this.tiles.length &&
            typeof row === "number" &&
            row < this.tiles[col].length
        ) {
            return this.tiles[row][col];
        } else {
            if (typeof col !== "number" || typeof row !== "number") {
                LogE("Incorrect parameters!");
            } else if (col >= this.tiles.length || row > this.tiles.length) {
                LogE("Coords out of bounds", col, row);
            }
            console.log(
                this.tiles,
                row,
                col,
                col < this.tiles.length,
                (row || 0) < this.tiles[col].length
            );
            throw "Error getting tile " + col + "/" + row;
        }
    }

    eachTile(fn: (t: Tile) => void, predicate?: (t: Tile) => boolean) {
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (!predicate || predicate(this.tiles[i][j]))
                    fn(this.tiles[i][j]);
            }
        }
    }

    selectedTile: TileCoords | null = null;

    swapTiles(t1: TileCoords, t2: TileCoords) {
        const tile1 = this.getTile(t1);
        const tile2 = this.getTile(t2);
        if (!tile1) throw `Tile not found ${t1}`;
        if (!tile2) throw `Tile not found ${t2}`;

        tile1.moveToTile(t2);
        tile2.moveToTile(t1);
        tile1.unmarkSelected();
        tile2.unmarkSelected();

        this.selectedTile = null;

        this.getRandomTileWhich((t) => t.color === TileColor.NONE)?.setColor(
            Playfield.randomTileColor()
        );
        this.randomizeTileValues(Playfield.randomTileColor_EASY);
        this.numberOfMoves++;
    }

    selectTile(t: Tile) {
        this.selectedTile = t.coords;
        // LogI("Selected tile", t.id, t.coords);
        t.markSelected();
    }

    deselectTile(t: Tile) {
        this.selectedTile = null;
        // LogI("Deselected tile", t.id, t.coords);
        t.unmarkSelected();
    }

    clogDelta: number = 0;

    getClusteredTiles() {
        const clusters: Tile[][] = [];
        this.eachTile(
            (t) => {
                if (t.coords.row >= this.rowNum - 1) return;
                if (t.coords.col >= this.colNum - 1) return;
                if (clusters.find((f) => f.find((tx) => tx === t))) return;
                const leftTile = this.getTile(t.coords.col + 1, t.coords.row);
                const bottomTile = this.getTile(t.coords.col, t.coords.row + 1);
                const diagonalTile = this.getTile(
                    t.coords.col + 1,
                    t.coords.row + 1
                );
                if (
                    leftTile.color === t.color &&
                    bottomTile.color === t.color &&
                    diagonalTile.color === t.color
                ) {
                    // remove colors
                    clusters.push([t, leftTile, bottomTile, diagonalTile]);
                }
            },
            (t) => t.color !== TileColor.NONE
        );
        return clusters;
    }

    consolelogTiles(map?: (t: Tile) => any) {
        console.log(
            this.tiles
                .flat(1)
                .map(map ? map : (t) => t)
                .reduce((p, n, i) => {
                    if ((i + 1) % this.colNum === 0) {
                        return `${p} ${n}\n`;
                    } else return `${p} ${n}`;
                }, "")
        );
    }

    checkEndGame() {
        const emTiles = this.emptyTiles;
        if (emTiles.length === 0) return true;
        const canDestroyIfTilesChange = (tilesToCheck: Tile[], depth = 0) => {
            const firstTile = tilesToCheck[0];
            const restTiles = tilesToCheck.splice(1);

            for (const color of Object.values(TileColor).filter(
                (tc) => tc !== TileColor.NONE
            )) {
                firstTile.color = color;
                if (this.getClusteredTiles().length > 0) {
                    firstTile.color = TileColor.NONE;
                    return true;
                } else if (restTiles.length > 0) {
                    if (canDestroyIfTilesChange(restTiles, ++depth)) {
                        firstTile.color = TileColor.NONE;
                        return true;
                    }
                }
            }

            firstTile.color = TileColor.NONE;

            return false;
        };
        const canDestroyTilesIfSwapped = () => {
            for (const coloredTile of this.tilesArr.filter(
                (t) => t.color !== TileColor.NONE
            )) {
                // check if single swap will make it possible
                const origColor = coloredTile.color;
                const emptyTiles = [...this.emptyTiles];
                for (const emptyTile of emptyTiles) {
                    emptyTile.color = origColor;
                    coloredTile.color = TileColor.NONE;
                    const destroyable = canDestroyIfTilesChange(
                        this.emptyTiles
                    );
                    // cleanup
                    coloredTile.color = origColor;
                    emptyTile.color = TileColor.NONE;
                    if (destroyable) return true;
                }
            }
            return false;
        };
        return !(
            canDestroyIfTilesChange(emTiles) || canDestroyTilesIfSwapped()
        );
    }

    removeClusteredTiles() {
        const clusters = this.getClusteredTiles();
        if (clusters.length <= 0) return;
        console.log("Removing cluster!", clusters);
        clusters.forEach((c) => {
            c.forEach((t) => (t.color = TileColor.NONE));
            this.playfield.addPoints(4);
        });
    }

    update(time: number) {
        if (Game.input.hasMouseClicked(LEFT_MOUSE_BUTTON)) {
            if (!this.gameOver) {
                let clickFinished = false;
                this.eachTile((t) => {
                    if (clickFinished) return;
                    if (Game.input.isMouseIn(t.bounds)) {
                        // clicked a tile
                        if (this.selectedTile) {
                            if (
                                t.coords.row === this.selectedTile.row &&
                                t.coords.col === this.selectedTile.col
                            ) {
                                this.deselectTile(t);
                            } else if (t.color === TileColor.NONE) {
                                this.swapTiles(t.coords, this.selectedTile);
                            }
                        } else {
                            if (t.color !== TileColor.NONE) this.selectTile(t);
                        }
                        clickFinished = true;
                    }
                });
                this.removeClusteredTiles();
                const endGame = this.checkEndGame();
                if (endGame) {
                    this.gameOver = true;
                    this.playfield.gameOver();
                } else if (this.emptyTiles.length === this.tilesArr.length) {
                    this.randomizeTileValues(Playfield.randomTileColor_EASY);
                }
            }
        }
        this.clogDelta += time;
    }
}
