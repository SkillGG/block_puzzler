import { Vector_2, randomInt } from "@utils/utils";
import { PathBlock, Tile, TileColor, TileCoords } from "../Tile/tile";
import { Game } from "@/game";
import { Updateable } from "@component/interfaces";
import { LEFT_MOUSE_BUTTON } from "@component/KeyboardManager";
import { Playfield } from "../playfield";
import { LogI, LogE } from "@/console";
import { Astar, AstarPath, Grid } from "@utils/astar";
import { GameOptions } from "@/options";

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

    getNeighbours(coords: TileCoords, out: number): Tile[] {
        const neighbours: Tile[] = [];
        const offsets: [number, number][] = [
            [0, 1],
            [1, 0],
            [-1, 0],
            [0, -1],
        ];
        offsets.forEach((offset) => {
            const neighRow = coords.row + offset[1];
            const neighCol = coords.col + offset[0];
            if (
                neighCol < this.colNum - 1 &&
                neighRow < this.rowNum - 1 &&
                neighCol > 0 &&
                neighRow > 0
            )
                neighbours.push(this.getTile(neighCol, neighRow));
        });
        const getUnique = (arr: Tile[]) => {
            return arr.reduce<Tile[]>((p, n) => {
                if (n.coords.col === coords.col && n.coords.row === coords.row)
                    return p;
                return p.find((t) => t.id === n.id) ? p : [...p, n];
            }, []);
        };
        if (out === 0) {
            return neighbours;
        } else {
            return getUnique([
                ...neighbours,
                ...neighbours
                    .map((q) =>
                        this.getNeighbours(q.coords, out - 1).filter(
                            (x) => x !== q
                        )
                    )
                    .flat(1),
            ]);
        }
    }

    areNeighboursEmpty(t: TileCoords) {
        if (t.row > 0) {
            const tx = this.getTile(t.col, t.row - 1);
            if (tx && tx.color === TileColor.NONE) return true;
        }
        if (t.row < this.rowNum - 1) {
            const tx = this.getTile(t.col, t.row + 1);
            if (tx && tx.color === TileColor.NONE) return true;
        }
        if (t.col > 0) {
            const tx = this.getTile(t.col - 1, t.row);
            if (tx && tx.color === TileColor.NONE) return true;
        }
        if (t.col < this.colNum - 1) {
            const tx = this.getTile(t.col + 1, t.row);
            if (tx && tx.color === TileColor.NONE) return true;
        }
        return false;
    }

    areNeighbours(t: Tile, t2: Tile) {
        return (
            Math.abs(
                t.coords.col - t2.coords.col + t.coords.row - t2.coords.row
            ) === 1
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
            for (const coloredTile of this.tilesArr.filter((t) =>
                this.areNeighboursEmpty(t.coords)
            )) {
                // check if single swap will make it possible
                const origColor = coloredTile.color;
                const emptyTiles = [...this.emptyTiles].filter(
                    (t) =>
                        this.areNeighboursEmpty(t.coords) ||
                        this.areNeighbours(t, coloredTile)
                );
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

    hoveredTile: Tile | null = null;

    canMoveTo(t: TileCoords) {
        if (!this.selectedTile) return false;
        return this.canSwapTiles(this.selectedTile, t);
    }

    hoverPath: AstarPath | null = null;

    drawHoverPath() {
        const calculatePath = (): AstarPath | null => {
            if (
                this.selectedTile &&
                (!this.hoveredTile || this.hoveredTile.color !== TileColor.NONE)
            ) {
                return this.hoverPath;
            } else if (!this.selectedTile || !this.hoveredTile) {
                return null;
            } else {
                // calculate hover path
                return this.getAstarPath(
                    this.selectedTile,
                    this.hoveredTile.coords
                );
            }
        };

        const path = calculatePath();
        if (path === this.hoverPath) return; // nothing changed

        const drawPath = (path: AstarPath): AstarPath | null => {
            if (path.length === 0) {
                if (!this.hoveredTile) return path;
                this.hoveredTile.pathBlockValue = PathBlock.ERR;
                return [
                    [this.hoveredTile.coords.col, this.hoveredTile.coords.row],
                ];
            }
            const directionalPath = path.map<{
                coords: TileCoords;
                type: PathBlock;
            }>((n, i, a) => {
                const coords: TileCoords = { col: n[0], row: n[1] };
                if (i === 0)
                    return {
                        coords,
                        type: PathBlock.NONE,
                    };
                if (i === a.length - 1) return { coords, type: PathBlock.END };

                const prevCoords = a[i - 1];
                const nextCoords = a[i + 1];

                if (prevCoords[0] === nextCoords[0])
                    return { coords, type: PathBlock.VERTICAL };
                if (prevCoords[1] === nextCoords[1])
                    return { coords, type: PathBlock.HORIZONTAL };

                const offsets: [number, number][] = [
                    [prevCoords[0] - coords.col, prevCoords[1] - coords.row],
                    [nextCoords[0] - coords.col, nextCoords[1] - coords.row],
                ];

                let from: "L" | "R" | "T" | "B" = "T";

                if (offsets[0][0] === 0) {
                    // from TB
                    if (offsets[0][1] === -1) from = "T";
                    else from = "B";
                } else {
                    // from LR
                    if (offsets[0][0] === -1) from = "L";
                    else from = "R";
                }

                let to: typeof from = "T";

                if (offsets[1][0] === 0) {
                    if (offsets[1][1] === -1) to = "T";
                    else to = "B";
                } else {
                    if (offsets[1][0] === -1) to = "L";
                    else to = "R";
                }

                if (from + to === "LT" || to + from === "LT")
                    return { coords, type: PathBlock.LT };
                if (from + to === "LB" || to + from === "LB")
                    return { coords, type: PathBlock.LB };
                if (from + to === "RT" || to + from === "RT")
                    return { coords, type: PathBlock.RT };
                if (from + to === "RB" || to + from === "RB")
                    return { coords, type: PathBlock.RB };
                return { coords, type: PathBlock.ERR };
            });
            directionalPath.forEach((block) => {
                const tile = this.getTile(block.coords.col, block.coords.row);
                if (tile) tile.pathBlockValue = block.type;
            });
            return path;
        };

        const clearPath = () => {
            if (!this.hoverPath) return;
            this.hoverPath.forEach((coords) => {
                const tile = this.getTile(coords[0], coords[1]);
                if (tile) tile.pathBlockValue = PathBlock.NONE;
            });
        };

        if (path) {
            clearPath();
            this.hoverPath = drawPath(path);
        } else {
            clearPath();
            this.hoverPath = path;
        }
    }

    clearPath() {
        const sT = this.selectedTile;
        this.selectedTile = null;
        this.drawHoverPath();
        this.selectedTile = sT;
    }

    setHoveredTile() {
        const changeHovered = (t: Tile | null) => {
            this.hoveredTile = t;

            this.drawHoverPath();
        };

        if (this.hoveredTile) {
            if (Game.input.isPointerIn(this.hoveredTile.bounds)) return;

            const neighbours = this.getNeighbours(this.hoveredTile.coords, 1);

            for (let i = 0; i < neighbours.length; i++) {
                const neighbour = neighbours[i];
                if (Game.input.isPointerIn(neighbour.bounds)) {
                    changeHovered(neighbour);
                    return;
                }
            }

            const notNear = this.tilesArr.filter(
                (t) => !neighbours.find((q) => q === t)
            );
            for (let i = 0; i < notNear.length; i++) {
                if (Game.input.isPointerIn(notNear[i].bounds)) {
                    changeHovered(notNear[i]);
                    return;
                }
            }
        } else {
            const allTiles = this.tilesArr;
            for (let i = 0; i < allTiles.length; i++) {
                if (Game.input.isPointerIn(allTiles[i].bounds)) {
                    changeHovered(allTiles[i]);
                    return;
                }
            }
        }
        if (this.hoveredTile) changeHovered(null);
    }

    dragging = false;
    readonly DEFAULT_DRAG_TIMEOUT = 3;
    considerDrag: number = -this.DEFAULT_DRAG_TIMEOUT;

    confirmPlacement: TileCoords | null = null;

    update(time: number) {
        // const start = performance.now();

        const confirmMove = (tile1: TileCoords, tile2: TileCoords) => {
            if (this.canMoveTo(tile1)) {
                this.swapTiles(tile1, tile2);
                this.removeClusteredTiles();
                const endGame = this.checkEndGame();
                if (endGame) {
                    this.gameOver = true;
                    this.playfield.gameOver();
                } else if (this.emptyTiles.length === this.tilesArr.length) {
                    this.randomizeTileValues(Playfield.randomTileColor_EASY);
                }
            } else {
                LogE("Cannot move here!");
            }
        };

        if (!this.gameOver) {
            this.setHoveredTile();
            if (this.hoveredTile) {
                if (Game.input.hasMouseClicked(LEFT_MOUSE_BUTTON)) {
                    if (this.selectedTile) {
                        if (
                            this.hoveredTile.coords.row ===
                                this.selectedTile.row &&
                            this.hoveredTile.coords.col ===
                                this.selectedTile.col
                        ) {
                            this.deselectTile(this.hoveredTile);
                            this.clearPath();
                        } else if (this.hoveredTile.color === TileColor.NONE) {
                            confirmMove(
                                this.hoveredTile.coords,
                                this.selectedTile
                            );
                        } else {
                            this.deselectTile(this.getTile(this.selectedTile));
                            this.selectTile(this.hoveredTile);
                            this.clearPath();
                        }
                    } else {
                        if (this.hoveredTile.color !== TileColor.NONE)
                            this.selectTile(this.hoveredTile);
                    }
                } else {
                    if (Game.input.hasTouchClicked()) {
                        if (this.dragging && this.considerDrag > 0) {
                            if (this.selectedTile) {
                                // released drag
                                const osm = GameOptions.instance;
                                let autoPlace = false;
                                if (osm) {
                                    autoPlace = osm.autoPlaceAfterDrag;
                                }
                                if (autoPlace) {
                                    confirmMove(
                                        this.hoveredTile.coords,
                                        this.selectedTile
                                    );
                                } else {
                                    this.confirmPlacement =
                                        this.hoveredTile.coords;
                                }
                            }
                            this.considerDrag = -this.DEFAULT_DRAG_TIMEOUT;
                        } else {
                            // just clicked
                            if (this.selectedTile) {
                                if (this.hoveredTile.color !== TileColor.NONE) {
                                    // clicked on color
                                    this.deselectTile(
                                        this.getTile(this.selectedTile)
                                    );
                                    this.selectTile(this.hoveredTile);
                                    this.clearPath();
                                } else {
                                    // clicked on empty
                                    if (
                                        this.confirmPlacement &&
                                        this.getTile(this.confirmPlacement) ===
                                            this.hoveredTile
                                    ) {
                                        confirmMove(
                                            this.hoveredTile.coords,
                                            this.selectedTile
                                        );
                                    } else {
                                        this.confirmPlacement =
                                            this.hoveredTile.coords;
                                    }
                                }
                            } else {
                                if (this.hoveredTile.color !== TileColor.NONE) {
                                    this.selectTile(this.hoveredTile);
                                }
                            }
                        }
                        this.dragging = false;
                    } else if (Game.input.hasPressedTouch()) {
                        // started dragging
                        this.dragging = true;
                        if (this.hoveredTile.color !== TileColor.NONE) {
                            this.selectTile(this.hoveredTile);
                        }
                    } else if (this.dragging && Game.input.hasPointerMoved()) {
                        this.considerDrag++;
                    }
                }
            }
        }
        this.clogDelta += time;
        // const end = performance.now();
        // if (this.clogDelta % 1000 < 20)
        //     console.log("updateTime:", end - start, "ms");
    }
}
