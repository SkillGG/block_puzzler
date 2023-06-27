import { Game } from "@/game";
import { Vector2 } from "@utils/utils";
import { RectangleBounds } from "./Primitives/Rectangle/RectangleBounds";
import { Updateable } from "./interfaces";

export const LEFT_MOUSE_BUTTON = 0;
export const MIDDLE_MOUSE_BUTTON = 1;
export const RIGHT_MOUSE_BUTTON = 2;

export class InputManager implements Updateable {
    keysPressed: Set<string>;
    mouseButtonsPressed: Set<number>;
    mouseButtonsClicked: Set<number>;
    allowedKeys: Set<string>;
    mousePosition: Vector2;
    constructor() {
        window.onkeydown = this.handleKeyDown.bind(this);
        window.onkeyup = this.handleKeyUp.bind(this);
        window.onmousedown = this.handleMouseDown.bind(this);
        window.onmouseup = this.handleMouseUp.bind(this);
        window.oncontextmenu = (e) => e.preventDefault();
        window.onmousemove = this.handleMouseMove.bind(this);
        this.keysPressed = new Set();
        this.allowedKeys = new Set(["F12", "F5"]);
        this.mouseButtonsPressed = new Set();
        this.mouseButtonsClicked = new Set();
        this.mousePosition = [0, 0];
    }
    isMouseIn(rect: RectangleBounds) {
        const checkRect = new RectangleBounds(
            Game.getRelativeVector(rect.getPosition()),
            rect.getSize()
        );
        return checkRect.hasPoint(this.mousePosition);
    }
    hasMouseClicked(button: number) {
        return this.mouseButtonsClicked.has(button);
    }
    isPressed(code: string) {
        return this.keysPressed.has(code);
    }
    isCtrl(): false | "Left" | "Right" | "Both" {
        let ret = 0;
        if (this.keysPressed.has("ControlLeft")) ret += 1;
        if (this.keysPressed.has("ControlRight")) ret += 2;
        return ret === 0
            ? false
            : ret === 1
            ? "Left"
            : ret === 2
            ? "Right"
            : "Both";
    }
    isShift(): false | "Left" | "Right" | "Both" {
        let ret = 0;
        if (this.keysPressed.has("ShiftLeft")) ret += 1;
        if (this.keysPressed.has("ShiftRight")) ret += 2;
        return ret === 0
            ? false
            : ret === 1
            ? "Left"
            : ret === 2
            ? "Right"
            : "Both";
    }
    handleKeyDown(e: KeyboardEvent) {
        this.keysPressed.add(e.code);
        if (!this.allowedKeys.has(e.code)) e.preventDefault();
    }
    handleMouseMove(e: MouseEvent) {
        this.mousePosition = [e.clientX, e.clientY];
    }
    handleKeyUp(e: KeyboardEvent) {
        this.keysPressed.delete(e.code);
        console.log("key up ", e.code);
        e.preventDefault();
    }
    handleMouseUp(e: MouseEvent) {
        this.mouseButtonsPressed.delete(e.button);
        this.mouseButtonsClicked.add(e.button);
        e.preventDefault();
    }
    handleMouseDown(e: MouseEvent) {
        this.mouseButtonsPressed.add(e.button);
        e.preventDefault();
    }
    update() {
        this.mouseButtonsClicked = new Set();
    }
}
