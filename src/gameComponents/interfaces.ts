export interface Updateable {
    update: (time: number) => void;
}
export interface Renderable {
    render: (ctx: CanvasRenderingContext2D) => void;
}
