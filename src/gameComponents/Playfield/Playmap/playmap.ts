import { Vector_2, randomInt } from "@utils/utils";
import { Tile, TileColor, TileCoords } from "../Tile/tile";
import { Game } from "@/game";
import { Updateable } from "@component/interfaces";
import { LEFT_MOUSE_BUTTON } from "@component/KeyboardManager";
import { Playfield } from "../playfield";
import { LogI, LogE } from "@/console";
import { Astar, AstarPath, Grid } from "@utils/astar";

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

        // center the map
        const rowWidth = this.tiles[0][0].bounds.width * cols;
        const newLeft = Game.getWidth() / 2 - rowWidth / 2;
        this.eachTile((t) => {
            t.moveBy([newLeft, 0]);
        });
        this.getRandomTile().setColor(Playfield.randomTileColor());
        this.randomizeTileValues(Playfield.randomTileColor_EASY);
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

    isThereClusteredTile() {
        const tiles = this.tiles;
        for (let i = 0; i < tiles.length; i++) {
            const row = tiles[i];
            for (let j = 0; j < row.length; j++) {
                const tile = row[j];
                if (tile.color === TileColor.NONE) continue;
                if (tile.coords.row >= this.rowNum - 1) continue;
                if (tile.coords.col >= this.colNum - 1) continue;
                const leftTile = row[j + 1];
                if (leftTile.color !== tile.color) continue;
                const bottomTile = tiles[i + 1][j];
                if (bottomTile.color !== tile.color) continue;
                const diagonalTile = tiles[i + 1][j + 1];
                if (diagonalTile.color !== tile.color) continue;
                return true;
            }
        }

        return false;
    }

    getClusteredTiles() {
        const clusters: Tile[][] = [];
        const tiles = this.tiles;
        for (let i = 0; i < tiles.length; i++) {
            const row = tiles[i];
            for (let j = 0; j < row.length; j++) {
                const tile = row[j];
                // console.log(tile.color === TileColor.NONE);
                if (tile.color === TileColor.NONE) continue;
                if (tile.coords.row >= this.rowNum - 1) continue;
                if (tile.coords.col >= this.colNum - 1) continue;
                if (clusters.find((c) => c.find((x) => x === tile))) continue;
                const leftTile = row[j + 1];
                if (leftTile.color !== tile.color) continue;
                const bottomTile = tiles[i + 1][j];
                if (bottomTile.color !== tile.color) continue;
                const diagonalTile = tiles[i + 1][j + 1];
                if (diagonalTile.color !== tile.color) continue;
                // remove colors
                clusters.push([tile, leftTile, bottomTile, diagonalTile]);
            }
        }
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

    canSwapTiles(t1: TileCoords, t2: TileCoords) {
        return !!this.getAstarPath(t1, t2)?.length;
    }

    checkEndGame() {
        const emTiles = this.emptyTiles;
        const start = performance.now();
        if (emTiles.length === 0) return true;
        const canDestroyIfTilesChange = (tilesToCheck: Tile[], depth = 0) => {
            const firstTile = tilesToCheck[0];
            const restTiles = tilesToCheck.splice(1);

            for (const color of Object.values(TileColor).filter(
                (tc) => tc !== TileColor.NONE
            )) {
                firstTile.color = color;
                if (this.isThereClusteredTile()) {
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
            console.log("Checking swaps");
            for (const coloredTile of this.tilesArr.filter(
                (t) => t.color !== TileColor.NONE
            )) {
                // check if single swap will make it possible
                const origColor = coloredTile.color;
                const emptyTiles = [...this.emptyTiles];
                for (const emptyTile of emptyTiles) {
                    if (
                        !this.canSwapTiles(emptyTile.coords, coloredTile.coords)
                    )
                        continue;
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
        const x = !(
            canDestroyIfTilesChange(emTiles) || canDestroyTilesIfSwapped()
        );
        const end = performance.now();
        console.log("EndGameCheck:", end - start, "ms");
        return x;
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

    getAstarPath(t1: TileCoords, t2: TileCoords): AstarPath | null {
        const grid = new Grid(10, 10);
        const astar = new Astar(grid);
        this.eachTile(
            (t) => {
                grid.occupyNode(t.coords.col, t.coords.row);
            },
            (t) => t.color !== TileColor.NONE
        );
        return astar.search(t1.col, t1.row, t2.col, t2.row);
    }

    canMoveTo(t: TileCoords) {
        if (!this.selectedTile) return false;
        return this.canSwapTiles(this.selectedTile, t);
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
                                if (this.canMoveTo(t.coords)) {
                                    this.swapTiles(t.coords, this.selectedTile);
                                    this.removeClusteredTiles();
                                    const endGame = this.checkEndGame();
                                    if (endGame) {
                                        this.gameOver = true;
                                        this.playfield.gameOver();
                                    } else if (
                                        this.emptyTiles.length ===
                                        this.tilesArr.length
                                    ) {
                                        this.randomizeTileValues(
                                            Playfield.randomTileColor_EASY
                                        );
                                    }
                                } else {
                                    LogE("Cannot move here!");
                                }
                            } else {
                                this.deselectTile(
                                    this.getTile(this.selectedTile)
                                );
                                this.selectTile(t);
                            }
                        } else {
                            if (t.color !== TileColor.NONE) this.selectTile(t);
                        }
                        clickFinished = true;
                    }
                });
            }
        }
        this.clogDelta += time;
    }
}
