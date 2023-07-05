export interface Updateable {
    update: (time: number) => Promise<void>;
}
export interface Renderable {
    render: (ctx: CanvasRenderingContext2D) => Promise<void>;
}
