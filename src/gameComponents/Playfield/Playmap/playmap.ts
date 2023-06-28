import { Vector2, Vector_2, randomInt } from "@utils/utils";
import { Tile, TileColor, TileCoords } from "../Tile/tile";
import { Game, LogE, LogI } from "@/game";
import { Updateable } from "@component/interfaces";
import { LEFT_MOUSE_BUTTON } from "@component/KeyboardManager";
import { Playfield } from "../playfield";

export class PlayMap implements Updateable {
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

    private playable: boolean = false;

    private numberOfMoves = 0;

    constructor(pos: Vector_2) {
        this.pos = pos;
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
                LogI("swapping colors for tile", t.id, "to ", randomColor);
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
            throw "Error getting tile";
        }
    }

    eachTile(fn: (t: Tile) => void) {
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
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

        LogI("Swapping tile", tile1.id, tile2.id);

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
        LogI("Selected tile", t.id, t.coords);
        t.markSelected();
    }

    clogDelta: number = 0;

    removeClusteredTiles() {
        this.eachTile((t) => {
            if (t.coords.row >= this.rowNum - 1) return;
            if (t.coords.col >= this.colNum - 1) return;
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
                t.color =
                    leftTile.color =
                    bottomTile.color =
                    diagonalTile.color =
                        TileColor.NONE;
                // add Points
            }
        });
    }

    update(time: number) {
        if (Game.input.hasMouseClicked(LEFT_MOUSE_BUTTON)) {
            let clickFinished = false;
            this.eachTile((t) => {
                if (clickFinished) return;
                if (Game.input.isMouseIn(t.bounds)) {
                    // clicked a tile
                    if (this.selectedTile) {
                        LogI("Clicked coords", t.coords, "To swap with", t.id);
                        this.swapTiles(t.coords, this.selectedTile);
                    } else {
                        if (t.color !== TileColor.NONE) this.selectTile(t);
                    }
                    clickFinished = true;
                }
            });
        }
        this.removeClusteredTiles();
        this.clogDelta += time;
    }
}
