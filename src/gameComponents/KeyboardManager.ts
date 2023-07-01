import { Game } from "@/game";
import { Vector2, Vector_2 } from "@utils/utils";
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
    _mousePosition: Vector2;

    get mousePosition(): Vector2 {
        const mousePosInCanvas = Game.getNormalVector(this._mousePosition);
        const scaledPosInCanvas: Vector2 = [
            mousePosInCanvas[0] * this.mouseInputScale.x,
            mousePosInCanvas[1] * this.mouseInputScale.y,
        ];
        return Game.getRelativeVector(scaledPosInCanvas);
    }

    mouseInputScale: Vector_2;

    private firstUpdate = false;

    constructor() {
        window.onkeydown = this.handleKeyDown.bind(this);
        window.onkeyup = this.handleKeyUp.bind(this);
        window.onmousedown = this.handleMouseDown.bind(this);
        window.onmouseup = this.handleMouseUp.bind(this);
        window.oncontextmenu = (e) => e.preventDefault();
        window.onmousemove = this.handleMouseMove.bind(this);
        window.onresize = this.handleResize.bind(this);
        this.keysPressed = new Set();
        this.allowedKeys = new Set(["F12", "F5"]);
        this.mouseButtonsPressed = new Set();
        this.mouseButtonsClicked = new Set();
        this._mousePosition = [0, 0];
        this.mouseInputScale = { x: 1, y: 1 };
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
        this._mousePosition = [e.clientX, e.clientY];
    }
    handleKeyUp(e: KeyboardEvent) {
        this.keysPressed.delete(e.code);
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
    getMouseInputScaleFactors(): Vector_2 {
        if (!Game.instance) return { x: 1, y: 1 };

        const gameStyle = Game.instance.getComputedStyle();

        const gameWidth = parseFloat(gameStyle.width);
        const gameHeight = parseFloat(gameStyle.height);

        const Xscale = Game.WIDTH / gameWidth;
        const Yscale = Game.HEIGHT / gameHeight;

        return { x: Xscale, y: Yscale };
    }
    handleResize() {
        if (!Game.instance) return;
        // save the window ratio
        if (matchMedia("(max-height: 805px)").matches) {
            const newWidth = (Game.WIDTH / Game.HEIGHT) * window.innerHeight;
            Game.instance.style.maxWidth = Math.min(newWidth, 600) + "px";
        } else {
            Game.instance.style.maxWidth = "";
        }
        this.mouseInputScale = this.getMouseInputScaleFactors();
    }
    update() {
        this.mouseButtonsClicked = new Set();
        if (!this.firstUpdate) {
            this.handleResize();
            this.firstUpdate = true;
        }
    }
}
