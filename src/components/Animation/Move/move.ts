import { PathBlock, Tile } from "@components/Playfield/Tile/tile";
import { GameAnimation } from "@components/Animation/animation";
import { AnimatableTile } from "@components/Animation/objects/animatedTile";
import { Vector2 } from "@utils";
import { aMOVE_Z } from "@/utils/zLayers";

export namespace MovingAnimation {
    export const ID = "moving";

    class PathLine {
        readonly start;
        readonly end;
        readonly distance;
        private readonly direction: number;
        private readonly isHoriz: boolean;
        constructor(start: Vector2, end: Vector2) {
            this.start = start;
            this.end = end;
            this.isHoriz = start[1] === end[1];
            this.direction = this.isHoriz
                ? Math.sign(end[0] - start[0])
                : Math.sign(end[1] - start[1]);
            this.distance = this.isHoriz
                ? Math.abs(end[0] - start[0])
                : Math.abs(end[1] - start[1]);
        }
        getDistancedPos(d: number): Vector2 {
            if (this.isHoriz) {
                return [this.start[0] + -d * this.direction, this.end[1]];
            }
            return [this.end[0], this.start[1] + -d * this.direction];
        }
    }

    export class animation extends GameAnimation<AnimatableTile[]> {
        pathLines: PathLine[] = [];

        traveled = 0;

        blendT = 0;
        totalDistance: number = 0;

        constructor(
            id: string,
            start: () => void,
            end: (id: string) => void,
            path: Tile[]
        ) {
            super(id, end);
            this.frame = 0;
            this.objects = path.map((q) => {
                return new AnimatableTile(
                    id + "_tile_" + q.id,
                    q,
                    undefined,
                    aMOVE_Z
                );
            });
            this.pathLines = [];
            this.calcPathLines(path);
            this.totalDistance = this.pathDistance(
                path[0].bounds.getPosition()
            );
            this.objects = [this.objects[0]];
            start();
        }
        async render() {}

        calcPathLines(tiles: Tile[]) {
            const lines: Vector2[][] = [];
            tiles.forEach((t, i) => {
                const pos = t.bounds.getPosition();
                if (i === 0) lines.push([pos]);
                else if (
                    t.pathBlockValue === PathBlock.HORIZONTAL ||
                    t.pathBlockValue === PathBlock.VERTICAL
                ) {
                    if (lines[lines.length - 1].length === 2)
                        lines[lines.length - 1].pop();
                    lines[lines.length - 1].push(pos);
                } else if (
                    t.pathBlockValue === PathBlock.LB ||
                    t.pathBlockValue === PathBlock.LT ||
                    t.pathBlockValue === PathBlock.RB ||
                    t.pathBlockValue === PathBlock.RT
                ) {
                    if (lines[lines.length - 1].length === 2)
                        lines[lines.length - 1].pop();
                    lines[lines.length - 1].push(pos);
                    lines.push([pos]);
                } else {
                    if (lines[lines.length - 1].length >= 2)
                        lines[lines.length - 1].pop();
                    lines[lines.length - 1].push(pos);
                }
            });
            this.pathLines = lines.map((v) => {
                return new PathLine(v[0], v[1]);
            });
        }

        moveToDistance(n: number, t: AnimatableTile) {
            let distance = 0;
            for (const line of this.pathLines) {
                if (n < distance + line.distance) {
                    // found;
                    const pos = line.getDistancedPos(distance - n);
                    t.offsetXY = [pos[0] - t.bounds.x, pos[1] - t.bounds.y];
                    break;
                }
                distance += line.distance;
            }
        }

        pathDistance(pos: Vector2) {
            const lineIndex = this.pathLines.findIndex((f) => {
                const { start, end } = f;
                const [x, y] = pos;
                return (
                    (x > start[0] &&
                        x < end[0] &&
                        y > start[1] &&
                        x < end[1]) ||
                    (x === start[0] && y === start[1])
                );
            });
            if (lineIndex < 0) return 0;

            const linesToGo = this.pathLines.filter((_, i) => i >= lineIndex);
            return linesToGo.reduce((p, line, i) => {
                if (i === lineIndex) {
                    const start = pos;
                    const end = line.end;
                    const isHoriz = start[1] === end[1];
                    return (
                        p +
                        (isHoriz
                            ? Math.abs(end[0] - start[0])
                            : Math.abs(end[1] - start[1]))
                    );
                } else return p + line.distance;
            }, 0);
        }

        async renderAnimation(_: CanvasRenderingContext2D): Promise<void> {}

        async updateAnimation(dT: number) {
            this.frame++;

            this.traveled = this.traveled + dT * 1;

            if (this.totalDistance - this.traveled < 3)
                this.traveled = this.totalDistance;

            this.moveToDistance(this.traveled, this.objects[0]);

            if (this.traveled >= this.totalDistance) this.end();
        }
    }
}
