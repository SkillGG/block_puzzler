type NodeKey = `${number},${number}`;
type NodeCoords = [number, number];

const keyToArray = (str: NodeKey) =>
    str.split(",").map(Number) as [number, number];

const keyFromArray = (crd: NodeCoords): NodeKey => `${crd[0]},${crd[1]}`;

class Node {
    x: number;
    y: number;
    g: number;
    f: number;
    key: NodeKey;
    type?: string;
    parent?: NodeCoords;
    h: number = 999_999;
    private occupied: boolean = false;

    isOccupied() {
        return this.occupied;
    }

    isEmpty() {
        return !this.occupied;
    }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.g = 0;
        this.f = 0;
        this.key = keyFromArray([x, y]);
    }
    emptyNode() {
        this.occupied = false;
    }
    occupyNode() {
        this.occupied = true;
    }
}

export class Grid {
    nodes: Node[][];
    cols: number;
    rows: number;
    constructor(cols: number, rows: number) {
        this.cols = cols;
        this.rows = rows;

        this.nodes = [];

        for (let i = 0; i < rows; i++) {
            const row: Node[] = [];
            for (let j = 0; j < cols; j++) {
                row.push(new Node(i, j));
            }
            this.nodes.push(row);
        }
    }
    getNode(x: number, y: number) {
        return this.nodes[x]?.[y];
    }
    occupyNode(x: number, y: number) {
        if (this.nodes[x]?.[y]) this.nodes[x][y].occupyNode();
    }
    emptyNode(x: number, y: number) {
        if (this.nodes[x]?.[y]) this.nodes[x][y].emptyNode();
    }
}

interface AstarOptions {
    optimizeResult: boolean;
}

export type AstarPath = NodeCoords[];

export class Astar {
    grid: Grid;
    openList: Map<NodeKey, null>;
    closeList: Map<NodeKey, null>;
    constructor(grid: Grid) {
        this.grid = grid;
        this.openList = new Map();
        this.closeList = new Map();
    }

    startCoords?: NodeCoords;
    endCoords?: NodeCoords;

    searchOptions: AstarOptions = {
        optimizeResult: true,
    };

    search(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        options: AstarOptions = {
            optimizeResult: true,
        }
    ) {
        this.searchOptions = options;

        const startCoords: NodeCoords = [startX, startY];
        const endCoords: NodeCoords = [endX, endY];

        this.startCoords = startCoords;
        this.endCoords = endCoords;

        this.grid.emptyNode(startX, startY);
        this.grid.emptyNode(endX, endY);

        let result: AstarPath = [];

        let canContinue = true;

        const searchFn = (coords: NodeCoords) => {
            // console.log("testing", coords);
            if (
                this.grid.getNode(coords[0], coords[1]) ===
                this.grid.getNode(endX, endY)
            ) {
                canContinue = false;
                result = this.reconstructPath(coords);
            } else {
                const neighbours = this.getNeighbours(coords);

                neighbours.forEach((neighbour) => {
                    const neighbourKey = keyFromArray(neighbour);
                    const neighbourNode = this.grid.getNode(
                        neighbour[0],
                        neighbour[1]
                    );
                    const fromOpen = this.openList.get(neighbourKey);
                    if (fromOpen !== null) {
                        this.openList.set(neighbourKey, null);
                        neighbourNode.parent = coords;
                        const newG = this.g(neighbour, coords);
                        const newH = this.h(neighbour, endCoords);
                        neighbourNode.g = newG;
                        neighbourNode.h = newH;
                        neighbourNode.f = newG + newH;
                    } else {
                        const oldG = neighbourNode.g;
                        const newG = this.g(neighbour, coords);
                        if (newG < oldG) {
                            neighbourNode.parent = coords;
                            neighbourNode.g = newG;
                            neighbourNode.f = this.f(neighbour);
                        }
                    }
                });
                const nodeKey = keyFromArray(coords);
                // console.log(this.openList);
                this.openList.delete(nodeKey);
                this.closeList.set(nodeKey, null);
            }
        };
        searchFn([startX, startY]);

        while (canContinue) {
            let minItem = this.getMinimumFromOpenNodes();
            if (minItem) {
                searchFn(keyToArray(minItem.key));
            } else {
                canContinue = false;
            }
        }
        return result;
    }

    reconstructPath(coords: NodeCoords) {
        let backCoords: NodeCoords = coords;
        let result: AstarPath = [coords];
        let isLoop = true;
        while (isLoop) {
            const node = this.grid.getNode(backCoords[0], backCoords[1]);
            if (node.parent) {
                result.unshift(node.parent);
                backCoords = node.parent;
            } else {
                isLoop = false;
            }
        }
        return result;
    }

    getMinimumFromOpenNodes() {
        // console.log("Geting minF");
        let data: Node | null = null;
        // console.log([...this.openList]);
        for (const [key] of [...this.openList]) {
            const coords = keyToArray(key);
            const node = this.grid.getNode(coords[0], coords[1]);
            if (!data || node.f < data.f) {
                data = node;
            }
        }
        // console.log("min", data);
        return data;
    }

    getNeighbours(coords: NodeCoords) {
        let result: NodeCoords[] = [];

        const offsets: NodeCoords[] = [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0],
        ];

        offsets.forEach((offset) => {
            const newXY: NodeCoords = [
                coords[0] + offset[0],
                coords[1] + offset[1],
            ];
            const newKey: NodeKey = `${newXY[0]},${newXY[1]}`;
            const isNotClose = this.closeList.get(newKey) !== null;

            if (
                newXY[0] > -1 &&
                newXY[0] < this.grid.cols &&
                newXY[1] > -1 &&
                newXY[1] < this.grid.rows &&
                isNotClose &&
                this.grid.getNode(newXY[0], newXY[1]).isEmpty()
            ) {
                result.push(newXY);
            }
        });
        return result;
    }

    f(coords: NodeCoords) {
        const node = this.grid.getNode(coords[0], coords[1]);
        return node.g + (node.h || 0);
    }

    g(coords: NodeCoords, parentCoords: NodeCoords) {
        return this.searchOptions.optimizeResult
            ? (parentCoords[0] === coords[0] || parentCoords[1] === coords[1]
                  ? 10
                  : 14) + this.grid.getNode(parentCoords[0], parentCoords[1]).g
            : 0;
    }

    h(start: NodeCoords, end: NodeCoords) {
        return (Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1])) * 10;
    }
}
