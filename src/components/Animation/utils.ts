export interface PixellFrameData {
    frame: { x: number; y: number; w: number; h: number };
    sourceSize: { w: number; h: number };
}

export interface PixellAnimData {
    frames: Record<string, PixellFrameData>;
}
