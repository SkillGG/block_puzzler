// #region Math

export type Vector2 = [number, number];
export type Vector3 = [number, number, number];
export type Vector4 = [number, number, number, number];
export type Vector_2 = { x: number; y: number };
export type Vector_3 = { x: number; y: number; z: number };
export type Vector_4 = { x: number; y: number; z: number; w: number };

export const crossProduct = ([Ax, Ay, Az]: Vector3, [Bx, By, Bz]: Vector3) => [
    Ay * Bz - Az * By,
    Az * Bx - Ax * Bz,
    Ax * By - Ay * Bx,
];
export const dotProduct = ([Ax, Ay]: Vector2, [Bx, By]: Vector2): number =>
    Ax * Bx - Ay * By;

export const crossProduct2D = (p1: Vector2, p2: Vector2): number =>
    crossProduct([...p1, 0], [...p2, 0])[2];

export const lerp = (v0: number, v1: number, t: number) =>
    (1 - t) * v0 + t * v1;

export const lerpPos = (pos1: Vector2, pos2: Vector2, t: number) => {
    const [x1, y1] = pos1;
    const [x2, y2] = pos2;
    return [lerp(x1, x2, t), lerp(y1, y2, t)] as Vector2;
};

export const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomWeightedNumber = <T>(weights: [number, T][]): T => {
    const weightSum = weights.reduce((p, n) => p + n[0], 0);

    const rand = Math.random() * weightSum;

    let sum = 0;

    for (const [weight, value] of weights) {
        sum += weight;
        if (rand <= sum) return value;
    }
    return weights[weights.length - 1][1];
};

// #endregion Math

// #region DOM

type PropList = Record<string, string>;
type ChildArray = HTMLElement[];

export const $$ = (
    name: string = "div",
    props: PropList = {},
    children: ChildArray = [],
    innerHTML: string = ""
): HTMLElement => {
    if (!name) name = "div";
    const nameRX = /^(.*?)((?:\.|#).*)*$/.exec(name);
    if (nameRX && nameRX[1] !== undefined) {
        name = nameRX[1] || "div";
        const specifier = nameRX[2];
        const classes: string[] = [];
        const classRX = /\.(.*?)(?=\.|#|$)/g;
        let foundClass: RegExpExecArray | null;
        while ((foundClass = classRX.exec(specifier))) {
            classes.push(foundClass[1]);
        }
        let id = "";
        const idRX = /\#(.*?)(?=\.|#|$)/g;
        let foundID: RegExpExecArray | null;
        while ((foundID = idRX.exec(specifier))) {
            id = foundID[1];
        }
        props.id = props.id || id;
        props["class"] =
            (props["class"] ? props["class"] + " " : "") + classes.join(" ");
        if (!props["class"]) delete props["class"];
        if (!props.id) delete props.id;
    }
    const element = document.createElement(name);
    Object.entries(props || []).forEach((prop) => {
        element.setAttribute(prop[0], prop[1]);
    });
    element.innerHTML = innerHTML;
    children?.forEach((ch) => element.append(ch));
    return element;
};

export const $ =
    <T extends HTMLElement>(
        strings: TemplateStringsArray,
        ...params: string[]
    ) =>
    ({
        props: p,
        children: c,
        _html: h,
    }: { props?: PropList; children?: ChildArray; _html?: string } = {}) =>
        $$(
            strings.reduce((p, n, i) => {
                return `${p}${n}${params[i] || ""}`;
            }, ""),
            p,
            c,
            h
        ) as T;

export const getHTMLBoxes = (s: string[]) => {
    return s.map((q) => document.querySelector(q));
};

export class CleanableCanvas extends OffscreenCanvas {
    clearCanvas(w?: number, h?: number) {
        if (w) this.width = w;
        if (h) this.height = h;
        const ctx = this.getContext("2d");
        ctx?.clearRect(0, 0, this.width, this.height);
    }
}

// #endregion DOM

// #region Images

type ColorData = [number, number, number, number];

const colorCache: Record<string, ColorData | null> = {};

const memoColor = (
    factory: (ctx: CanvasRenderingContext2D, c?: string) => ColorData | null,
    ctx: CanvasRenderingContext2D
) => {
    return function (color?: string) {
        if (!color) return null;
        if (!(color in colorCache)) {
            colorCache[color] = factory(ctx, color);
        }
        return colorCache[color];
    };
};

export const colorToRGBA: (color?: string) => ColorData | null = (function (): (
    c?: string
) => ColorData | null {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => null;
    return memoColor((x, c) => {
        if (!c) return null;
        x.clearRect(0, 0, 1, 1);
        x.fillStyle = "#000";
        x.fillStyle = c;
        var computed = x.fillStyle;
        x.fillStyle = "#fff";
        x.fillStyle = c;
        if (computed !== x.fillStyle) {
            return null; // invalid color
        }
        x.fillRect(0, 0, 1, 1);
        return [...x.getImageData(0, 0, 1, 1).data] as ColorData;
    }, ctx);
})();

export const colorOrFallbackColorToRGBA = (
    color: string,
    fallbackColor: string
) => {
    // Don't short-circuit getting the fallback RGBA -
    // it's already memoized, and we want to show an error
    // if the fallback color is invalid even if the main color is valid
    const fallbackRGBA = colorToRGBA(fallbackColor);
    if (!fallbackRGBA) {
        throw new Error(
            `Invalid fallbackColor ${
                fallbackColor != null
                    ? JSON.stringify(fallbackColor)
                    : fallbackColor
            }`
        );
    }
    return colorToRGBA(color) || fallbackRGBA;
};

export const colorDataToString = (d: ColorData | null) => {
    if (!d) return null;
    if (d.find((n) => n > 255 || n < 0)) return "#0000";
    else
        return (
            `#` + d.reduce((p, n) => p + n.toString(16).padStart(2, "0"), "")
        );
};

export const imageDataToImage = async (d: ImageData) => {
    return await createImageBitmap(d);
};

export const loadImg = (
    src: string | HTMLImageElement
): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
        let img: HTMLImageElement;
        if (typeof src === "string") {
            img = new Image();
            img.src = src;
        } else img = src;

        img.onload = () => res(img);
        img.onerror = (e) => rej(e);
    });

export const createNewCanvas = () => {
    const can = $<HTMLCanvasElement>`canvas`();
    const ctx = can.getContext("2d");
    if (!ctx) throw "Canvas context couldn't be created!";
    return { e: can, ctx } as const;
};

export const applyTintToBitmap = async (
    img: ImageBitmap,
    tint: string
): Promise<string> => {
    const can = document.createElement("canvas");
    const ctx = can.getContext("2d");
    const { width: w, height: h } = img;
    can.width = w;
    can.height = h;
    if (!ctx) throw null;
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(img, 0, 0);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(img, 0, 0);
    const newSRC = can.toDataURL();
    return newSRC;
};

// #endregion Images

// #region Game interfaces

export interface Updateable {
    update: (time: number) => Promise<void>;
}
export interface Renderable {
    render: (ctx: CanvasRenderingContext2D) => Promise<void>;
}

// #endregion Game interfaces
