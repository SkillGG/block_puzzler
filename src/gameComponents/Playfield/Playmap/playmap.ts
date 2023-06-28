import { Vector2, Vector_2, randomInt } from "@utils/utils";
import { Tile, TileColor, TileCoords } from "../Tile/tile";
import { Game, LogE, LogI } from "@/game";
import { Updateable } from "@component/interfaces";
import { LEFT_MOUSE_BUTTON } from "@component/KeyboardManager";

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

    private playable: boolean = false;

    constructor(pos: Vector_2) {
        this.pos = pos;
    }

    createAMap(cols: number, rows: number) {
        for (let row = 0; row < rows; row++) {
            const tileRow: Tile[] = [];
            for (let col = 0; col < cols; col++) {
                tileRow.push(
                    new Tile(`tile${col + cols * row}`, this.pos, [row, col])
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
        this.playable = true;
    }

    randomizeTileValues(getRandomColor: (t: Tile, n: number) => TileColor) {
        LogI("Randomizing colors!");
        let coloredTiles = 0;
        this.eachTile((t) => {
            const randomColor = getRandomColor(t, coloredTiles);
            if (randomColor !== TileColor.NONE && t.color !== randomColor) {
                LogI("swapping colors for tile", t.id, "to ", randomColor);
                t.color = randomColor;
                coloredTiles++;
            }
        });
    }

    getTiles() {
        return this.tiles;
    }

    getTile(col: number, row: number): Tile | null;
    getTile(coord: TileCoords): Tile | null;
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
            console.log(this.tiles);
            return this.tiles[row][col];
        } else {
            LogE("Tile not found", col, row);
            return null;
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

        this.randomizeTileValues((t, n) => {
            if (t.color !== TileColor.NONE) return t.color;
            if (n >= 5) return TileColor.NONE;
            const tilesToGo = this.tiles
                .flat(1)
                .filter((t) => t.color === TileColor.NONE).length;

            const probabilityOfchangingColor = Math.min(
                30 - Math.min(25, tilesToGo),
                30
            );

            const rand = randomInt(0, 100);

            if (rand > 1 && rand < 1 + probabilityOfchangingColor)
                return TileColor.BLUE;
            if (rand > 31 && rand < 31 + probabilityOfchangingColor)
                return TileColor.RED;
            if (rand > 61 && rand < 61 + probabilityOfchangingColor)
                return TileColor.YELLOW;
            return TileColor.NONE;
        });
    }

    selectTile(t: Tile) {
        this.selectedTile = t.coords;
        LogI("Selected tile", t.id, t.coords);
        t.markSelected();
    }

    update() {
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
                        this.selectTile(t);
                    }
                    clickFinished = true;
                }
            });
        }
    }
}
