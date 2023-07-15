import { GameAnimation } from "@components/Animation/animation";
import { AnimatedSlider } from "../objects/animatedSlider";

export namespace LevelSliderAnimation {
    export class animation extends GameAnimation<[AnimatedSlider]> {
        constructor(id: string, end: () => void, slider: AnimatedSlider) {
            super(id, end, slider);
        }

        async renderAnimation(_: CanvasRenderingContext2D): Promise<void> {}
        async updateAnimation(_: number): Promise<void> {
            console.log("LSu");
        }
    }
}
