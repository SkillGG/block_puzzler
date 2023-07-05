import { Game } from "@/game";
import { Vector2 } from "@utils/utils";
import { BoundedGameObject } from "@component/GameObject";
import {
    LEFT_MOUSE_BUTTON,
    RIGHT_MOUSE_BUTTON,
} from "@component/KeyboardManager";
import { Label, LabelWithBorderStyle } from "@primitive/Label/Label";
import { RectangleBounds } from "@primitive/Rectangle/RectangleBounds";

export interface ButtonMouseEvent {
    mousePos: Vector2;
    target: Button;
}

export interface ButtonClickEvent extends ButtonMouseEvent {
    button: Set<"left" | "middle" | "right">;
}

type ButtonStyle = LabelWithBorderStyle;

interface ButtonOnCalls {
    onclick?: (ev: ButtonClickEvent) => void;
    onenter?: (ev: ButtonMouseEvent) => void;
    onleave?: (ev: ButtonMouseEvent) => void;
}

export class Button extends BoundedGameObject {
    label: Label;
    onCalls: ButtonOnCalls;
    constructor(
        id: string,
        bounds: RectangleBounds,
        on: ButtonOnCalls,
        label?: string,
        style?: ButtonStyle,
        zIndex?: number
    ) {
        super(id, bounds, zIndex);
        this.onCalls = on;
        this.label = new Label(`${id}_label`, bounds, label, style);
    }
    isIn: boolean = false;
    async update() {
        const { _mousePosition: mousePos } = Game.input;
        const MouseEvent = { mousePos, target: this };
        if (Game.input.isPointerIn(this.bounds)) {
            if (this.isIn === false) this.onCalls.onenter?.(MouseEvent);
            this.isIn = true;
        } else {
            if (this.isIn === true) this.onCalls.onleave?.(MouseEvent);
            this.isIn = false;
        }
        if (Game.input.pointerButtonsClicked.size > 0 && this.isIn) {
            this.onCalls.onclick?.({
                ...MouseEvent,
                button: new Set(
                    [...Game.input.pointerButtonsClicked].map((q) =>
                        q === LEFT_MOUSE_BUTTON
                            ? "left"
                            : q === RIGHT_MOUSE_BUTTON
                            ? "right"
                            : "middle"
                    )
                ),
            });
        }
    }
    async render(ctx: CanvasRenderingContext2D) {
        await this.label.render(ctx);
    }
}
