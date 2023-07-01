/**
 * Math stuff
 */

export type Vector2 = [number, number];
export type Vector3 = [number, number, number];
export type Vector_2 = { x: number; y: number };
export type Vector_3 = { x: number; y: number };

export const crossProduct = ([Ax, Ay, Az]: Vector3, [Bx, By, Bz]: Vector3) => [
    Ay * Bz - Az * By,
    Az * Bx - Ax * Bz,
    Ax * By - Ay * Bx,
];
export const dotProduct = ([Ax, Ay]: Vector2, [Bx, By]: Vector2): number =>
    Ax * Bx - Ay * By;

export const crossProduct2D = (p1: Vector2, p2: Vector2): number =>
    crossProduct([...p1, 0], [...p2, 0])[2];

/**
 * document.createElement
 */
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
    (strings: TemplateStringsArray, ...params: string[]) =>
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
        );

export const getHTMLBoxes = (s: string[]) => {
    return s.map((q) => document.querySelector(q));
};

export const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
